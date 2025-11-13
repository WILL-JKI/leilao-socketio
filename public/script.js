// Verifica se o Socket.IO foi carregado corretamente
console.log('Socket.IO carregado?', typeof io !== 'undefined' ? 'Sim' : 'Não');

// Tenta criar a instância do socket
let socket;
try {
  socket = io();
  console.log('Socket criado com sucesso');
} catch (error) {
  console.error('Erro ao criar o socket:', error);
  alert('Erro ao conectar com o servidor. Por favor, recarregue a página.');
}

// Adiciona mensagem de boas-vindas quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  addMessage('Sistema de leilão carregado. Aguardando conexão...', 'info');
});

// Atualiza a lista de jogadores na interface e os nomes acima das imagens
function updatePlayerList(players) {
  const playerList = document.getElementById('playerList');
  if (playerList) {
    // Limpa a lista, incluindo a mensagem 'Conectando...'
    playerList.innerHTML = '';
    
    // Se não houver jogadores, exibe uma mensagem
    if (!players || players.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'Nenhum jogador conectado';
      emptyMessage.style.color = '#aaa';
      playerList.appendChild(emptyMessage);
      
      // Limpa os nomes dos jogadores
      const player1Name = document.getElementById('player1Name');
      const player2Name = document.getElementById('player2Name');
      if (player1Name) player1Name.textContent = 'Jogador 1';
      if (player2Name) player2Name.textContent = 'Jogador 2';
      return;
    }
    
    // Atualiza os nomes dos jogadores acima das imagens
    players.forEach((player, index) => {
      const playerNameElement = document.getElementById(`player${index + 1}Name`);
      if (playerNameElement) {
        playerNameElement.textContent = player;
      }
    });
    
    // Se houver apenas um jogador, limpa o nome do segundo jogador
    if (players.length === 1) {
      const player2Name = document.getElementById('player2Name');
      if (player2Name) player2Name.textContent = 'Aguardando...';
    }
    
    // Adiciona cada jogador à lista suspensa
    players.forEach(player => {
      const playerElement = document.createElement('div');
      playerElement.textContent = player;
      playerElement.style.margin = '3px 0';
      playerElement.style.padding = '3px 5px';
      playerElement.style.borderRadius = '3px';
      playerElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      playerList.appendChild(playerElement);
    });
  }
}

// Atualiza a lista de jogadores para todos os clientes
socket.on('atualizarListaJogadores', (data) => {
  console.log('Recebida lista de jogadores:', data.players);
  
  const roomNumber = document.getElementById('roomNumber');
  if (roomNumber) {
    roomNumber.textContent = data.roomId;
  }
  
  // Garante que a lista de jogadores seja um array
  const playersList = Array.isArray(data.players) ? data.players : [];
  updatePlayerList(playersList);
  
  // Mostra o status de conexão
  const connectionStatus = document.getElementById('connectionStatus');
  if (connectionStatus) {
    connectionStatus.style.display = 'block';
  }
});

// Mensagem de conexão aceita
socket.on('conexaoAceita', (data) => {
  const roomNumber = document.getElementById('roomNumber');
  if (roomNumber) {
    roomNumber.textContent = data.roomId;
  }
  addMessage(data.message);
  
  // Mostra o status de conexão
  const connectionStatus = document.getElementById('connectionStatus');
  if (connectionStatus) {
    connectionStatus.style.display = 'block';
  }
});

// Trata erros
socket.on('erro', (msg) => {
  addMessage(`Erro: ${msg}`, 'error');
});


const btnAdmin = document.getElementById('btnAdmin');
const btnPlayer = document.getElementById('btnPlayer');
const playerNameInput = document.getElementById('playerName');
const adminConfig = document.getElementById('adminConfig');
const playerArea = document.getElementById('playerArea');
const mensagens = document.getElementById('mensagens');
const loginArea = document.getElementById('loginArea');
const btnDefinir = document.getElementById('btnDefinir');
const btnLance = document.getElementById('btnLance');
const btnEscolherImagem = document.getElementById('btnEscolherImagem');
const btnRemoverImagem = document.getElementById('btnRemoverImagem');
const itemImageInput = document.getElementById('itemImage');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('preview');
const itemImagem = document.getElementById('itemImagem');
const itemNome = document.getElementById('itemNome');
const adminArea = document.getElementById('adminArea');

let itemImageBase64 = '';

btnAdmin.onclick = () => {
  const nome = 'Administrador';
  socket.emit('entrar', { 
    tipo: 'admin',
    nome: nome
  });
  
  loginArea.style.display = 'none';
  adminArea.style.display = 'block';
  addMessage('Você entrou como administrador.');
  
  // Focus on the item name input
  document.getElementById('nomeItem').focus();
};

