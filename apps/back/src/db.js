require('dotenv').config({ override: false });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Sécurise la connexion SSL pour Render
const isRenderDb = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com');

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.NODE_ENV === 'production' || isRenderDb) 
    ? { rejectUnauthorized: false } 
    : false,
  options: process.env.NODE_ENV === 'test' ? '-c search_path=test' : undefined,
});

// Crée le client Prisma qui permet d'exécuter toutes les requêtes en base de données
const prisma = new PrismaClient({ adapter });

module.exports = {
  prisma,
};