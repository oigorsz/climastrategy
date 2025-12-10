import { prisma } from '../prismaClient';
import { WeatherService } from './WeatherService';
import { TradutorClima } from '../logica/TradutorClima';


export class CardService {
  private weatherService: WeatherService;
  private tradutorClima: TradutorClima;

  constructor() {
    this.weatherService = new WeatherService();
    this.tradutorClima = new TradutorClima();
  }

  //Cria um novo card, buscando o clima e aplicando a estratégia.

  async criarCard(cidade: string, atividadeId: string) {
    // 1. Buscar o nome da atividade no banco
    const atividade = await prisma.atividade.findUnique({
      where: { id: atividadeId },
    });
    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // 2. Buscar dados do clima (API Externa)
    const { dados: dadosClima, nomeCidade } = await this.weatherService.buscarClima(cidade);

    // Verificamos se já existe um card igual (mesma cidade e atividade)
    const cardExistente = await prisma.card.findFirst({
        where: {
            cidade: nomeCidade,
            atividadeId: atividadeId
        }
    });

    if (cardExistente) {
        // Verifica se já tem um card dessa cidade
        // Se tiver, a gente deleta o antigo para o novo ficar no topo da lista atualizado
        await prisma.card.delete({
            where: { id: cardExistente.id }
        });
    }

    // Precisamos converter os nomes dos campos para bater com o IEstrategia
    const fraseResultado = this.tradutorClima.processar(atividade.nome, {
        temp: dadosClima.temperatura,
        umidade: dadosClima.umidade,
        vento: dadosClima.velocidadeVento,
        chuva: dadosClima.probabilidadeChuva,
        data: new Date().toISOString()
    });

    // 4. Salvar o Card e o Histórico em uma Transação
    const [cardSalvo] = await prisma.$transaction([
      // Criar o Card
      prisma.card.create({
        data: {
          cidade: nomeCidade, 
          atividadeId: atividadeId,
          temperatura: dadosClima.temperatura,
          umidade: dadosClima.umidade,
          velocidadeVento: dadosClima.velocidadeVento,
          precipitacaoProbabilidade: dadosClima.probabilidadeChuva,
          condicaoAtual: fraseResultado
        },
      }),

      // Criar o log de Histórico
      prisma.historico.create({
        data: {
          operacao: 'CREATE',
          entidade: 'CARD',
          entidadeId: 'Novo Card', 
        },
      }),
    ]);

    return cardSalvo;
  }

  //Lista todos os cards salvos.
  
  async listarCards() {
    return prisma.card.findMany({
      include: {
        atividade: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  
  // Lista as atividades disponíveis para o frontend
   
  async listarAtividades() {
    return prisma.atividade.findMany();
  }


  async obterPrevisaoParaCard(id: string) {
    // 1. Achar o card e a atividade
    const card = await prisma.card.findUnique({
      where: { id },
      include: { atividade: true },
    });

    if (!card) {
      throw new Error('Card não encontrado.');
    }

    // 2. Buscar a previsão futura
    const previsoes = await this.weatherService.buscarPrevisaoFutura(
      card.cidade,
    );

    // 3. Aplicar a Estratégia em CADA dia da previsão
    const resultados = previsoes.map((dadosDia) => {
      
      const frase = this.tradutorClima.processar(card.atividade.nome, {
          temp: dadosDia.temperatura,
          umidade: dadosDia.umidade,
          vento: dadosDia.velocidadeVento,
          chuva: dadosDia.probabilidadeChuva,
          data: dadosDia.data || new Date().toISOString()
      });
      
      return {
        data: dadosDia.data,
        dadosClima: dadosDia,
        resultado: {
            apropriado: true, 
            justificativa: frase 
        },
      };
    });

    return resultados;
  }

  // Atualiza um card existente com novos dados do clima.
   
  async atualizarCard(id: string) {
    // 1. Encontra o card e a atividade
    const cardAtual = await prisma.card.findUnique({
      where: { id },
      include: { atividade: true },
    });

    if (!cardAtual) {
      throw new Error('Card não encontrado.');
    }

    // 2. Busca o clima ATUALIZADO
    const { dados: dadosClima, nomeCidade } = await this.weatherService.buscarClima(
      cardAtual.cidade,
    );

    // 3. Faz a avaliação da estratégia com o Tradutor
    const fraseResultado = this.tradutorClima.processar(cardAtual.atividade.nome, {
        temp: dadosClima.temperatura,
        umidade: dadosClima.umidade,
        vento: dadosClima.velocidadeVento,
        chuva: dadosClima.probabilidadeChuva,
        data: new Date().toISOString()
    });

    // 4. Atualiza o Card e loga no Histórico
    const [cardAtualizado] = await prisma.$transaction([
      prisma.card.update({
        where: { id },
        data: {
          cidade: nomeCidade,
          temperatura: dadosClima.temperatura,
          umidade: dadosClima.umidade,
          velocidadeVento: dadosClima.velocidadeVento,
          precipitacaoProbabilidade: dadosClima.probabilidadeChuva,
          condicaoAtual: fraseResultado
        },
      }),
      
      prisma.historico.create({
        data: {
          operacao: 'UPDATE',
          entidade: 'CARD',
          entidadeId: id,
        },
      }),
    ]);

    return cardAtualizado;
  }

  // Remove um card do banco.

  async deletarCard(id: string) {
    await prisma.$transaction([
      prisma.card.delete({
        where: { id },
      }),
      
      prisma.historico.create({
        data: {
          operacao: 'DELETE',
          entidade: 'CARD',
          entidadeId: id,
        },
      }),
    ]);
  }
}