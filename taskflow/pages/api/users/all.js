import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET; // Bonne pratique: utiliser les variables d'environnement

export default async function handler(req, res) {
  // On s'assure que la méthode est GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  // --- Sécurité : Vérifier l'authentification et le rôle du Manager ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated: No token provided' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Seul un manager peut voir la liste de tous les utilisateurs
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    // --- Récupération des données ---
    // On récupère TOUS les utilisateurs avec les champs nécessaires pour la gestion
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true,
        email: true, // On ajoute l'email
        role: true,  // On ajoute le rôle
      },
      orderBy: { 
        createdAt: 'desc', // On trie par date de création, les plus récents en premier
      },
    });

    res.status(200).json(users);

  } catch (error) {
    // Gère les tokens invalides ou expirés
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    // Gère les autres erreurs potentielles
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}