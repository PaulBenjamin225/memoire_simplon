import { PrismaClient } from '@prisma/client'; // import de PrismaClient : fourni par Prisma, permet de communiquer avec la base de données via un ORM.
import jwt from 'jsonwebtoken'; // import de jsonwebtoken : bibliothèque utilisée pour vérifier et décoder les tokens JWT (authentification sécurisée).

// --- Initialisation du client Prisma ---
const prisma = new PrismaClient();
// --- Clé secrète JWT ---
const JWT_SECRET = process.env.JWT_SECRET; // Bonne pratique: utiliser les variables d'environnement

// --- Fonction principale de la route API ---
// Cette route permet à un MANAGER de récupérer la liste des utilisateurs enregistrés dans la base.
export default async function handler(req, res) {
  // Étape 1 : Vérifier que la méthode HTTP utilisée est bien "GET"
  // Si quelqu’un envoie une requête POST, PUT ou DELETE sur cette route → erreur 405 (Method Not Allowed)
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  // Étape 2 : Vérifier l’authentification via le token JWT
  // Le token est envoyé dans l’en-tête HTTP "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;
  // Si le header est absent ou mal formé → accès refusé
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non authentifié : Aucun Token fourni' });
  }

    // Extraction du token (on enlève le mot "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Étape 3 : Vérifier et décoder le token avec la clé secrète
    const decoded = jwt.verify(token, JWT_SECRET);
     // Étape 4 : Vérifier le rôle de l’utilisateur
    // Seuls les utilisateurs ayant le rôle "MANAGER" peuvent voir la liste complète des utilisateurs
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Interdit : Accès refusé' });
    }

   // Étape 5 : Requête dans la base de données
    // On récupère tous les utilisateurs avec uniquement les champs utiles à l’administration.
    const users = await prisma.user.findMany({
      select: { 
        id: true,    // Identifiant unique de l’utilisateur
        name: true,  // Nom de l’utilisateur
        email: true, // Adresse email
        role: true,  // Rôle : "EMPLOYEE" ou "MANAGER"
      },
      orderBy: { 
        createdAt: 'desc', // Trie les résultats du plus récent au plus ancien
      },
    });

    // Étape 6 : Réponse envoyée au client
    // Si tout s’est bien passé, on renvoie la liste des utilisateurs en JSON
    res.status(200).json(users);

  } catch (error) {
    // Étape 7 : Gestion des erreurs
    // Cas 1 : Token invalide ou expiré
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
    // Gère les autres erreurs potentielles
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}