import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  // On accepte uniquement la méthode POST pour créer une tâche
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // --- Sécurité : Vérifier que l'utilisateur est un Manager ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // --- Logique de création ---
  const { title, description, deadline, assignedToId } = req.body;

  if (!title || !deadline || !assignedToId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null, // Description est optionnelle
        deadline: new Date(deadline), // Convertir la chaîne de date en objet Date
        assignedToId,
      },
      // On inclut les infos de l'employé pour le retour
      include: {
        assignedTo: { select: { name: true } }
      }
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
}