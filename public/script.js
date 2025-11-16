// URL base da nossa API
const API_URL = 'http://localhost:3000';

// --- DEIXE ESTAS VARIÁVEIS 'let' AQUI FORA (VAZIAS) ---
// Vamos preenchê-las quando o DOM estiver pronto
let formBusca, selectAtividade, inputCidade, dashboardContainer, loadingMessage;
let modalOverlay, modalContent, modalCloseBtn, modalTitulo, modalBody;

/**
 * Função principal que inicializa o app
 */
document.addEventListener('DOMContentLoaded', () => {
  
  // --- PREENCHA AS VARIÁVEIS AQUI DENTRO ---
  // Agora temos certeza que o HTML existe
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

  // 1. Carrega as atividades no <select>
  carregarAtividades();

  // 2. Carrega os cards salvos
  carregarCards();

  // 3. Adiciona o listener para o formulário
  // (Verifica se o form existe antes de adicionar, boa prática)
  if (formBusca) {
    formBusca.addEventListener('submit', handleCriarCard);
  }
  
  // 4. Adiciona listeners para fechar o modal
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', fecharModal);
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (event) => {
      // Fecha se clicar FORA do conteúdo (no overlay)
      if (event.target === modalOverlay) {
        fecharModal();
      }
    });
  }
});

/**
 * Busca atividades da API e popula o <select>
 */
async function carregarAtividades() {
  try {
    const response = await fetch(`${API_URL}/atividades`);
    if (!response.ok) {
      throw new Error('Não foi possível carregar as atividades.');
    }
    const atividades = await response.json();

    selectAtividade.innerHTML = ''; // Limpa o "Carregando..."
    atividades.forEach(atividade => {
      const option = document.createElement('option');
      option.value = atividade.id;
      option.textContent = atividade.nome;
      selectAtividade.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar atividades:', error);
    selectAtividade.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

/**
 * [READ] Busca todos os cards da API e os renderiza
 */
async function carregarCards() {
  try {
    loadingMessage.style.display = 'block';
    dashboardContainer.innerHTML = ''; // Limpa o container

    const response = await fetch(`${API_URL}/cards`);
    if (!response.ok) {
      throw new Error('Não foi possível carregar os cards.');
    }
    const cards = await response.json();

    loadingMessage.style.display = 'none';

    if (cards.length === 0) {
      dashboardContainer.innerHTML = '<p>Nenhum card salvo ainda.</p>';
      return;
    }

    cards.forEach(card => {
      const cardElement = criarElementoCard(card);
      dashboardContainer.appendChild(cardElement);
    });
  } catch (error) {
    console.error('Erro ao carregar cards:', error);
    loadingMessage.textContent = 'Erro ao carregar os cards.';
  }
}

/**
 * [CREATE] Lida com o submit do formulário para criar um novo card
 */
async function handleCriarCard(event) {
  event.preventDefault(); // Impede o recarregamento da página

  const atividadeId = selectAtividade.value;
  const cidade = inputCidade.value.trim();

  if (!atividadeId || !cidade) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const btn = event.target.querySelector('button');
  btn.textContent = 'Verificando...';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cidade, atividadeId }),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.message || 'Erro ao criar o card.');
    }

    // Sucesso! Limpa o formulário e recarrega a lista
    inputCidade.value = '';
    carregarCards(); // Recarrega o dashboard
  } catch (error) {
    console.error('Erro ao criar card:', error);
    alert(`Erro ao criar card: ${error.message}`);
  } finally {
    btn.textContent = 'Verificar e Salvar Card';
    btn.disabled = false;
  }
}

/**
 * [DELETE] Lida com o clique no botão de excluir
 */
async function handleExcluirCard(id) {
  if (!confirm('Tem certeza que deseja excluir este card?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Falha ao excluir o card.');
    }

    // Remove o card do DOM sem precisar recarregar tudo
    const cardElement = document.getElementById(`card-${id}`);
    if (cardElement) {
      cardElement.remove();
    }
  } catch (error) {
    console.error('Erro ao excluir card:', error);
    alert('Não foi possível excluir o card.');
  }
}

/**
 * [UPDATE] Lida com o clique no botão de atualizar
 */
async function handleAtualizarCard(id, btnElement) {
  btnElement.textContent = 'Atualizando...';
  btnElement.disabled = true;

  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar o card.');
    }

    // Sucesso, recarrega o dashboard para mostrar os novos dados
    carregarCards();

  } catch (error) {
    console.error('Erro ao atualizar card:', error);
    alert('Não foi possível atualizar o card.');
  } 
}

