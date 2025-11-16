import { IEstrategiaAtividade } from './IEstrategiaAtividade';
import { DadosClima, ResultadoVerificacao } from '../interfaces/clima.interfaces';

export class EstrategiaCorrer implements IEstrategiaAtividade {
  verificarApropriado(dados: DadosClima): ResultadoVerificacao {
    const { temperatura, probabilidadeChuva } = dados;

    if (probabilidadeChuva > 50) {
      return {
        apropriado: false,
        justificativa: 'Alta probabilidade de chuva forte.',
      };
    }
    if (temperatura < 5) {
      return {
        apropriado: false,
        justificativa: 'Muito frio para correr (abaixo de 5°C).',
      };
    }
    if (temperatura > 30) {
      return {
        apropriado: false,
        justificativa: 'Muito quente para correr (acima de 30°C).',
      };
    }

    return { apropriado: true };
  }
}