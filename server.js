const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let admin = null;
let players = [];
let playerNames = new Map(); // To store player names
let valorSecreto = 0;
let rodadaAtual = 1;
let lances = {};
const TOTAL_RODADAS = 3;
let faixasValores = []; // Para armazenar as faixas de cada rodada
let melhorLance = { diferenca: Infinity, jogador: null };

io.on('connection', (socket) => {
  console.log(`Novo usuário conectado: ${socket.id}`);

  socket.on('entrar', (data) => {
    if (data.tipo === 'admin' && !admin) {
      admin = socket.id;
      socket.emit('mensagem', 'Você entrou como ADMIN.');
      io.emit('mensagem', 'Administrador conectado. Aguardando jogadores...');
    } else if (data.tipo === 'player' && players.length < 2) {
      const playerName = data.nome || `Jogador ${players.length + 1}`;
      players.push(socket.id);
      playerNames.set(socket.id, playerName);
      
      socket.emit('mensagem', `Bem-vindo, ${playerName}! Você é o Jogador ${players.length}.`);
      io.emit('mensagem', `${playerName} entrou no jogo!`);
      
      if (players.length === 2) {
        io.emit('mensagem', 'Dois jogadores conectados! O jogo pode começar quando o administrador definir o valor do item.');
      } else if (players.length === 1) {
        io.emit('mensagem', 'Aguardando mais um jogador para começar...');
      }
    } else {
      socket.emit('mensagem', 'Sala cheia ou administrador já definido.');
    }
  });

  socket.on('definirItem', (valor) => {
    if (socket.id === admin) {
      valorSecreto = Number(valor);
      
      // Gera faixas aleatórias para cada rodada
      faixasValores = [];
      for (let i = 0; i < TOTAL_RODADAS; i++) {
        const min = Math.floor(Math.random() * (valorSecreto * 0.8)) + 1; // Até 80% do valor
        const max = Math.floor(valorSecreto * (1.2 + Math.random() * 0.8)); // Até 200% do valor
        faixasValores.push({ min, max });
      }
      
      io.emit('mensagem', 'O leilão começou!');
      io.emit('mensagem', `O valor secreto foi definido. Boa sorte!`);
      iniciarRodada();
    }
  });

  socket.on('enviarLance', (valor) => {
    if (players.includes(socket.id) && rodadaAtual <= TOTAL_RODADAS) {
      const playerName = playerNames.get(socket.id) || `Jogador ${players.indexOf(socket.id) + 1}`;
      const lance = Number(valor);
      const faixaAtual = faixasValores[rodadaAtual - 1];
      
      // Verifica se o lance está dentro da faixa permitida
      if (lance < faixaAtual.min || lance > faixaAtual.max) {
        socket.emit('mensagem', `❌ Lance inválido! O lance deve estar entre R$ ${faixaAtual.min.toLocaleString()} e R$ ${faixaAtual.max.toLocaleString()}`, 'error');
        return;
      }
      
      // Verifica se o jogador já fez um lance nesta rodada
      if (lances[socket.id]) {
        socket.emit('mensagem', '❌ Você já fez um lance nesta rodada!', 'error');
        return;
      }
      
      // Verifica se o jogador já perdeu
      if (lances[socket.id] === 'eliminado') {
        socket.emit('mensagem', '❌ Você foi eliminado por ter feito um lance acima do valor secreto!', 'error');
        return;
      }
      
      // Verifica se o lance é maior que o valor secreto
      if (lance > valorSecreto) {
        lances[socket.id] = 'eliminado';
        io.emit('mensagem', `💥 ${playerName} foi eliminado por dar um lance acima do valor secreto!`, 'error');
        
        // Verifica se ainda há jogadores ativos
        const jogadoresAtivos = players.filter(id => lances[id] !== 'eliminado').length;
        if (jogadoresAtivos <= 1) {
          finalizarLeilao();
          return;
        }
        
        // Verifica se todos os jogadores já fizeram seus lances
        const lancesAtuais = Object.keys(lances).filter(id => lances[id] !== 'eliminado').length;
        if (lancesAtuais >= jogadoresAtivos) {
          encerrarRodada();
        }
        return;
      }
      
      // Registra o lance
      lances[socket.id] = {
        valor: lance,
        nome: playerName,
        diferenca: Math.abs(valorSecreto - lance)
      };
      
      // Atualiza o melhor lance
      if (lances[socket.id].diferenca < melhorLance.diferenca) {
        melhorLance = {
          jogador: socket.id,
          nome: playerName,
          valor: lance,
          diferenca: lances[socket.id].diferenca
        };
      }
      
      socket.emit('mensagem', `✅ Seu lance de R$ ${lance.toLocaleString()} foi recebido.`);
      socket.broadcast.emit('mensagem', `📝 ${playerName} fez um lance.`);
      
      // Verifica se todos os jogadores fizeram seus lances
      const jogadoresAtivos = players.filter(id => lances[id] !== 'eliminado').length;
      const lancesAtuais = Object.values(lances).filter(lance => lance !== 'eliminado').length;
      
      if (lancesAtuais >= jogadoresAtivos) {
        encerrarRodada();
      }
    }
  });

  socket.on('disconnect', () => {
    const playerName = playerNames.get(socket.id) || 'Um jogador';
    console.log(`Usuário saiu: ${socket.id} (${playerName})`);
    
    if (players.includes(socket.id)) {
      io.emit('mensagem', `${playerName} saiu do jogo.`);
    } else if (socket.id === admin) {
      io.emit('mensagem', 'O administrador saiu. O jogo será reiniciado.');
    }
    
    players = players.filter(id => id !== socket.id);
    playerNames.delete(socket.id);
    if (socket.id === admin) admin = null;
    
    // Reset game if admin leaves
    if (!admin) {
      players = [];
      playerNames.clear();
      rodadaAtual = 1;
      lances = {};
    }
  });
});

