const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL,
  // Connexion PostgreSQL via l’URL fournie dans l’environnement

  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Active SSL uniquement en production (nécessaire sur Render, Railway, etc.)
  // rejectUnauthorized: false → permet d’accepter les certificats managés
});

export const prisma = new PrismaClient({ adapter });
// Initialise Prisma avec l’adaptateur PostgreSQL
// Permet d’utiliser Prisma normalement tout en passant par l’adaptateur PG
