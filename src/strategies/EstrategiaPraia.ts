import { IEstrategiaAtividade } from './IEstrategiaAtividade';
import { DadosClima, ResultadoVerificacao } from '../interfaces/clima.interfaces';

export class EstrategiaPraia implements IEstrategiaAtividade {
  verificarApropriado(dados: DadosClima): ResultadoVerificacao {
    const { temperatura, probabilidadeChuva, velocidadeVento } = dados;

    if (probabilidadeChuva > 25) {
      return {
        apropriado: false,
        justificativa: 'Probabilidade de chuva moderada/alta.',
      };
    }
    if (temperatura < 22) {
      return {
        apropriado: false,
        justificativa: 'Muito frio para praia (abaixo de 22°C).',
      };
    }
    if (velocidadeVento > 30) {
      return {
        apropriado: false,
        justificativa: 'Vento muito forte (acima de 30 km/h).',
      };
    }

    return { apropriado: true };
  }
}