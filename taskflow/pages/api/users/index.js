import { PrismaClient } from '@prisma/client'; // Import de PrismaClient : permet d'interagir avec la base de données via Prisma ORM
import bcrypt from 'bcryptjs'; // import de bcryptjs : utilisé pour hacher les mots de passe avant de les enregistrer
import jwt from 'jsonwebtoken'; // import de jsonwebtoken : permet de vérifier les jetons JWT pour sécuriser les routes API

// Instance de Prisma pour effectuer des requêtes sur la base de données
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET; // Clé secrète utilisée pour signer et vérifier les tokens JWT

// Cette route permet à un MANAGER de créer un nouvel utilisateur (par défaut un employé)
export default async function handler(req, res) {

  // --- Étape 1 : Vérifier la méthode HTTP ---
  if (req.method !== 'POST') { // On n’autorise que les requêtes POST
    return res.status(405).json({ message: 'Méthode non autorisée' }); // 405 Method Not Allowed
  }

  // --- Étape 2 : Vérifier que l'appelant est un manager ---
  const authHeader = req.headers.authorization; // On récupère le token JWT depuis l’en-tête de la requête

  // Si aucun token n’est trouvé, on renvoie une erreur 401 (non authentifié)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'non authentifié' });
  }

  // On extrait le token JWT de la chaîne "Bearer <token>"
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Si le rôle de l’utilisateur n’est pas MANAGER, accès refusé
    if (decoded.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Interdit : Vous n’êtes pas autorisé à créer des utilisateurs.' });
    }
  } catch (error) {
    // Token invalide ou expiré
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }

  // --- Étape 3 : Récupération et validation des données du corps de la requête ---
  const { name, email, password } = req.body;
  // Vérifier que les champs nécessaires sont présents
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  // --- Étape 4 : Création du nouvel utilisateur ---
  try {
    // Hachage du mot de passe avant l’enregistrement
    const hashedPassword = await bcrypt.hash(password, 10); // Le "10" représente le facteur de coût pour le salage du hash

    // Création du nouvel utilisateur avec le rôle par défaut 'EMPLOYEE'
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE', // le role par defaut des utilisateurs créés est EMPLOYEE
      },

      // Retour d’une réponse de succès avec le nouvel utilisateur créé
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    // Retour d’une réponse de succès avec le nouvel utilisateur créé
    res.status(201).json(newUser);
  } catch (error) {
    // --- Gestion d’erreurs ---
    // Si l’erreur vient d’un email déjà existant (code Prisma P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Un compte avec cet email existe déjà.' });
    }
    // Autres erreurs serveur
    console.error("User creation error:", error);
    res.status(500).json({ message: 'Échec de la création de l’utilisateur.' });
  }
}