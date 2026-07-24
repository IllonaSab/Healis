import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {  // Déclare le middleware d'authentification JWT
  const authHeader = req.headers.authorization;  // Récupère le header "Authorization"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {  // header = absent OU  "Bearer" --> token pas fourni ou mal formaté
    return res.status(401).json({ message: 'Token manquant' }); // bloque l'accès → 401 Unauthorized
  }
  const token = authHeader.split(' ')[1];  //le token --> après "Bearer "
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // token invalide ou expiré --> une erreur 
    req.userId = decoded.userId;  // Ajoute l'ID utilisateur
    next();  // OK --> direction vers la route suivante
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });  // vérification échoue → token invalide ou expiré → accès refusé
  }
}