btnPlayer.onclick = () => {
  const nome = playerNameInput.value.trim() || `Jogador${Math.floor(Math.random() * 1000)}`;
  if (nome.length < 2) {
    addMessage('Por favor, insira um nome com pelo menos 2 caracteres.', 'error');
    return;
  }
  
  socket.emit('entrar', { 
    tipo: 'player',
    nome: nome
  });
  
  loginArea.style.display = 'none';
  playerArea.style.display = 'block';
  document.querySelector('#playerArea h3').textContent = `Olá, ${nome}! Envie seu lance:`;
};

// Handle image selection
if (btnEscolherImagem) {
  btnEscolherImagem.addEventListener('click', (e) => {
    e.preventDefault();
    itemImageInput.click();
  });
}

// Handle image input change
if (itemImageInput) {
  itemImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        addMessage('A imagem é muito grande. Por favor, escolha uma imagem menor que 2MB.', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        itemImageBase64 = event.target.result;
        if (previewImg) {
          previewImg.src = itemImageBase64;
          imagePreview.style.display = 'block';
          if (btnRemoverImagem) {
            btnRemoverImagem.style.display = 'block';
          }
        }
      };
      reader.onerror = () => {
        addMessage('Erro ao carregar a imagem. Tente novamente.', 'error');
      };
      reader.readAsDataURL(file);
    }
  });
}

// Handle image removal
if (btnRemoverImagem) {
  btnRemoverImagem.addEventListener('click', (e) => {
    e.preventDefault();
    itemImageBase64 = '';
    if (itemImageInput) itemImageInput.value = '';
    if (imagePreview) imagePreview.style.display = 'none';
    if (btnRemoverImagem) btnRemoverImagem.style.display = 'none';
  });
}

document.getElementById('btnDefinir').onclick = () => {
  const nomeItem = document.getElementById('nomeItem').value.trim();
  const valorItem = document.getElementById('valorItem').value.trim();
  
  if (!nomeItem) {
    addMessage('Por favor, insira um nome para o item.', 'error');
    return;
  }
  
  if (!valorItem) {
    addMessage('Por favor, insira um valor para o item.', 'error');
    return;
  }
  
  if (isNaN(valorItem) || Number(valorItem) <= 0) {
    addMessage('Por favor, insira um valor numérico válido maior que zero.', 'error');
    return;
  }
  
  const itemData = {
    nome: nomeItem,
    valor: valorItem
  };
  
  // Only include image if one was selected
  if (itemImageBase64) {
    itemData.imagem = itemImageBase64;
  }
  
  socket.emit('definirItem', itemData);
  
  // Mostra o botão de finalizar leilão e esconde o formulário de definição
  if (adminItemSetup) adminItemSetup.style.display = 'none';
  if (adminAuctionControl) adminAuctionControl.style.display = 'block';
  if (btnFinalizarLeilao) btnFinalizarLeilao.style.display = 'block';
};

document.getElementById('btnLance').onclick = () => {
  const valorInput = document.getElementById('valorLance');
  const valor = valorInput.value.trim();
  
  if (!valor) {
    addMessage('Por favor, insira um valor para o lance.', 'error');
    return;
  }
  
  if (isNaN(valor) || Number(valor) <= 0) {
    addMessage('Por favor, insira um valor numérico válido maior que zero.', 'error');
    return;
  }
  
  socket.emit('enviarLance', valor);
  valorInput.value = ''; // Clear the input field
  valorInput.focus();    // Return focus to the input
};

