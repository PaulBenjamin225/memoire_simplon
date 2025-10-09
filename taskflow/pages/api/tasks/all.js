import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // SÉCURITÉ : On vérifie que l'utilisateur est bien un MANAGER
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    // Si c'est un manager, on récupère toutes les tâches
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      // On inclut le nom de l'employé assigné, c'est très utile !
      include: {
        assignedTo: {
          select: { name: true },
        },
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}