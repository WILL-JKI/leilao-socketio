const socket = io();

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
  const p = document.createElement('p');
  p.textContent = msg;
  
  // Add different styling based on message type
  if (type === 'error') {
    p.style.color = '#ff6b6b';
  } else if (type === 'success') {
    p.style.color = '#51cf66';
  } else if (type === 'warning') {
    p.style.color = '#fcc419';
  }
  
  // Add timestamp
  const time = new Date().toLocaleTimeString();
  const timeSpan = document.createElement('span');
  timeSpan.textContent = `[${time}] `;
  timeSpan.style.color = '#666';
  p.insertBefore(timeSpan, p.firstChild);
  
  mensagens.appendChild(p);
  mensagens.scrollTop = mensagens.scrollHeight;
}

socket.on('mensagem', (msg) => {
  addMessage(msg);
});

// Função para exibir contagem regressiva
function startCountdown() {
  const countdownElement = document.getElementById('countdown');
  const messages = [
    { text: 'Prepare-se...', duration: 1000 },
    { text: '3...', duration: 1000 },
    { text: '2...', duration: 1000 },
    { text: '1...', duration: 1000 },
    { text: 'Comecem os Lances!', duration: 1000 }
  ];

  let index = 0;
  
  function showNextMessage() {
    if (index >= messages.length) {
      countdownElement.style.opacity = '0';
      setTimeout(() => {
        countdownElement.textContent = '';
      }, 300);
      return;
    }
    
    const message = messages[index];
    countdownElement.textContent = message.text;
    countdownElement.style.opacity = '1';
    
    setTimeout(() => {
      countdownElement.style.opacity = '0';
      setTimeout(() => {
        index++;
        showNextMessage();
      }, 300);
    }, message.duration);
  }
  
  showNextMessage();
}

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
