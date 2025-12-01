// Definição dos dados vêm da API de clima
export interface DadosClima {
    temp: number;      // Temperatura
    umidade: number;   // Umidade %
    vento: number;     // Velocidade do vento
    chuva: number;     // Chance de chuva %
}

// Essa é a Interface 
export interface IEstrategia {
    // Todo mundo que usar essa interface é OBRIGADO a ter este método:
    avaliar(clima: DadosClima): string;
}