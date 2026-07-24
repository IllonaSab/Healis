require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Sécurise la connexion SSL pour Render
const isRenderDb = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com');

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.NODE_ENV === 'production' || isRenderDb) 
    ? { rejectUnauthorized: false } 
    : false,
});

const prisma = new PrismaClient({ adapter });

module.exports = {
  prisma,
};