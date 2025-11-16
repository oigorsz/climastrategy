import 'dotenv/config'; // Garante que o .env seja lido
import { PrismaClient } from '@prisma/client';

// Inicializa o Prisma Client
const prisma = new PrismaClient();

const atividadesData = [
  { nome: 'Correr' },
  { nome: 'Praia' },
  { nome: 'Piquenique' },
];

async function main() {
  console.log(`Iniciando o seed...`); // <-- Queremos ver isso

  for (const data of atividadesData) {
    // Usamos 'upsert' para evitar duplicatas se rodarmos o seed várias vezes
    const atividade = await prisma.atividade.upsert({
      where: { nome: data.nome },
      update: {},
      create: data,
    });
    console.log(`Atividade criada ou atualizada: ${atividade.nome}`);
  }

  console.log(`Seed finalizado.`); // <-- E isso
}

// --- ESSA É A PARTE CRÍTICA QUE ESTAVA FALTANDO ---
// Executa a função main e fecha a conexão
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });