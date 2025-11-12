const socket = io();

const btnAdmin = document.getElementById('btnAdmin');
const btnPlayer = document.getElementById('btnPlayer');
const playerNameInput = document.getElementById('playerName');
const adminConfig = document.getElementById('adminConfig');
const playerArea = document.getElementById('playerArea');
const mensagens = document.getElementById('mensagens');
const loginArea = document.getElementById('loginArea');

btnAdmin.onclick = () => {
  socket.emit('entrar', { tipo: 'admin' });
  loginArea.style.display = 'none';
  adminConfig.style.display = 'block';
  addMessage('Você entrou como administrador.');
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

document.getElementById('btnDefinir').onclick = () => {
  const valorInput = document.getElementById('valorItem');
  const valor = valorInput.value.trim();
  
  if (!valor) {
    addMessage('Por favor, insira um valor para o item.', 'error');
    return;
  }
  
  if (isNaN(valor) || Number(valor) <= 0) {
    addMessage('Por favor, insira um valor numérico válido maior que zero.', 'error');
    return;
  }
  
  socket.emit('definirItem', valor);
  valorInput.value = '';
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

// Handle new round with min and max values
socket.on('novaRodada', ({ rodada, min, max }) => {
  // This is now handled by the server's mensagem events
  // The min and max values are shown in the messages from the server
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

// Add a message when the admin starts the game
socket.on('mensagem', (msg, type = 'info') => {
  addMessage(msg, type);
  
  // Auto-scroll to bottom of messages
  window.scrollTo(0, document.body.scrollHeight);
});
