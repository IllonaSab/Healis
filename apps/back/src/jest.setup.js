require('dotenv').config({ path: '.env.test' });

const { prisma } = require('./db.js');

afterAll(async () => {
  await prisma.$disconnect();
});