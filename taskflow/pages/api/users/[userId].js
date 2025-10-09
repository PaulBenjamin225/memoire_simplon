import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { userId } = req.query; // Récupère l'ID de l'utilisateur depuis l'URL

  // --- Sécurité : Vérifier que l'appelant est un Manager ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to modify users.' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // --- Logique de la mise à jour (PATCH) ---
  if (req.method === 'PATCH') {
    // <-- AJOUT 1: On récupère la propriété `isActive` du corps de la requête -->
    const { name, email, role, isActive } = req.body;

    // Construire l'objet de mise à jour avec les champs fournis
    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (role) dataToUpdate.role = role;
    
    // <-- AJOUT 2: On ajoute `isActive` à l'objet de mise à jour s'il est présent -->
    // On vérifie `!== undefined` car sa valeur peut être `false`, ce qui est une valeur valide.
    if (isActive !== undefined) {
      dataToUpdate.isActive = isActive;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields to update provided.' });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        // <-- AJOUT 3: On s'assure de renvoyer le champ `isActive` mis à jour -->
        select: { id: true, name: true, email: true, role: true, isActive: true } // Ne jamais renvoyer le mot de passe
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      // Gérer l'erreur d'email dupliqué
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'This email is already in use.' });
      }
      res.status(500).json({ message: 'Failed to update user.', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}