import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;// Le même secret que dans login.js

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. Récupérer le token depuis l'en-tête de la requête
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token not found' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // 3. Récupérer les tâches de l'utilisateur depuis la base de données
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: userId,
      },
      orderBy: {
        deadline: 'asc', // Trier par deadline, les plus urgentes en premier
      },
    });

    res.status(200).json(tasks);
  } catch (error) {
    // Si le token est invalide ou expiré
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}