function addMessage(msg, type = 'info') {
  const gameMessages = document.getElementById('gameMessages');
  if (!gameMessages) {
    console.error('Elemento gameMessages não encontrado!');
    return;
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.style.margin = '3px 0';
  messageDiv.style.padding = '4px 6px';
  messageDiv.style.borderRadius = '3px';
  messageDiv.style.fontSize = '11px';
  messageDiv.style.lineHeight = '1.4';
  
  // Adiciona timestamp
  const time = new Date().toLocaleTimeString();
  const timeSpan = document.createElement('span');
  timeSpan.textContent = `[${time}] `;
  timeSpan.style.color = '#aaa';
  timeSpan.style.fontSize = '0.9em';
  messageDiv.appendChild(timeSpan);
  
  // Adiciona a mensagem
  const msgSpan = document.createElement('span');
  msgSpan.textContent = msg;
  messageDiv.appendChild(msgSpan);
  
  // Estilização baseada no tipo de mensagem
  switch(type) {
    case 'error':
      messageDiv.style.color = '#ff6b6b';
      messageDiv.style.backgroundColor = 'rgba(255, 107, 107, 0.15)';
      break;
    case 'success':
      messageDiv.style.color = '#51cf66';
      messageDiv.style.backgroundColor = 'rgba(81, 207, 102, 0.15)';
      break;
    case 'warning':
      messageDiv.style.color = '#fcc419';
      messageDiv.style.backgroundColor = 'rgba(252, 196, 25, 0.15)';
      break;
    case 'info':
    default:
      messageDiv.style.color = '#4dabf7';
      messageDiv.style.backgroundColor = 'rgba(77, 171, 247, 0.15)';
  }
  
  // Adiciona a mensagem ao container
  gameMessages.appendChild(messageDiv);
  
  // Limita o número de mensagens visíveis
  const maxMessages = 20;
  const messages = gameMessages.children;
  
  // Remove mensagens mais antigas se exceder o limite
  while (messages.length > maxMessages) {
    gameMessages.removeChild(messages[0]);
  }
  
  // Rola para a mensagem mais recente
  gameMessages.scrollTop = gameMessages.scrollHeight;
}

// Adiciona um listener para o evento 'connect'
socket.on('connect', () => {
  console.log('Conectado ao servidor Socket.IO');
  console.log('Socket ID:', socket.id);
  addMessage('Conectado ao servidor', 'success');
  
  // Testa o envio de mensagem para o servidor
  console.log('Enviando teste de conexão para o servidor...');
  socket.emit('teste_conexao', { mensagem: 'Teste de conexão do cliente' });
});

// Listener para mensagens do servidor
socket.on('mensagem', (msg, tipo = 'info') => {
  console.log('Mensagem recebida do servidor:', { msg, tipo });
  addMessage(msg, tipo);
});

// Listener para erros de conexão
socket.on('connect_error', (error) => {
  console.error('Erro de conexão:', error);
  addMessage('Erro na conexão com o servidor', 'error');
});

// Listener para teste de conexão
socket.on('teste_conexao_resposta', (data) => {
  console.log('Resposta do servidor (teste_conexao_resposta):', data);
  addMessage('Conexão com o servidor confirmada', 'success');
});

// Adiciona um listener para o evento 'enviarLance_resposta'
socket.on('enviarLance_resposta', (resposta) => {
  console.log('Resposta do lance recebida:', resposta);
  if (resposta.erro) {
    console.log('Erro no lance:', resposta.mensagem);
    addMessage(`❌ ${resposta.mensagem}`, 'error');
  } else {
    console.log('Lance bem-sucedido:', resposta.mensagem);
    addMessage(`✅ ${resposta.mensagem}`, 'success');
  }
});

// Log de todos os eventos recebidos (para depuração)
socket.onAny((eventName, ...args) => {
  console.log(`Evento recebido: ${eventName}`, args);
});

// Verifica se o container de mensagens existe
const mensagensContainer = document.getElementById('mensagensContainer');
console.log('Container de mensagens encontrado:', mensagensContainer ? 'Sim' : 'Não');

// Adiciona uma mensagem de teste direta
setTimeout(() => {
  console.log('Adicionando mensagem de teste...');
  addMessage('Esta é uma mensagem de teste direta', 'info');
}, 1000);

// Atualiza a margem de preço na interface
function atualizarMargemPreco(min, max) {
  const margemPreco = document.getElementById('margemPreco');
  const valorMin = document.getElementById('valorMin');
  const valorMax = document.getElementById('valorMax');
  
  if (margemPreco && valorMin && valorMax) {
    valorMin.textContent = min.toLocaleString();
    valorMax.textContent = max.toLocaleString();
    margemPreco.style.display = 'flex';
  }
}

// Atualiza o melhor lance na interface
function atualizarMelhorLance(nome, valor) {
  const melhorLanceAtual = document.getElementById('melhorLanceAtual');
  if (melhorLanceAtual) {
    melhorLanceAtual.textContent = `Melhor lance: ${nome} - R$ ${valor.toLocaleString()}`;
  }
}

// Adiciona um listener para o evento 'novaRodada'
socket.on('novaRodada', (data) => {
  console.log('Nova rodada iniciada:', data);
  addMessage(`🏁 Rodada ${data.rodada} iniciada!`, 'info');
  addMessage(`💵 Faixa de valores: R$ ${data.min.toLocaleString()} - R$ ${data.max.toLocaleString()}`, 'info');
  
  // Atualiza a margem de preço
  atualizarMargemPreco(data.min, data.max);
  
  // Atualiza a interface do usuário para a nova rodada
  if (data.item) {
    const itemNome = document.getElementById('itemNome');
    const itemImagem = document.getElementById('itemImagem');
    
    if (itemNome) itemNome.textContent = data.item.nome || 'Item do leilão';
    if (itemImagem && data.item.imagem) {
      itemImagem.src = data.item.imagem;
      itemImagem.style.display = 'block';
    }
  }
});

// Atualiza o melhor lance quando receber do servidor
socket.on('atualizarMelhorLance', (melhorLance) => {
  if (melhorLance && melhorLance.nome && melhorLance.valor) {
    atualizarMelhorLance(melhorLance.nome, melhorLance.valor);
    addMessage(`🎯 ${melhorLance.nome} está com o melhor lance até agora: R$ ${melhorLance.valor.toLocaleString()}`, 'info');
  }
});

// Handle new round with item data
socket.on('novaRodada', (data) => {
  // Inicia a contagem regressiva
  startCountdown();
  
  // Aguarda o fim da contagem regressiva para mostrar o item
  setTimeout(() => {
    const itemNome = document.getElementById('itemNome');
    const itemImagem = document.getElementById('itemImagem');
    const itemDisplay = document.getElementById('itemDisplay');
    
    if (itemNome) {
      itemNome.textContent = data.item?.nome || 'Item do Leilão';
      itemNome.style.display = 'block'; // Always show the text
    }
    
    if (itemImagem) {
      if (data.item?.imagem) {
        itemImagem.src = data.item.imagem;
        itemImagem.style.display = 'block';
        // Keep the text visible below the image
        if (itemNome) itemNome.style.display = 'block';
      } else {
        itemImagem.style.display = 'none';
        // Still show the text even without an image
        if (itemNome) itemNome.style.display = 'block';
      }
    }
    
    // Mostrar a área do jogador quando um jogador se conectar
    document.getElementById('playerArea').style.display = 'block';
    
    // Mostrar as imagens dos jogadores
    document.getElementById('player1Image').style.display = 'block';
    document.getElementById('player2Image').style.display = 'block';
    
    // Focus on the bid input if in player area
    if (document.getElementById('playerArea').style.display !== 'none') {
      setTimeout(() => {
        const valorLance = document.getElementById('valorLance');
        if (valorLance) valorLance.focus();
      }, 100);
    }
  }, 5000); // 5 segundos para a contagem regressiva (1s por mensagem)
});

// Handle game reset after completion
socket.on('jogoReiniciado', () => {
  // Reset UI elements if needed
  if (adminConfig.style.display === 'none' && playerArea.style.display === 'none') {
    loginArea.style.display = 'block';
  }
});

// Handle round results (now handled by server messages)
socket.on('resultadoRodada', ({ vencedor, nome, valor }) => {
  // The server now sends the appropriate messages
});

// Handle enter key in player name input
playerNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    btnPlayer.click();
  }
});

