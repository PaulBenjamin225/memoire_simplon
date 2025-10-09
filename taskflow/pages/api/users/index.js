import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // --- Sécurité : Vérifier que l'appelant est un Manager ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to create users.' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // --- Logique de création de l'utilisateur ---
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    // Hacher le mot de passe avant de le sauvegarder
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur avec le rôle par défaut 'EMPLOYEE'
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE', // Un manager ne peut créer que des employés par défaut
      },
      // Renvoyer uniquement les données non sensibles
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    // Gérer le cas où l'email existe déjà
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error("User creation error:", error);
    res.status(500).json({ message: 'Failed to create user.' });
  }
}