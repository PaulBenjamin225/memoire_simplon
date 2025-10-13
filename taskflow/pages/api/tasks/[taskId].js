import { PrismaClient } from '@prisma/client'; // import de Prisma pour interagir avec la base de données
import jwt from 'jsonwebtoken'; // import JWT pour vérifier et décoder les tokens d'authentification

// Initialisation du client Prisma pour les opérations DB
const prisma = new PrismaClient();
// Clé secrète pour vérifier les tokens JWT
const JWT_SECRET = process.env.JWT_SECRET;

// --- Handler principal pour la route /api/tasks/[taskId] ---
export default async function handler(req, res) {
  // Récupère l'ID de la tâche depuis la query string
  const { taskId } = req.query;

  // --- Étape 1 : Authentification et permissions ---
  const authHeader = req.headers.authorization; // Récupère le token dans les headers
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token d’autorisation non trouvé' });
  }
  const token = authHeader.split(' ')[1]; // Extraction du token
  
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET); // Vérification et décodage du token
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
  const { userId, role } = decoded; // Récupère l'ID et le rôle de l'utilisateur depuis le token

// --- Étape 2 : Gestion des méthodes HTTP ---
// PATCH = Mise à jour de la tâche
  if (req.method === 'PATCH') {
    
    // --- CAS 1 : Le Manager peut modifier tous les champs ---
    if (role === 'MANAGER') {
      const { title, description, deadline, assignedToId, status } = req.body;
      
      // On construit dynamiquement un objet avec seulement les champs fournis pour la mise à jour
      const dataToUpdate = {};
      if (title) dataToUpdate.title = title;
      if (description !== undefined) dataToUpdate.description = description; // Permet de mettre une description vide
      if (deadline) dataToUpdate.deadline = new Date(deadline); // Conversion en date
      if (assignedToId) dataToUpdate.assignedToId = assignedToId;
      if (status) dataToUpdate.status = status;

      // Vérifier si au moins un champ est fourni
      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'Pas de champs à mettre à jour fournis.' });
      }

      try {
        // Mise à jour de la tâche dans la base
        const updatedTask = await prisma.task.update({
          where: { id: taskId },
          data: dataToUpdate,
          include: { assignedTo: { select: { name: true } } } // Retourne également le nom de l'utilisateur assigné
        });
        return res.status(200).json(updatedTask);
      } catch (error) {
        return res.status(500).json({ message: 'Échec de la mise à jour de la tâche', error: error.message });
      }

    } 
    
    // --- CAS 2 : Employee ne peut modifier que le statut de sa propre tâche ---
    else if (role === 'EMPLOYEE') {
      // Un employé ne peut modifier que le statut de ses propres tâches
      const { status } = req.body;

      // Vérification du statut fourni
      if (!status || (status !== 'TODO' && status !== 'DONE')) {
        return res.status(400).json({ message: 'Statut invalide ou manquant fourni' });
      }
      
      try {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
          return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        // Vérification que l'utilisateur est bien assigné à cette tâche
        if (task.assignedToId !== userId) {
          return res.status(403).json({ message: 'Interdit : Vous ne pouvez pas modifier cette tâche' });
        }

        // Mise à jour du statut de la tâche
        const updatedTask = await prisma.task.update({
          where: { id: taskId },
          data: { status: status },
        });
        return res.status(200).json(updatedTask);
      } catch (error) {
        return res.status(500).json({ message: 'Quelque chose s’est mal passé lors de la mise à jour des employés', error: error.message });
      }
    }
  } 
  // DELETE = Suppression d'une tâche
  else if (req.method === 'DELETE') {
    // Seul un manager peut supprimer une tâche
    if (role !== 'MANAGER') {
      return res.status(403).json({ message: 'Interdit : Vous n’êtes pas autorisé à supprimer des tâches' });
    }
    
    try {
      await prisma.task.delete({
        where: { id: taskId },
      });
      res.status(204).end(); // Réponse succès sans contenu
    } catch (error) {
      // Gestion des erreurs spécifiques Prisma
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(500).json({ message: 'Failed to delete task', error: error.message });
    }
  } 
  // Si la méthode n'est ni PATCH ni DELETE
  else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}