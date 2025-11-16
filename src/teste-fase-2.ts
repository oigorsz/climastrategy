// Importa o dotenv para carregar o .env (API KEY)
import 'dotenv/config';
import { WeatherService } from './services/WeatherService';
import { ClimaService } from './services/ClimaService';

// --- Defina aqui a cidade e atividade para testar ---
const CIDADE_TESTE = 'São Paulo';
const ATIVIDADE_TESTE = 'Correr'; // Mude para "Praia" ou "Piquenique" para testar
// ----------------------------------------------------

async function testarLogica() {
  console.log(`Iniciando teste para: ${ATIVIDADE_TESTE} em ${CIDADE_TESTE}...`);

  const weatherService = new WeatherService();
  const climaService = new ClimaService();

  try {
    // 1. Busca e adapta os dados do clima
    const dadosClima = await weatherService.buscarClima(CIDADE_TESTE);
    console.log('Dados do Clima (Adaptados):', {
      temperatura: `${dadosClima.temperatura.toFixed(1)}°C`,
      umidade: `${dadosClima.umidade.toFixed(0)}%`,
      vento: `${dadosClima.velocidadeVento.toFixed(1)} km/h`,
      chuva: `${dadosClima.probabilidadeChuva.toFixed(0)}%`,
    });

    // 2. Executa a estratégia selecionada
    const resultado = climaService.verificarClimaParaAtividade(
      ATIVIDADE_TESTE,
      dadosClima,
    );

    console.log('--- Resultado da Estratégia ---');
    console.log(`Apropriado: ${resultado.apropriado}`);
    if (resultado.justificativa) {
      console.log(`Justificativa: ${resultado.justificativa}`);
    }

  } catch (error) {
    console.error('Teste falhou:', error);
  }
}

testarLogica();