// Handle enter key in bid input
document.getElementById('valorLance').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('btnLance').click();
  }
});

// Handle enter key in admin value input
document.getElementById('valorItem').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('btnDefinir').click();
  }
});

// Clear messages when starting a new game
socket.on('connect', () => {
  mensagens.innerHTML = '';
  addMessage('Conectado ao servidor. Escolha uma opção para começar.', 'info');
});

// Handle admin connection
socket.on('adminConnected', () => {
  loginArea.style.display = 'none';
  adminArea.style.display = 'block';
  
  // Garante que apenas o formulário de definição esteja visível ao conectar
  if (adminItemSetup) adminItemSetup.style.display = 'block';
  if (adminAuctionControl) adminAuctionControl.style.display = 'none';
  if (btnFinalizarLeilao) btnFinalizarLeilao.style.display = 'none';
  
  addMessage('Você está conectado como administrador.');
  document.getElementById('nomeItem').focus();
});

// Evento para finalizar o leilão
if (btnFinalizarLeilao) {
  btnFinalizarLeilao.addEventListener('click', () => {
    // Aqui você pode adicionar a lógica para finalizar o leilão
    // Por enquanto, apenas mostra uma mensagem
    addMessage('Leilão finalizado pelo administrador.');
    
    // Reexibe o formulário de definição de item
    if (adminItemSetup) adminItemSetup.style.display = 'block';
    if (adminAuctionControl) adminAuctionControl.style.display = 'none';
    if (btnFinalizarLeilao) btnFinalizarLeilao.style.display = 'none';
    
    // Limpa o formulário
    document.getElementById('nomeItem').value = '';
    document.getElementById('valorItem').value = '';
    if (imagePreview) imagePreview.style.display = 'none';
    if (btnRemoverImagem) btnRemoverImagem.style.display = 'none';
    itemImageBase64 = '';
    if (itemImageInput) itemImageInput.value = '';
    
    // Foca no campo de nome do item
    document.getElementById('nomeItem').focus();
  });
}

// Handle all game messages with type support
socket.on('mensagem', (msg, type = 'info') => {
  // Only add the message if it's not a duplicate of the last message
  const lastMessage = mensagens.lastElementChild?.textContent;
  const newMessage = `[${new Date().toLocaleTimeString()}] ${msg}`;
  
  if (lastMessage !== newMessage) {
    addMessage(msg, type);
    // Auto-scroll to bottom of messages
    window.scrollTo(0, document.body.scrollHeight);
  }
});