function iniciarRodada() {
  lances = {};
  const faixa = faixasValores[rodadaAtual - 1];
  
  // Envia a faixa de valores para todos os jogadores
  io.emit('novaRodada', { 
    rodada: rodadaAtual,
    min: faixa.min,
    max: faixa.max
  });
  
  io.emit('mensagem', `🎯 Rodada ${rodadaAtual} de ${TOTAL_RODADAS}`, 'info');
  io.emit('mensagem', `💵 Faixa de lances: R$ ${faixa.min.toLocaleString()} a R$ ${faixa.max.toLocaleString()}`, 'info');
  io.emit('mensagem', 'Envie seu lance!', 'info');
}

function encerrarRodada() {
  // Encontra o vencedor da rodada atual
  const lancesValidos = Object.entries(lances)
    .filter(([_, lance]) => lance !== 'eliminado')
    .map(([id, lance]) => ({
      id,
      nome: lance.nome,
      valor: lance.valor,
      diferenca: lance.diferenca
    }));
    
  // Ordena por quem está mais próximo do valor secreto
  lancesValidos.sort((a, b) => a.diferenca - b.diferenca);
  
  const vencedorRodada = lancesValidos[0];
  
  // Atualiza o melhor lance global
  if (vencedorRodada && vencedorRodada.diferenca < melhorLance.diferenca) {
    melhorLance = {
      jogador: vencedorRodada.id,
      nome: vencedorRodada.nome,
      valor: vencedorRodada.valor,
      diferenca: vencedorRodada.diferenca
    };
  }
  
  // Envia mensagem sobre o vencedor da rodada, se houver
  if (vencedorRodada) {
    io.emit('mensagem', `🏆 ${vencedorRodada.nome} está na vantagem após a rodada ${rodadaAtual}!`, 'success');
  } else {
    io.emit('mensagem', `ℹ️ Nenhum vencedor na rodada ${rodadaAtual}.`, 'info');
  }
  
  // Prepara para a próxima rodada
  rodadaAtual++;
  
  if (rodadaAtual <= TOTAL_RODADAS) {
    // Mostra contagem regressiva para a próxima rodada
    let countdown = 5;
    io.emit('mensagem', `⏳ Próxima rodada em ${countdown}...`, 'info');
    
    const timer = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        io.emit('mensagem', `⏳ Próxima rodada em ${countdown}...`, 'info');
      } else {
        clearInterval(timer);
        iniciarRodada();
      }
    }, 1000);
  } else {
    // Se for a última rodada, finaliza o leilão
    finalizarLeilao();
  }
}

function finalizarLeilao() {
  // Encontra todos os jogadores que não foram eliminados
  const jogadoresAtivos = players.filter(id => lances[id] !== 'eliminado');
  
  // Se houver apenas um jogador ativo, ele é o vencedor
  if (jogadoresAtivos.length === 1) {
    const vencedorId = jogadoresAtivos[0];
    const nomeVencedor = playerNames.get(vencedorId) || 'Um jogador';
    io.emit('mensagem', '🏁 Leilão encerrado!', 'success');
    io.emit('mensagem', `🏆 ${nomeVencedor} é o vencedor por ser o último jogador restante!`, 'success');
    io.emit('mensagem', `💎 Valor secreto: R$ ${valorSecreto.toLocaleString()}`, 'success');
    return;
  }
  
  // Se todos foram eliminados
  if (jogadoresAtivos.length === 0) {
    io.emit('mensagem', '🏁 Leilão encerrado!', 'info');
    io.emit('mensagem', '❌ Todos os jogadores foram eliminados! Nenhum vencedor.', 'error');
    io.emit('mensagem', `💎 Valor secreto: R$ ${valorSecreto.toLocaleString()}`, 'info');
    return;
  }
  
  // Se houver um melhor lance válido
  if (melhorLance.jogador) {
    io.emit('mensagem', '🏁 Leilão encerrado!', 'success');
    io.emit('mensagem', 
      `🏆 Vencedor: ${melhorLance.nome} com o lance de R$ ${melhorLance.valor.toLocaleString()}`,
      'success'
    );
    io.emit('mensagem', 
      `💎 Valor secreto: R$ ${valorSecreto.toLocaleString()} (diferença: R$ ${melhorLance.diferenca.toLocaleString()})`,
      'info'
    );
  } else {
    io.emit('mensagem', '🏁 Leilão encerrado!', 'info');
    io.emit('mensagem', 'ℹ️ Nenhum vencedor. Nenhum lance válido foi feito.', 'info');
    io.emit('mensagem', `💎 Valor secreto: R$ ${valorSecreto.toLocaleString()}`, 'info');
  }
  
  // Prepara para um novo jogo
  rodadaAtual = 1;
  lances = {};
  melhorLance = { diferenca: Infinity, jogador: null };
  io.emit('jogoReiniciado');
}

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
