import { PrismaClient } from '@prisma/client';

// Cria uma instância única para ser usada em toda a aplicação
export const prisma = new PrismaClient();