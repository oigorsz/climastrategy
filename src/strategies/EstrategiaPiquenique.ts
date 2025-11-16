import { IEstrategiaAtividade } from './IEstrategiaAtividade';
import { DadosClima, ResultadoVerificacao } from '../interfaces/clima.interfaces';

export class EstrategiaPiquenique implements IEstrategiaAtividade {
  verificarApropriado(dados: DadosClima): ResultadoVerificacao {
    const { temperatura, probabilidadeChuva, umidade, velocidadeVento } = dados;

    if (probabilidadeChuva > 15) {
      return {
        apropriado: false,
        justificativa: 'Qualquer chance de chuva pode atrapalhar.',
      };
    }
    if (umidade > 85) {
      return { apropriado: false, justificativa: 'Umidade muito alta.' };
    }
    if (velocidadeVento > 20) {
      return {
        apropriado: false,
        justificativa: 'Vento pode levar guardanapos (acima de 20 km/h).',
      };
    }
    if (temperatura < 18 || temperatura > 28) {
      return {
        apropriado: false,
        justificativa: 'Clima desconfortável (ideal entre 18°C e 28°C).',
      };
    }

    return { apropriado: true };
  }
}