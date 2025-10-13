// Importation du client Prisma pour interagir avec la base de données
import { PrismaClient } from '@prisma/client';

// Importation de bcryptjs pour comparer les mots de passe (hachage sécurisé)
import bcrypt from 'bcryptjs';

// Importation du module jsonwebtoken pour créer un jeton d'authentification (JWT)
import jwt from 'jsonwebtoken';

// Création d'une instance de PrismaClient pour effectuer des requêtes vers la base de données
const prisma = new PrismaClient();

// Clé secrète pour signer le token JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Exportation d’une fonction asynchrone qui servira de route API (endpoint)
export default async function handler(req, res) {

  // Étape 1 : Vérifier la méthode HTTP
  // On n'autorise que les requêtes POST (connexion via email/mot de passe)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' }); // 405 = méthode non autorisée
  }

  // Étape 2 : Récupérer les données envoyées dans le corps de la requête
  const { email, password } = req.body;

  // Étape 3 : Vérifier que les champs obligatoires sont bien présents
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis' }); // 400 = mauvaise requête
  }

  try {
    // Étape 4 : Rechercher l’utilisateur dans la base via Prisma
    // On cherche un utilisateur ayant cet email unique
    const user = await prisma.user.findUnique({ where: { email } });

    // Si aucun utilisateur n’est trouvé, renvoyer une erreur d’identifiants invalides
    if (!user) {
      return res.status(401).json({ message: 'Aucun utilisateur trouvé' }); // 401 = non autorisé
    }

    // Étape 5 : Vérifier que le mot de passe est correct
    // On compare le mot de passe fourni avec le mot de passe haché en base
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Si le mot de passe ne correspond pas, on renvoie une erreur
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Étape 5.5 - Vérifier si le compte de l'utilisateur est actif
    // Si la propriété `isActive` de l'utilisateur est `false`, on bloque la connexion.
    if (!user.isActive) {
      // 403 = Interdit (Forbidden). L'utilisateur est authentifié mais n'a pas la permission de se connecter.
      return res.status(403).json({ message: 'Votre compte a été désactivé. Veuillez contacter un administrateur.' });
    }

    // Étape 6 : Créer le token JWT si l’utilisateur est authentifié
    // On signe un token contenant quelques infos (userId, rôle, nom)
    const token = jwt.sign(
      { 
        userId: user.id,   // identifiant de l’utilisateur
        role: user.role,   // rôle (ex : ADMIN, EMPLOYEE)
        name: user.name    // nom (utile pour affichage côté client)
      },
      JWT_SECRET,          // clé secrète pour signer le token
      { expiresIn: '1h' }  // durée de validité du token (ici 1 heure)
    );

    // Étape 7 : Retourner le token au client
    // Ce token servira à prouver l’identité de l’utilisateur pour les requêtes futures
    res.status(200).json({ token });

  } catch (error) {
    // Étape 8 : Gérer les erreurs inattendues
    res.status(500).json({ 
      message: 'Something went wrong', // Message générique
      error: error.message              // Détail de l'erreur (utile en développement)
    });
  }
}