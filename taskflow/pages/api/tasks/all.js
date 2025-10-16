import { PrismaClient } from '@prisma/client'; // import de Prisma : outil ORM pour communiquer avec la base de données
import jwt from 'jsonwebtoken'; // import de JWT : pour vérifier et décoder le token d'authentification

// --- Initialisation du client Prisma ---
const prisma = new PrismaClient();
// --- Récupération de la clé secrète utilisée pour décoder les tokens JWT ---
const JWT_SECRET = process.env.JWT_SECRET; // Elle est stockée dans les variables d’environnement pour des raisons de sécurité

// --- Handler principal pour la route /api/tasks (GET uniquement) ---
export default async function handler(req, res) {
  // Étape 1 : Vérification de la méthode HTTP
  
  if (req.method !== 'GET') { // Cette route n’accepte que les requêtes GET (lecture des tâches)
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
 // Étape 2 : Vérification du token d'authentification
  const authHeader = req.headers.authorization; // Récupération de l’en-tête d’autorisation
  if (!authHeader || !authHeader.startsWith('Bearer ')) { 
    return res.status(401).json({ message: 'Non authentifié' }); // Si l’en-tête est absent ou mal formé, on renvoie une erreur 401 
  }
  const token = authHeader.split(' ')[1]; // Extraction du token JWT de l’en-tête

  try {
    // Étape 3 : Vérification et décodage du token JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Étape 4 : Contrôle des permissions
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Interdit : Accès refusé' }); // Seuls les utilisateurs ayant le rôle "MANAGER" peuvent accéder à cette route
    }

    // Étape 5 : Récupération des tâches dans la base de données
    const tasks = await prisma.task.findMany({ // récupére toutes les tâches triées par date de création décroissante
      orderBy: { createdAt: 'desc' }, // Trie les tâches les plus récentes en premier
      include: {
        assignedTo: {
          select: { name: true }, // Inclut le nom de la personne assignée à chaque tâche
        },
      },
    });
    res.status(200).json(tasks); // Réponse réussie avec la liste des tâches
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré' }); // En cas de token invalide ou expiré
  }
}