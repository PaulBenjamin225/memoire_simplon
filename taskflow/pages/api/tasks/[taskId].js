import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { taskId } = req.query;

  // --- Étape 1: Sécurité - Vérifier l'authentification et les permissions ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token not found' });
  }
  const token = authHeader.split(' ')[1];
  
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  const { userId, role } = decoded;

  // --- Étape 2: Gérer la méthode de la requête (Mise à jour ou Suppression) ---

  // Si la requête est une mise à jour (PATCH)
  if (req.method === 'PATCH') {
    
    // CAS 1 : L'utilisateur est un MANAGER
    if (role === 'MANAGER') {
      const { title, description, deadline, assignedToId, status } = req.body;
      
      // On construit dynamiquement un objet avec seulement les champs fournis pour la mise à jour
      const dataToUpdate = {};
      if (title) dataToUpdate.title = title;
      if (description !== undefined) dataToUpdate.description = description; // Permet de mettre une description vide
      if (deadline) dataToUpdate.deadline = new Date(deadline);
      if (assignedToId) dataToUpdate.assignedToId = assignedToId;
      if (status) dataToUpdate.status = status;

      // Vérifier si au moins un champ est fourni
      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'No fields to update provided.' });
      }

      try {
        const updatedTask = await prisma.task.update({
          where: { id: taskId },
          data: dataToUpdate,
          include: { assignedTo: { select: { name: true } } } // Renvoyer la tâche complète avec le nom de l'assigné
        });
        return res.status(200).json(updatedTask);
      } catch (error) {
        return res.status(500).json({ message: 'Failed to update task', error: error.message });
      }

    } 
    // CAS 2 : L'utilisateur est un EMPLOYEE
    else if (role === 'EMPLOYEE') {
      // Un employé ne peut modifier que le statut de ses propres tâches
      const { status } = req.body;

      if (!status || (status !== 'TODO' && status !== 'DONE')) {
        return res.status(400).json({ message: 'Invalid or missing status provided' });
      }
      
      try {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }
        // Vérification de permission cruciale
        if (task.assignedToId !== userId) {
          return res.status(403).json({ message: 'Forbidden: You cannot modify this task' });
        }

        const updatedTask = await prisma.task.update({
          where: { id: taskId },
          data: { status: status },
        });
        return res.status(200).json(updatedTask);
      } catch (error) {
        return res.status(500).json({ message: 'Something went wrong during employee update', error: error.message });
      }
    }
  } 
  // Si la requête est une suppression (DELETE)
  else if (req.method === 'DELETE') {
    // Seul un manager peut supprimer une tâche
    if (role !== 'MANAGER') {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to delete tasks' });
    }
    
    try {
      await prisma.task.delete({
        where: { id: taskId },
      });
      res.status(204).end(); // Réponse succès sans contenu
    } catch (error) {
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