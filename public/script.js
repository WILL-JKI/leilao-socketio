const socket = io();

const btnAdmin = document.getElementById('btnAdmin');
const btnPlayer = document.getElementById('btnPlayer');
const adminConfig = document.getElementById('adminConfig');
const playerArea = document.getElementById('playerArea');
const mensagens = document.getElementById('mensagens');

btnAdmin.onclick = () => {
  socket.emit('entrar', 'admin');
  adminConfig.style.display = 'block';
};

btnPlayer.onclick = () => {
  socket.emit('entrar', 'player');
  playerArea.style.display = 'block';
};

document.getElementById('btnDefinir').onclick = () => {
  const valor = document.getElementById('valorItem').value;
  socket.emit('definirItem', valor);
};

document.getElementById('btnLance').onclick = () => {
  const valor = document.getElementById('valorLance').value;
  socket.emit('enviarLance', valor);
};

socket.on('mensagem', (msg) => {
  const p = document.createElement('p');
  p.textContent = msg;
  mensagens.appendChild(p);
  mensagens.scrollTop = mensagens.scrollHeight;
});

socket.on('novaRodada', (n) => {
  const p = document.createElement('p');
  p.textContent = `🕐 Iniciando rodada ${n}...`;
  mensagens.appendChild(p);
});

socket.on('resultadoRodada', ({ vencedor, valor }) => {
  const p = document.createElement('p');
  p.textContent = `🏆 Rodada vencida por ${vencedor} com ${valor}!`;
  mensagens.appendChild(p);
});
