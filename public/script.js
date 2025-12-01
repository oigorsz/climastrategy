// Configuração da API
const API_URL = 'http://localhost:3000';

// Elementos do DOM
let formBusca, selectAtividade, inputCidade, dashboardContainer, loadingMessage;
let modalOverlay, modalContent, modalCloseBtn, modalTitulo, modalBody;

document.addEventListener('DOMContentLoaded', () => {
  formBusca = document.getElementById('form-busca');
  selectAtividade = document.getElementById('select-atividade');
  inputCidade = document.getElementById('input-cidade');
  dashboardContainer = document.getElementById('dashboard-container');
  loadingMessage = document.getElementById('loading-message');
  modalOverlay = document.getElementById('modal-overlay');
  modalContent = document.getElementById('modal-content');
  modalCloseBtn = document.getElementById('modal-close');
  modalTitulo = document.getElementById('modal-titulo');
  modalBody = document.getElementById('modal-body');

  carregarAtividades();
  carregarCards();

  if (formBusca) formBusca.addEventListener('submit', handleCriarCard);
  
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', fecharModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) fecharModal();
    });
  }
});

// Carrega as opções do dropdown
async function carregarAtividades() {
  try {
    const res = await fetch(`${API_URL}/atividades`);
    const atividades = await res.json();
    
    selectAtividade.innerHTML = ''; 
    atividades.forEach(ativ => {
      const option = document.createElement('option');
      option.value = ativ.id;
      option.textContent = ativ.nome;
      selectAtividade.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    selectAtividade.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

// Carrega os cards na tela
async function carregarCards() {
  try {
    loadingMessage.style.display = 'block';
    dashboardContainer.innerHTML = '';
    const res = await fetch(`${API_URL}/cards`);
    const cards = await res.json();
    
    loadingMessage.style.display = 'none';

    if (cards.length === 0) {
      dashboardContainer.innerHTML = '<p style="color: #fff; grid-column: 1/-1; text-align: center;">Nenhum card salvo ainda.</p>';
      return;
    }
    cards.forEach(card => {
      const cardElement = criarElementoCard(card);
      dashboardContainer.appendChild(cardElement);
    });
  } catch (error) {
    loadingMessage.textContent = 'Erro de conexão.';
  }
}

// Cria um novo card
async function handleCriarCard(e) {
  e.preventDefault();
  const atividadeId = selectAtividade.value;
  const cidade = inputCidade.value.trim();

  if (!atividadeId || !cidade) return alert('Preencha todos os campos.');

  const btn = e.target.querySelector('button');
  const textoOriginal = btn.textContent;
  btn.textContent = 'Consultando...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cidade, atividadeId }),
    });

    if (!res.ok) throw new Error('Erro ao criar.');
    
    inputCidade.value = '';
    carregarCards();
  } catch (error) {
    alert(`Erro: ${error.message}`);
  } finally {
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }
}

// Deletar Card
async function handleExcluirCard(id) {
  if (!confirm('Excluir este card?')) return;
  try {
    await fetch(`${API_URL}/cards/${id}`, { method: 'DELETE' });
    carregarCards();
  } catch (error) { alert('Erro ao excluir.'); }
}

// Atualizar Card
async function handleAtualizarCard(id, btnElement) {
  const textoOriginal = btnElement.textContent;
  btnElement.textContent = '...';
  try {
    const res = await fetch(`${API_URL}/cards/${id}`, { method: 'PUT' });
    if (res.ok) carregarCards();
  } catch (error) { console.error(error); } 
  finally { btnElement.textContent = textoOriginal; }
}

// Define cor e ícone baseado no clima
function obterVisualClima(card) {
    const chanceChuva = card.precipitacaoProbabilidade || 0;
    const temp = card.temperatura || 0;

    if (chanceChuva > 1) {
      return { 
          classe: 'clima-chuva', 
          imagem: 'https://cdn-icons-png.flaticon.com/512/4088/4088981.png' 
      };
    }
    if (temp >= 18) {
      return { 
          classe: 'clima-sol', 
          imagem: 'https://cdn-icons-png.flaticon.com/512/869/869869.png' 
      };
    }
    return { 
        classe: 'clima-frio', 
        imagem: 'https://cdn-icons-png.flaticon.com/512/414/414927.png' 
    };
}

// Monta o HTML do card
function criarElementoCard(card) {
  const cardDiv = document.createElement('div');
  const visual = obterVisualClima(card);
  
  cardDiv.className = `card ${visual.classe}`;
  cardDiv.id = `card-${card.id}`;

 // Lógica para aceitar frases positivas
const texto = card.condicaoAtual;

// Consideramos "Verde" se for Apropriado OU tiver palavras positivas
const ehBom = texto === 'Apropriado' 
           || texto.includes('Perfeito') 
           || texto.includes('Ótimo') 
           || texto.includes('lindo') 
           || texto.includes('Aproveite');

const condicaoClasse = ehBom ? 'apropriado' : 'inapropriado';

// FIM MUDANÇA BRUNA

  cardDiv.innerHTML = `
    <img src="${visual.imagem}" alt="Ícone Clima" class="icone-clima-img">

    <div class="card-body"> 
      <div class="card-header">
        <div>
          <h3>${card.cidade}</h3>
          <span class="atividade">${card.atividade.nome}</span>
        </div>
      </div>
      <div class="card-condicao ${condicaoClasse}">
        ${card.condicaoAtual}
      </div>
      <ul class="card-info">
        <li><strong>🌡️ Temperatura:</strong> ${card.temperatura.toFixed(1)}°C</li>
        <li><strong>💧 Umidade:</strong> ${card.umidade.toFixed(0)}%</li>
        <li><strong>💨 Vento:</strong> ${card.velocidadeVento.toFixed(1)} km/h</li>
        <li><strong>☔ Chuva:</strong> ${card.precipitacaoProbabilidade.toFixed(0)}%</li>
      </ul>
    </div>
    <div class="card-actions">
      <button class="btn-atualizar">Atualizar</button>
      <button class="btn-excluir">Excluir</button>
    </div>
  `;
  
  // Eventos dos botões
  const btnAtualizar = cardDiv.querySelector('.btn-atualizar');
  btnAtualizar.addEventListener('click', (e) => {
    e.stopPropagation();
    handleAtualizarCard(card.id, btnAtualizar);
  });

  const btnExcluir = cardDiv.querySelector('.btn-excluir');
  btnExcluir.addEventListener('click', (e) => {
    e.stopPropagation();
    handleExcluirCard(card.id);
  });

  // Clique no card abre o modal
  const cardBody = cardDiv.querySelector('.card-body');
  cardBody.style.cursor = 'pointer';
  cardBody.addEventListener('click', () => {
    handleAbrirModal(card.id, card.cidade, card.atividade.nome);
  });

  return cardDiv;
}

// Abre modal com previsão detalhada
async function handleAbrirModal(id, cidade, atividadeNome) {
  modalOverlay.style.display = 'flex';
  modalTitulo.textContent = `Previsão: ${atividadeNome} em ${cidade}`;
  modalBody.innerHTML = '<p style="text-align:center">Carregando previsão...</p>';

  try {
    const res = await fetch(`${API_URL}/cards/${id}/forecast`);
    const previsoes = await res.json();

    if (!previsoes || previsoes.length === 0) {
      modalBody.innerHTML = '<p>Sem dados de previsão futura.</p>';
      return;
    }

    modalBody.innerHTML = ''; 

    previsoes.forEach(item => {
      const { dadosClima, resultado, data } = item;
      const div = document.createElement('div');
      div.className = 'previsao-dia';
      
      // Formata data: "Domingo, 1 de dezembro"
      let dataTexto = new Date(data).toLocaleDateString('pt-BR', { 
          weekday: 'long', day: 'numeric', month: 'long' 
      });
      dataTexto = dataTexto.charAt(0).toUpperCase() + dataTexto.slice(1);

      const condicaoClasse = resultado.apropriado ? 'apropriado' : 'inapropriado';
      const textoCondicao = resultado.apropriado ? 'Apropriado' : 'Inapropriado';
      
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin:0; font-size: 1.1em; color: #80D0C7;">📅 ${dataTexto}</h4>
            <span class="card-condicao ${condicaoClasse}" style="margin:0; font-size: 0.8em; padding: 4px 10px;">
                ${textoCondicao}
            </span>
        </div>

        <ul class="card-info" style="border:none; padding: 0;">
          <li><span>🌡️ Temperatura:</span> <strong>${dadosClima.temperatura.toFixed(1)}°C</strong></li>
          <li><span>☔ Chance de Chuva:</span> <strong>${dadosClima.probabilidadeChuva.toFixed(0)}%</strong></li>
          <li><span>💨 Vento:</span> <strong>${dadosClima.velocidadeVento.toFixed(1)} km/h</strong></li>
        </ul>
      `;
      modalBody.appendChild(div);
    });

  } catch (error) {
    modalBody.innerHTML = `<p style="color: #ff6b6b; text-align:center;">Erro ao carregar.</p>`;
  }
}

function fecharModal() {
  modalOverlay.style.display = 'none';
}