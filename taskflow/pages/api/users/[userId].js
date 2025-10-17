import { PrismaClient } from '@prisma/client'; // import de PrismaClient : permet d’interagir avec la base de données (ORM).
import jwt from 'jsonwebtoken'; // import de jsonwebtoken : permet de vérifier et décoder les tokens JWT pour l’authentification.

const prisma = new PrismaClient(); // Initialisation du client Prisma
const JWT_SECRET = process.env.JWT_SECRET; // Récupération de la clé secrète utilisée pour signer et vérifier les tokens JWT

// --- Définition du gestionnaire principal de la route API ---
// Cette route permet à un MANAGER de mettre à jour les informations d’un utilisateur (nom, email, rôle, ou statut actif)
export default async function handler(req, res) {

  // --- Étape 1 : Récupération de l'ID utilisateur depuis la requête ---
  const { userId } = req.query; // L’ID est transmis dans l’URL sous forme de paramètre de requête : /api/users/[userId]

// --- Étape 2 : Vérification du token JWT (authentification + autorisation) ---
  const authHeader = req.headers.authorization; // Récupération du token JWT depuis l’en-tête Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) { // Si l’en-tête est absent ou mal formaté
    return res.status(401).json({ message: 'Non authentifié' }); // → accès refusé
  }

  // Si aucun token n’est présent ou mal formaté → accès refusé
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Vérification du token avec la clé secrète
    // On s’assure que seul un utilisateur avec le rôle MANAGER peut effectuer cette opération
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Interdit : Vous n’êtes pas autorisé à modifier les utilisateurs.' }); // Accès refusé
    }
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' }); // Si le token est invalide ou expiré
  }

  // --- Étape 3 : Autoriser uniquement la méthode PATCH ---
  if (req.method === 'PATCH') {
    const { name, email, role, isActive } = req.body; // On récupère les champs envoyés dans le corps de la requête
    const dataToUpdate = {}; // Création d’un objet dynamique contenant uniquement les champs à mettre à jour
    // Mise à jour conditionnelle des champs selon ce qui a été envoyé
    if (name) dataToUpdate.name = name; // On ajoute le champ name s’il est présent
    if (email) dataToUpdate.email = email; // On ajoute le champ email s’il est présent
    if (role) dataToUpdate.role = role; // On ajoute le champ role s’il est présent
    
    // Cas particulier : isActive peut être `false`, donc on vérifie `!== undefined`
    if (isActive !== undefined) {
      dataToUpdate.isActive = isActive;
    }
    // Si aucun champ n’est fourni → on renvoie une erreur
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: 'Pas de champs à mettre à jour fournis.' });
    }

    try {
      // --- Étape 4 : Mise à jour de l’utilisateur en base ---
      const updatedUser = await prisma.user.update({
        where: { id: userId }, // L’utilisateur ciblé
        data: dataToUpdate, // Les champs à mettre à jour
        // On sélectionne uniquement les champs sécurisés à renvoyer
        select: { 
          id: true, 
          name: true, 
          email: true, 
          role: true, 
          isActive: true }
      });
      // --- Étape 5 : Réponse de succès ---
      res.status(200).json(updatedUser);
    } catch (error) {
      // --- Étape 6 : Gestion des erreurs ---
      // Cas particulier : tentative d’utiliser un email déjà existant
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Cet e-mail est déjà utilisé.' });
      }
      res.status(500).json({ message: 'Échec de la mise à jour de l’utilisateur.', error: error.message });
    }
  } 
  
  // --- CAS de Suppression d'un users ---
  else if (req.method === 'DELETE') {
    try {
      // --- Étape 1 (DELETE) : Suppression des enregistrements dépendants ---
      // Avant de supprimer un utilisateur, on doit supprimer toutes les tâches qui lui sont assignées
      // pour éviter une erreur de contrainte de clé étrangère dans la base de données.
      await prisma.task.deleteMany({
        where: { assignedToId: userId },
      });

      // --- Étape 2 (DELETE) : Suppression de l'utilisateur ---
      await prisma.user.delete({
        where: { id: userId },
      });
      
      // --- Étape 3 (DELETE) : Réponse de succès ---
      res.status(204).end(); // 204 No Content : la suppression a réussi, pas de contenu à renvoyer.
    } catch (error) {
      // --- Étape 4 (DELETE) : Gestion des erreurs ---
      // Si l'utilisateur à supprimer n'a pas été trouvé (code d'erreur Prisma)
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      res.status(500).json({ message: 'Échec de la suppression de l’utilisateur.', error: error.message });
    }

  } 
  else {
    // Si la méthode n’est ni PATCH ni DELETE → on informe le client de la méthode autorisée
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}