/**
 * Função helper para criar o HTML de um card
 */
function criarElementoCard(card) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  cardDiv.id = `card-${card.id}`;

  const condicaoClasse = card.condicaoAtual === 'Apropriado'
    ? 'apropriado'
    : 'inapropriado';

  // Separamos o corpo (clicável) e as ações
  cardDiv.innerHTML = `
    <div class="card-body"> <div class="card-header">
        <div>
          <h3>${card.cidade}</h3>
          <span class="atividade">${card.atividade.nome}</span>
        </div>
      </div>
      <div class="card-condicao ${condicaoClasse}">
        ${card.condicaoAtual}
      </div>
      <ul class="card-info">
        <li><strong>Temperatura:</strong> ${card.temperatura.toFixed(1)}°C</li>
        <li><strong>Umidade:</strong> ${card.umidade.toFixed(0)}%</li>
        <li><strong>Vento:</strong> ${card.velocidadeVento.toFixed(1)} km/h</li>
        <li><strong>Chuva:</strong> ${card.precipitacaoProbabilidade.toFixed(0)}%</li>
      </ul>
    </div>
    <div class="card-actions">
      <button class="btn-atualizar">Atualizar</button>
      <button class="btn-excluir">Excluir</button>
    </div>
  `;
  
  // --- Adiciona Event Listeners ---

  // Ações dos Botões (UPDATE e DELETE)
  const btnAtualizar = cardDiv.querySelector('.btn-atualizar');
  btnAtualizar.addEventListener('click', (e) => {
    e.stopPropagation(); // Impede que o clique no botão abra o modal
    handleAtualizarCard(card.id, btnAtualizar);
  });

  const btnExcluir = cardDiv.querySelector('.btn-excluir');
  btnExcluir.addEventListener('click', (e) => {
    e.stopPropagation(); // Impede que o clique no botão abra o modal
    handleExcluirCard(card.id);
  });

  // Adiciona clique no corpo do card para abrir o modal
  const cardBody = cardDiv.querySelector('.card-body');
  cardBody.style.cursor = 'pointer'; // Indica que é clicável
  cardBody.addEventListener('click', () => {
    handleAbrirModal(card.id, card.cidade, card.atividade.nome);
  });

  return cardDiv;
}

/**
 * [MODAL] Abre o modal e busca a previsão futura
 */
async function handleAbrirModal(id, cidade, atividadeNome) {
  // Abre o modal e define o estado de loading
  modalOverlay.style.display = 'flex';
  modalTitulo.textContent = `Previsão para ${atividadeNome} em ${cidade}`;
  modalBody.innerHTML = '<p>Carregando previsão...</p>';

  try {
    // Chama nosso novo endpoint de forecast
    const response = await fetch(`${API_URL}/cards/${id}/forecast`);
    if (!response.ok) {
      throw new Error('Falha ao buscar previsão futura.');
    }
    const previsoes = await response.json();

    if (previsoes.length === 0) {
      modalBody.innerHTML = '<p>Não foi possível obter a previsão futura (0 dias retornados).</p>';
      return;
    }

    // Limpa o loading
    modalBody.innerHTML = '';

    // Renderiza cada dia da previsão
    previsoes.forEach(item => {
      const { dadosClima, resultado, data } = item;
      
      const diaElement = document.createElement('div');
      diaElement.className = 'previsao-dia';
      
      const dataFormatada = new Date(data).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      });
      
      const condicaoClasse = resultado.apropriado
        ? 'apropriado'
        : 'inapropriado';
      
      // Monta o HTML para o dia
      diaElement.innerHTML = `
        <h4>${dataFormatada} (12:00)</h4>
        <div class="card-condicao ${condicaoClasse}">
          ${resultado.apropriado ? 'Apropriado' : resultado.justificativa || 'Inapropriado'}
        </div>
        <ul class="card-info">
          <li><strong>Temp:</strong> ${dadosClima.temperatura.toFixed(1)}°C</li>
          <li><strong>Chuva:</strong> ${dadosClima.probabilidadeChuva.toFixed(0)}%</li>
          <li><strong>Vento:</strong> ${dadosClima.velocidadeVento.toFixed(1)} km/h</li>
        </ul>
      `;
      modalBody.appendChild(diaElement);
    });

  } catch (error) {
    console.error('Erro ao abrir modal:', error);
    modalBody.innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
}

/**
 * [MODAL] Fecha o modal
 */
function fecharModal() {
  modalOverlay.style.display = 'none';
}