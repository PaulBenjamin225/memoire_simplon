import { PrismaClient } from '@prisma/client'; // import de Prisma : pour interagir facilement avec la base de données
import jwt from 'jsonwebtoken'; // import de JWT : pour vérifier et décoder le token d’authentification

// --- Initialisation du client Prisma ---
const prisma = new PrismaClient();
// --- Récupération de la clé secrète utilisée pour signer les tokens JWT ---
const JWT_SECRET = process.env.JWT_SECRET;
// --- Handler principal pour la route /api/tasks (POST uniquement) ---
export default async function handler(req, res) {
  // Étape 1 : Vérifier que la méthode HTTP est bien POST
  // Cette route sert uniquement à créer une nouvelle tâche
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  // Étape 2 : Vérification de l’authentification
  // On vérifie la présence du token dans les en-têtes de la requête
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  // Extraction du token
  const token = authHeader.split(' ')[1];
  try {
    // Vérification et décodage du token JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Étape 3 : Vérification du rôle de l’utilisateur
    // Seuls les utilisateurs ayant le rôle "MANAGER" peuvent créer une tâche
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Interdit : Accès refusé' });
    }
  } catch (error) {
    // Si le token est invalide ou expiré
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }

  // Étape 4 : Extraction et validation des données envoyées dans le corps de la requête
  const { title, description, deadline, assignedToId } = req.body;

  // Vérification que les champs obligatoires sont bien fournis
  if (!title || !deadline || !assignedToId) {
    return res.status(400).json({ message: 'Champs obligatoires manquants' });
  }

  try {
    // Étape 5 : Création de la nouvelle tâche dans la base de données
    const newTask = await prisma.task.create({
      data: {
        title, // Titre de la tâche
        description: description || null, // La description est optionnelle
        deadline: new Date(deadline), // Conversion de la date (string → objet Date)
        assignedToId, // ID de l’utilisateur à qui la tâche est assignée
      },
      // On inclut les infos de l'employé pour le retour
      include: {
        assignedTo: { select: { name: true } } // Inclure le nom de la personne assignée dans la réponse
      }
    });

    // Étape 6 : Réponse réussie (statut 201 = créé)
    res.status(201).json(newTask);
  } catch (error) {
    // Gestion des erreurs internes (problème base de données, etc.)
    res.status(500).json({ message: 'Échec de la création de la tâche', error: error.message });
  }
}