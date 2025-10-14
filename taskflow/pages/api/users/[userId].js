import { PrismaClient } from '@prisma/client'; // import de PrismaClient : permet d’interagir avec la base de données (ORM).
import jwt from 'jsonwebtoken'; // import de jsonwebtoken : permet de vérifier et décoder les tokens JWT pour l’authentification.

// --- Initialisation du client Prisma ---
const prisma = new PrismaClient();
// --- Récupération de la clé secrète utilisée pour signer et vérifier les tokens JWT ---
const JWT_SECRET = process.env.JWT_SECRET;

// --- Définition du gestionnaire principal de la route API ---
// Cette route permet à un MANAGER de mettre à jour les informations d’un utilisateur (nom, email, rôle, ou statut actif)
export default async function handler(req, res) {
  // --- Étape 1 : Récupération de l'ID utilisateur depuis la requête ---
  // L’ID est transmis dans l’URL sous forme de paramètre de requête : /api/users/[userId]
  const { userId } = req.query; 

// --- Étape 2 : Vérification du token JWT (authentification + autorisation) ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  // Si aucun token n’est présent ou mal formaté → accès refusé
  const token = authHeader.split(' ')[1];
  try {
    // Vérification du token avec la clé secrète
    const decoded = jwt.verify(token, JWT_SECRET);
    // On s’assure que seul un utilisateur avec le rôle MANAGER peut effectuer cette opération
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Interdit : Vous n’êtes pas autorisé à modifier les utilisateurs.' });
    }
  } catch (error) {
    // Si le token est invalide ou expiré
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }

  // --- Étape 3 : Autoriser uniquement la méthode PATCH ---
  if (req.method === 'PATCH') {
    // On récupère les champs envoyés dans le corps de la requête
    const { name, email, role, isActive } = req.body;

    // Création d’un objet dynamique contenant uniquement les champs à mettre à jour
    const dataToUpdate = {};
    // Mise à jour conditionnelle des champs selon ce qui a été envoyé
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (role) dataToUpdate.role = role;
    
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
  } else {
    // Si la méthode n’est pas PATCH → on informe le client de la méthode autorisée
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}