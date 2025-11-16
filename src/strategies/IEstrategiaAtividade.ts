import { DadosClima, ResultadoVerificacao } from '../interfaces/clima.interfaces';

/**
 * A interface Strategy declara o método que todas as estratégias
 * concretas devem implementar.
 */
export interface IEstrategiaAtividade {
  verificarApropriado(dados: DadosClima): ResultadoVerificacao;
}