const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let admin = null;
let players = [];
let valorSecreto = 0;
let rodadaAtual = 1;
let lances = {};
const TOTAL_RODADAS = 3;

io.on('connection', (socket) => {
  console.log(`Novo usuário conectado: ${socket.id}`);

  socket.on('entrar', (tipo) => {
    if (tipo === 'admin' && !admin) {
      admin = socket.id;
      socket.emit('mensagem', 'Você entrou como ADMIN.');
    } else if (tipo === 'player' && players.length < 2) {
      players.push(socket.id);
      socket.emit('mensagem', `Você entrou como jogador ${players.length}.`);
    } else {
      socket.emit('mensagem', 'Sala cheia ou administrador já definido.');
    }
  });

  socket.on('definirItem', (valor) => {
    if (socket.id === admin) {
      valorSecreto = Number(valor);
      io.emit('mensagem', 'O leilão começou!');
      iniciarRodada();
    }
  });

  socket.on('enviarLance', (valor) => {
    if (players.includes(socket.id)) {
      lances[socket.id] = Number(valor);
      socket.emit('mensagem', `Seu lance de ${valor} foi recebido.`);
      if (Object.keys(lances).length === players.length) {
        encerrarRodada();
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Usuário saiu: ${socket.id}`);
    players = players.filter(id => id !== socket.id);
    if (socket.id === admin) admin = null;
  });
});

function iniciarRodada() {
  lances = {};
  io.emit('novaRodada', rodadaAtual);
  io.emit('mensagem', `Rodada ${rodadaAtual} iniciada! Enviem seus lances.`);
}

function encerrarRodada() {
  const vencedores = Object.entries(lances).sort((a, b) => b[1] - a[1]);
  const vencedor = vencedores[0];

  io.emit('mensagem', `Rodada ${rodadaAtual} encerrada!`);
  io.emit('resultadoRodada', { vencedor: vencedor[0], valor: vencedor[1] });

  rodadaAtual++;

  if (rodadaAtual <= TOTAL_RODADAS) {
    setTimeout(iniciarRodada, 5000);
  } else {
    finalizarLeilao();
  }
}

function finalizarLeilao() {
  let vencedorFinal = null;
  let menorDiferenca = Infinity;

  for (const [id, valor] of Object.entries(lances)) {
    const diferenca = valorSecreto - valor;
    if (diferenca >= 0 && diferenca < menorDiferenca) {
      menorDiferenca = diferenca;
      vencedorFinal = id;
    }
  }

  io.emit('mensagem', '🏁 Leilão encerrado!');
  if (vencedorFinal) {
    io.emit('mensagem', `Vencedor final: ${vencedorFinal} com o lance mais próximo (${valorSecreto}).`);
  } else {
    io.emit('mensagem', 'Ninguém ficou abaixo do valor secreto.');
  }
}

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
