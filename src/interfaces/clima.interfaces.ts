/**
 * Dados de entrada para qualquer estratégia.
 * É o "Contexto" que o Padrão Strategy utiliza.
 */
export interface DadosClima {
  temperatura: number; // Em Celsius
  umidade: number; // Em %
  velocidadeVento: number; // Em km/h
  probabilidadeChuva: number; // Em % (0-100)
  data?: string; // <-- ADICIONE ESTA LINHA (opcional)
}

/**
 * Dados de saída de qualquer estratégia.
 */
export interface ResultadoVerificacao {
  apropriado: boolean;
  justificativa?: string; // Motivo (ex: "Muito quente para correr")
}