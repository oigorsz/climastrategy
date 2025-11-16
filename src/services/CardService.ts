import { prisma } from '../prismaClient';
import { WeatherService } from './WeatherService';
import { ClimaService } from './ClimaService';

/**
 * Este serviço orquestra toda a lógica de negócio e
 * o acesso a dados para os Cards.
 */
export class CardService {
  private weatherService: WeatherService;
  private climaService: ClimaService;

  constructor() {
    // Instancia os serviços que criamos na Fase 2
    this.weatherService = new WeatherService();
    this.climaService = new ClimaService();
  }

  /**
   * CREATE
   * Cria um novo card, buscando o clima e aplicando a estratégia.
   */
  async criarCard(cidade: string, atividadeId: string) {
    // 1. Buscar o nome da atividade no banco
    const atividade = await prisma.atividade.findUnique({
      where: { id: atividadeId },
    });
    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // 2. Buscar dados do clima (Fase 2)
    const { dados: dadosClima, nomeCidade } = await this.weatherService.buscarClima(cidade);

    // 3. Aplicar a estratégia (Fase 2)
    const resultado = this.climaService.verificarClimaParaAtividade(
      atividade.nome,
      dadosClima,
    );

    // 4. Salvar o Card e o Histórico em uma Transação
    // Isso garante que ou AMBOS funcionam, ou NENHUM funciona.
    const [cardSalvo] = await prisma.$transaction([
      // A. Criar o Card
      prisma.card.create({
        data: {
          cidade: nomeCidade, 
          atividadeId: atividadeId,
          temperatura: dadosClima.temperatura,
          umidade: dadosClima.umidade,
          velocidadeVento: dadosClima.velocidadeVento,
          precipitacaoProbabilidade: dadosClima.probabilidadeChuva,
          condicaoAtual: resultado.apropriado
            ? 'Apropriado'
            : resultado.justificativa || 'Inapropriado',
        },
      }),

      // B. Criar o log de Histórico
      prisma.historico.create({
        data: {
          operacao: 'CREATE',
          entidade: 'CARD',
          entidadeId: 'Novo Card', // O ID real só existe após a criação
        },
      }),
    ]);

    return cardSalvo;
  }

  /**
   * READ
   * Lista todos os cards salvos.
   */
  async listarCards() {
    return prisma.card.findMany({
      // Inclui a informação da atividade (o nome)
      include: {
        atividade: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  
  /**
   * READ (Atividades)
   * Lista as atividades disponíveis para o frontend popular o <select>
   */
  async listarAtividades() {
    return prisma.atividade.findMany();
  }


  async obterPrevisaoParaCard(id: string) {
    // 1. Achar o card e sua atividade
    const card = await prisma.card.findUnique({
      where: { id },
      include: { atividade: true },
    });

    if (!card) {
      // O 'throw' será pego pelo controller
      throw new Error('Card não encontrado.');
    }

    // 2. Buscar a previsão futura (usando o 'this' interno)
    const previsoes = await this.weatherService.buscarPrevisaoFutura(
      card.cidade,
    );

    // 3. Aplicar a Estratégia em CADA dia da previsão
    const resultados = previsoes.map((dadosDia) => {
      // Agora o service usa seus próprios sub-serviços
      const resultadoEstrategia = this.climaService
        .verificarClimaParaAtividade(
          card.atividade.nome,
          dadosDia,
        );
      
      return {
        data: dadosDia.data, // Acessamos diretamente (está na interface)
        dadosClima: dadosDia,
        resultado: resultadoEstrategia,
      };
    });

    return resultados;
  }

  /**
   * UPDATE
   * Atualiza um card existente com novos dados do clima.
   */
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

    // 3. Re-avalia a estratégia
    const resultado = this.climaService.verificarClimaParaAtividade(
      cardAtual.atividade.nome,
      dadosClima,
    );

    // 4. Atualiza o Card e loga no Histórico (Transação)
    const [cardAtualizado] = await prisma.$transaction([
      prisma.card.update({
        where: { id },
        data: {
          cidade: nomeCidade,
          temperatura: dadosClima.temperatura,
          umidade: dadosClima.umidade,
          velocidadeVento: dadosClima.velocidadeVento,
          precipitacaoProbabilidade: dadosClima.probabilidadeChuva,
          condicaoAtual: resultado.apropriado
            ? 'Apropriado'
            : resultado.justificativa || 'Inapropriado',
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

  /**
   * DELETE
   * Remove um card do banco.
   */
  async deletarCard(id: string) {
    // Usamos $transaction para garantir que o log só seja
    // criado se a deleção funcionar.
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