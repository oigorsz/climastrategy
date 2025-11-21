// URL base da nossa API
const API_URL = 'http://localhost:3000';

let formBusca, selectAtividade, inputCidade, dashboardContainer, loadingMessage;
let modalOverlay, modalContent, modalCloseBtn, modalTitulo, modalBody;

/**
 * Função principal que inicializa o app
 */
document.addEventListener('DOMContentLoaded', () => {
  
  // Mapeando elementos do DOM
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

  // 1. Carrega as atividades e cards iniciais
  carregarAtividades();
  carregarCards();

  // 2. Listeners
  if (formBusca) formBusca.addEventListener('submit', handleCriarCard);
  
  // Modal: Fechar ao clicar no X ou fora
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', fecharModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (event) => {
      if (event.target === modalOverlay) fecharModal();
    });
  }
});

/**
 * Busca atividades da API e popula o <select>
 */
async function carregarAtividades() {
  try {
    const response = await fetch(`${API_URL}/atividades`);
    if (!response.ok) throw new Error('Erro na API');
    const atividades = await response.json();

    selectAtividade.innerHTML = ''; 
    atividades.forEach(atividade => {
      const option = document.createElement('option');
      option.value = atividade.id;
      option.textContent = atividade.nome;
      selectAtividade.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    selectAtividade.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

/**
 * [READ] Busca e renderiza os cards
 */
async function carregarCards() {
  try {
    loadingMessage.style.display = 'block';
    dashboardContainer.innerHTML = '';

    const response = await fetch(`${API_URL}/cards`);
    const cards = await response.json();

    loadingMessage.style.display = 'none';

    if (cards.length === 0) {
      // Estilizando a mensagem de vazio para combinar com o tema branco/vidro
      dashboardContainer.innerHTML = '<p style="color: #fff; grid-column: 1/-1; text-align: center; opacity: 0.8;">Nenhum card salvo ainda. Adicione uma cidade acima!</p>';
      return;
    }

    cards.forEach(card => {
      const cardElement = criarElementoCard(card);
      dashboardContainer.appendChild(cardElement);
    });
  } catch (error) {
    console.error(error);
    loadingMessage.textContent = 'Erro de conexão com o servidor.';
    loadingMessage.style.color = '#fff';
  }
}

/**
 * [CREATE] Cria novo card
 */
async function handleCriarCard(event) {
  event.preventDefault();

  const atividadeId = selectAtividade.value;
  const cidade = inputCidade.value.trim();

  if (!atividadeId || !cidade) return alert('Preencha todos os campos.');

  const btn = event.target.querySelector('button');
  const textoOriginal = btn.textContent;
  btn.textContent = 'Consultando...';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cidade, atividadeId }),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.message || 'Erro ao criar.');
    }

    inputCidade.value = '';
    carregarCards();
  } catch (error) {
    alert(`Erro: ${error.message}`);
  } finally {
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }
}

/**
 * [DELETE] Excluir card
 */
async function handleExcluirCard(id) {
  if (!confirm('Excluir este card?')) return;

  try {
    const response = await fetch(`${API_URL}/cards/${id}`, { method: 'DELETE' });
    if (response.ok) {
      const card = document.getElementById(`card-${id}`);
      if (card) {
        // Efeito visual de sumir suavemente
        card.style.transform = 'scale(0.9)';
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 300);
      }
    }
  } catch (error) {
    alert('Erro ao excluir.');
  }
}

/**
 * [UPDATE] Atualizar card
 */
async function handleAtualizarCard(id, btnElement) {
  const textoOriginal = btnElement.textContent;
  btnElement.textContent = '...';
  btnElement.disabled = true;

  try {
    const response = await fetch(`${API_URL}/cards/${id}`, { method: 'PUT' });
    if (response.ok) carregarCards();
    else alert('Erro ao atualizar.');
  } catch (error) {
    console.error(error);
  } finally {
    // Caso dê erro e não recarregue a lista, volta o botão
    setTimeout(() => {
        if(document.body.contains(btnElement)) {
            btnElement.textContent = textoOriginal;
            btnElement.disabled = false;
        }
    }, 1000);
  }
}

/**
 * Helper: Monta o HTML do Card
 */
function criarElementoCard(card) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  cardDiv.id = `card-${card.id}`;

  const condicaoClasse = card.condicaoAtual === 'Apropriado' ? 'apropriado' : 'inapropriado';

  // Ícones adicionados para visual iOS
  cardDiv.innerHTML = `
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
        <li><strong>🌡️ Temp:</strong> ${card.temperatura.toFixed(1)}°C</li>
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
  
  // Listeners
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

  const cardBody = cardDiv.querySelector('.card-body');
  cardBody.style.cursor = 'pointer';
  cardBody.addEventListener('click', () => {
    handleAbrirModal(card.id, card.cidade, card.atividade.nome);
  });

  return cardDiv;
}

/**
 * [MODAL] Busca previsão futura
 */
async function handleAbrirModal(id, cidade, atividadeNome) {
  modalOverlay.style.display = 'flex';
  modalTitulo.textContent = `Previsão: ${atividadeNome} em ${cidade}`;
  modalBody.innerHTML = '<p style="text-align:center">Carregando previsão...</p>';

  try {
    const response = await fetch(`${API_URL}/cards/${id}/forecast`);
    const previsoes = await response.json();

    if (!previsoes || previsoes.length === 0) {
      modalBody.innerHTML = '<p>Sem dados de previsão futura.</p>';
      return;
    }

    modalBody.innerHTML = ''; // Limpa loading

    previsoes.forEach(item => {
      const { dadosClima, resultado, data } = item;
      
      const div = document.createElement('div');
      div.className = 'previsao-dia';
      
      const diaSemana = new Date(data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' });
      const condicaoClasse = resultado.apropriado ? 'apropriado' : 'inapropriado';
      
      div.innerHTML = `
        <h4>📅 ${diaSemana}</h4>
        <div class="card-condicao ${condicaoClasse}" style="margin: 5px 0 10px; font-size: 0.9em;">
          ${resultado.apropriado ? 'Apropriado' : 'Inapropriado'}
        </div>
        <ul class="card-info" style="border:none;">
          <li><strong>🌡️</strong> ${dadosClima.temperatura.toFixed(1)}°C</li>
          <li><strong>☔</strong> ${dadosClima.probabilidadeChuva.toFixed(0)}%</li>
          <li><strong>💨</strong> ${dadosClima.velocidadeVento.toFixed(1)} km/h</li>
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