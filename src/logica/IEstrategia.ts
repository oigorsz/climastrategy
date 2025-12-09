// Definição dos dados vêm da API de clima
export interface DadosClima {
    temp: number;      // Temperatura
    umidade: number;   // Umidade %
    vento: number;     // Velocidade do vento
    chuva: number;     // Chance de chuva %
    data: string;
}

// Essa é a Interface 
export interface IEstrategia {
    avaliar(clima: DadosClima): string;
}