import { PrismaClient } from '@prisma/client'; // import de Prisma pour interagir avec la base de données
import jwt from 'jsonwebtoken'; // import JWT pour vérifier et décoder les tokens d'authentification


const prisma = new PrismaClient(); // Initialisation du client Prisma pour les opérations DB
const JWT_SECRET = process.env.JWT_SECRET; // Clé secrète pour vérifier les tokens JWT

// --- Handler principal pour la route /api/tasks/[taskId] ---
export default async function handler(req, res) {
  const { taskId } = req.query; // Récupère l'ID de la tâche depuis la query string

  // --- Étape 1 : Authentification et permissions ---
  const authHeader = req.headers.authorization; // Récupère le token dans les headers
  if (!authHeader || !authHeader.startsWith('Bearer ')) { // décodage et vérification la présence et le format du token
    return res.status(401).json({ message: 'Token d’autorisation non trouvé' }); 
  }
  const token = authHeader.split(' ')[1]; // Extraction du token
  
  let decoded; // Variable pour stocker les données décodées du token
  try {
    decoded = jwt.verify(token, JWT_SECRET); // Vérification et décodage du token
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
  const { userId, role } = decoded; // Récupère l'ID et le rôle de l'utilisateur depuis le token

// --- Étape 2 : Gestion des méthodes HTTP ---
  if (req.method === 'PATCH') { 
    
    
    // --- CAS 1 : Le Manager peut modifier tous les champs ---
    if (role === 'MANAGER') {
      const { title, description, deadline, assignedToId, status } = req.body;
    
      // On construit dynamiquement un objet avec seulement les champs fournis pour la mise à jour
      const dataToUpdate = {}; // Objet pour stocker les champs à mettre à jour
      if (title) dataToUpdate.title = title; // Permet de mettre un titre vide
      if (description !== undefined) dataToUpdate.description = description; // Permet de mettre une description vide
      if (deadline) dataToUpdate.deadline = new Date(deadline); // Conversion en date
      if (assignedToId) dataToUpdate.assignedToId = assignedToId; // Permet de réassigner la tâche
      if (status) dataToUpdate.status = status; // Permet de changer le statut

      // Vérifier si au moins un champ est fourni
      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'Pas de champs à mettre à jour fournis.' });
      }

      try {
        // Mise à jour de la tâche dans la base
        const updatedTask = await prisma.task.update({ // Mise à jour de la tâche
          where: { id: taskId }, // Identification de la tâche par son ID
          data: dataToUpdate, // Données à mettre à jour
          include: { assignedTo: { select: { name: true } } } // Retourne également le nom de l'utilisateur assigné
        });
        return res.status(200).json(updatedTask); // Réponse avec la tâche mise à jour
      } catch (error) { // Gestion des erreurs spécifiques Prisma
        return res.status(500).json({ message: 'Échec de la mise à jour de la tâche', error: error.message }); // Gestion des erreurs
      }
    } 
    

    // --- CAS 2 : Employee ne peut modifier que le statut de sa propre tâche ---
    else if (role === 'EMPLOYEE') {
      const { status } = req.body; // Un employé ne peut modifier que le statut de ses propres tâches

      // Vérification du statut fourni
      if (!status || (status !== 'TODO' && status !== 'DONE')) { 
        return res.status(400).json({ message: 'Statut invalide ou manquant fourni' }); // Le statut doit être soit 'TODO' soit 'DONE'
      }
      
      try {
        const task = await prisma.task.findUnique({ where: { id: taskId } }); // Récupération de la tâche pour vérifier l'assignation
        if (!task) {
          return res.status(404).json({ message: 'Tâche non trouvée' }); // Si la tâche n'existe pas, on retourne une erreur 404
        }
        // Vérification que l'utilisateur est bien assigné à cette tâche
        if (task.assignedToId !== userId) {
          return res.status(403).json({ message: 'Interdit : Vous ne pouvez pas modifier cette tâche' }); // Si l'utilisateur n'est pas assigné, on retourne une erreur 403
        }

        // Mise à jour du statut de la tâche
        const updatedTask = await prisma.task.update({ 
          where: { id: taskId }, // Identification de la tâche par son ID
          data: { status: status }, // Mise à jour uniquement du statut
        });
        return res.status(200).json(updatedTask); // Réponse avec la tâche mise à jour
      } catch (error) {
        return res.status(500).json({ message: 'Quelque chose s’est mal passé lors de la mise à jour des employés', error: error.message }); // Gestion des erreurs
      }
    }
  } 

  
  // DELETE = Suppression d'une tâche
  else if (req.method === 'DELETE') {
    // Seul un manager peut supprimer une tâche
    if (role !== 'MANAGER') {
      return res.status(403).json({ message: 'Interdit : Vous n’êtes pas autorisé à supprimer des tâches' }); // Erreur 403 si l'utilisateur n'est pas un manager
    }
    
    try {
      await prisma.task.delete({ // Suppression de la tâche dans la base
        where: { id: taskId },
      });
      res.status(204).end(); // Réponse succès sans contenu
    } catch (error) {
      // Gestion des erreurs spécifiques Prisma
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Task not found' }); // Tâche non trouvée
      }
      res.status(500).json({ message: 'Failed to delete task', error: error.message }); // Gestion des erreurs
    }
  } 
  // Si la méthode n'est ni PATCH ni DELETE
  else {
    res.setHeader('Allow', ['PATCH', 'DELETE']); // Indique les méthodes autorisées
    res.status(405).end(`Method ${req.method} Not Allowed`); // Erreur 405 pour méthode non autorisée
  }
}