import { PrismaClient } from '@prisma/client'; // PrismaClient : pour interagir avec la base de données via Prisma ORM
import jwt from 'jsonwebtoken'; // jsonwebtoken (jwt) : pour vérifier et décoder le token d’authentification

// --- Initialisation de Prisma ---
const prisma = new PrismaClient();

// Clé secrète utilisée pour signer et vérifier les tokens JWT
// Doit être identique à celle utilisée lors de la génération du token dans login.js
const JWT_SECRET = process.env.JWT_SECRET;

// --- Route API principale ---
// Cette fonction est appelée lorsqu’un utilisateur (employé) souhaite récupérer ses tâches assignées
export default async function handler(req, res) {
  // --- Étape 1 : Vérifier la méthode HTTP ---
  // On autorise uniquement les requêtes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

// --- Étape 2 : Récupérer et valider le token JWT ---
// On attend un en-tête "Authorization" du type "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token not found' });
  }

  // Extraction du token depuis l’en-tête
  const token = authHeader.split(' ')[1];

  try {
    // --- Étape 3 : Vérifier et décoder le token ---
    // Si le token est invalide ou expiré, une erreur sera levée
    const decoded = jwt.verify(token, JWT_SECRET);
    // On récupère l’identifiant de l’utilisateur connecté depuis le token
    const userId = decoded.userId;

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
    // Si le token est invalide ou expiré, on renvoie une erreur 401
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}