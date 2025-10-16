import { PrismaClient } from '@prisma/client'; // import de PrismaClient : pour interagir avec la base de données via Prisma ORM
import jwt from 'jsonwebtoken'; // import de jsonwebtoken (jwt) : pour vérifier et décoder le token d’authentification

// --- Initialisation de Prisma ---
const prisma = new PrismaClient();

// Clé secrète utilisée pour signer et vérifier les tokens JWT
const JWT_SECRET = process.env.JWT_SECRET;

// --- Route API principale ---

export default async function handler(req, res) { // Cette fonction est appelée lorsqu’un utilisateur (employé) souhaite récupérer ses tâches assignées
  // --- Étape 1 : Vérifier la méthode HTTP ---
  if (req.method !== 'GET') { // On autorise uniquement les requêtes GET
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

// --- Étape 2 : Récupérer et valider le token JWT ---
  const authHeader = req.headers.authorization; // On Vérifie que la requête contient un en-tête Authorization au format : Authorization: Bearer <token>
  if (!authHeader || !authHeader.startsWith('Bearer ')) { 
    return res.status(401).json({ message: 'Token d’autorisation non trouvé' }); // Si l’en-tête est absent ou mal formé, on renvoie une erreur 401 (non autorisé)
  }
  const token = authHeader.split(' ')[1]; // Extraction du token depuis l’en-tête

  try {
    // --- Étape 3 : Vérifier et décoder le token ---
    const decoded = jwt.verify(token, JWT_SECRET); // Si le token est invalide ou expiré, une erreur sera levée
    const userId = decoded.userId; // On récupère l’identifiant de l’utilisateur connecté depuis le token

    // --- Étape 4 : Récupérer les tâches de cet utilisateur ---
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: userId, // On ne récupère que les tâches assignées à cet utilisateur
      },
      orderBy: {
        deadline: 'asc', // On trie les tâches par date limite (les plus urgentes d’abord)
      },
    });

  // --- Étape 5 : Retourner les tâches trouvées ---
    res.status(200).json(tasks);
  } catch (error) {
    // --- Gestion des erreurs ---
    res.status(401).json({ message: 'Token invalide ou expiré' }); // Si le token est invalide ou expiré, on renvoie une erreur 401
  }
}