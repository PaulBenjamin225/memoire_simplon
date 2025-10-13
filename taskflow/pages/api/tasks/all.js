import { PrismaClient } from '@prisma/client'; // import de Prisma : outil ORM pour communiquer avec la base de données
import jwt from 'jsonwebtoken'; // import de JWT : pour vérifier et décoder le token d'authentification

// --- Initialisation du client Prisma ---
const prisma = new PrismaClient();
// --- Récupération de la clé secrète utilisée pour décoder les tokens JWT ---
// Elle est stockée dans les variables d’environnement pour des raisons de sécurité
const JWT_SECRET = process.env.JWT_SECRET;

// --- Handler principal pour la route /api/tasks (GET uniquement) ---
export default async function handler(req, res) {
  // Étape 1 : Vérification de la méthode HTTP
  // Cette route n’accepte que les requêtes GET (lecture des tâches)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
 // Étape 2 : Vérification du token d'authentification
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  // Extraction du token JWT
  const token = authHeader.split(' ')[1];

  try {
    // Étape 3 : Vérification et décodage du token JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Étape 4 : Contrôle des permissions
    // Seuls les utilisateurs ayant le rôle "MANAGER" peuvent accéder à cette route
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    // Étape 5 : Récupération des tâches dans la base de données
    // Prisma permet ici de récupérer toutes les tâches triées par date de création décroissante
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }, // Trie les tâches les plus récentes en premier
      include: {
        assignedTo: {
          select: { name: true }, // Inclut le nom de la personne assignée à chaque tâche
        },
      },
    });

    // Réponse réussie avec la liste des tâches
    res.status(200).json(tasks);
  } catch (error) {
    // En cas de token invalide ou expiré
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}