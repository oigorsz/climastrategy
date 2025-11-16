import axios from 'axios';
import { DadosClima } from '../interfaces/clima.interfaces';

export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';

  constructor() {
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error('API Key do OpenWeather não configurada no .env');
    }
    this.apiKey = process.env.OPENWEATHER_API_KEY;
  }

  /**
   * Busca a previsão do tempo para uma cidade e a adapta
   * para a nossa interface 'DadosClima'.
   *
   * Usamos o endpoint /forecast, pois ele nos dá a 'pop'
   * (Probabilidade de Precipitação), que é um requisito.
   */
  async buscarClima(cidade: string): Promise<{ dados: DadosClima, nomeCidade: string }> {
    try {
      const resposta = await axios.get(this.baseUrl, {
        params: {
          q: cidade,
          appid: this.apiKey,
          units: 'metric', // Para temperatura em Celsius
          lang: 'pt_br',
        },
      });

      const previsaoAtual = resposta.data.list[0];
      
      // *** NOVA LINHA: Captura o nome da cidade da resposta da API ***
      const nomeCidadeCorrigido = resposta.data.city.name;

      const dadosAdaptados: DadosClima = {
        temperatura: previsaoAtual.main.temp,
        umidade: previsaoAtual.main.humidity,
        velocidadeVento: previsaoAtual.wind.speed * 3.6,
        probabilidadeChuva: previsaoAtual.pop * 100,
      };

      // *** MODIFICADO: Retorna o objeto completo ***
      return { dados: dadosAdaptados, nomeCidade: nomeCidadeCorrigido };

    } catch (error: any) {
      // ... (bloco catch inalterado)
    }
  }

  async buscarPrevisaoFutura(cidade: string): Promise<DadosClima[]> {
    try {
      const resposta = await axios.get(this.baseUrl, {
        params: {
          q: cidade,
          appid: this.apiKey,
          units: 'metric',
          lang: 'pt_br',
        },
      });

      const previsoesDiarias: DadosClima[] = [];
      const diasProcessados = new Set<string>();

      // O 'list' contém previsões a cada 3h
      for (const previsao of resposta.data.list) {
        const data = new Date(previsao.dt_txt);
        const dia = data.toISOString().split('T')[0]; // Pega 'YYYY-MM-DD'

        // Pega apenas o registro do meio-dia (12:00) E
        // um dia que ainda não adicionamos
        if (data.getUTCHours() === 12 && !diasProcessados.has(dia)) {
          diasProcessados.add(dia);

          previsoesDiarias.push({
            temperatura: previsao.main.temp,
            umidade: previsao.main.humidity,
            velocidadeVento: previsao.wind.speed * 3.6,
            probabilidadeChuva: previsao.pop * 100,
            // Adiciona a data para o frontend saber
            data: previsao.dt_txt, 
          });
        }
      }

      return previsoesDiarias;
    } catch (error: any) {
      console.error('Erro ao buscar previsão futura:', error.response?.data?.message || error.message);
      throw new Error('Não foi possível obter a previsão futura.');
    }
  }
}