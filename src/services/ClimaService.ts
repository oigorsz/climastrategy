import { DadosClima, ResultadoVerificacao } from '../interfaces/clima.interfaces';
import { IEstrategiaAtividade } from '../strategies/IEstrategiaAtividade';
import { EstrategiaCorrer } from '../strategies/EstrategiaCorrer';
import { EstrategiaPraia } from '../strategies/EstrategiaPraia';
import { EstrategiaPiquenique } from '../strategies/EstrategiaPiquenique';

/**
 * O Contexto define a interface de interesse dos clientes
 * e mantém uma referência a uma das estratégias.
 */
export class ClimaService {
  // Um mapa para associar o nome da atividade (string)
  // à sua classe de estratégia concreta.
  private estrategias: Map<string, IEstrategiaAtividade>;

  constructor() {
    this.estrategias = new Map();
    // Registra as estratégias disponíveis.
    // As chaves ("Correr", "Praia") devem ser IDÊNTICAS
    // às que salvamos no banco de dados (seed).
    this.estrategias.set('Correr', new EstrategiaCorrer());
    this.estrategias.set('Praia', new EstrategiaPraia());
    this.estrategias.set('Piquenique', new EstrategiaPiquenique());
  }

  /**
   * O Contexto delega o trabalho de verificação para o
   * objeto de estratégia selecionado.
   */
  verificarClimaParaAtividade(
    nomeAtividade: string,
    dadosClima: DadosClima,
  ): ResultadoVerificacao {
    const estrategia = this.estrategias.get(nomeAtividade);

    if (!estrategia) {
      throw new Error(`Atividade "${nomeAtividade}" não suportada.`);
    }

    return estrategia.verificarApropriado(dadosClima);
  }
}