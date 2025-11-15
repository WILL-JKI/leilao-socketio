# Leilão em Tempo Real com Socket.IO

Um jogo de leilão multiplayer em tempo real desenvolvido com Node.js, Express e Socket.IO, onde os jogadores competem para dar o lance mais próximo do valor secreto do item em leilão.


## ✨ Funcionalidades

- **Sistema de Salas**: Crie ou entre em salas de jogo
- **Modo Administrador**: Interface dedicada para gerenciar o leilão
- **Tempo Real**: Atualizações em tempo real para todos os jogadores
- **Múltiplos Itens**: Adicione diferentes itens para leilão
- **Sistema de Rodadas**: Partidas organizadas em rodadas
- **Histórico de Lances**: Acompanhe todos os lances realizados
- **Interface Responsiva**: Funciona bem em diferentes tamanhos de tela

## 🛠️ Tecnologias Utilizadas

- **Backend**:
  - Node.js
  - Express
  - Socket.IO
  - CORS

- **Frontend**:
  - HTML5
  - CSS3 (puro)
  - JavaScript (ES6+)

## 📦 Pré-requisitos

- Node.js (v14 ou superior)
- NPM (geralmente vem com o Node.js)
- Navegador moderno (Chrome, Firefox, Edge, etc.)

## 🚀 Como Executar

1. **Clone o repositório**
   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd leilao-socketio
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor**
   ```bash
   node server.js
   ```

4. **Acesse a aplicação**
   Abra seu navegador e acesse:
   ```
   http://localhost:3000
   ```

## 🎮 Como Jogar

### Para o Administrador:
1. Acesse a página inicial
2. Clique em "Entrar como Administrador"
3. Preencha os detalhes do item (nome, valor secreto e imagem opcional)
4. Clique em "Iniciar Leilão"
5. Gerencie as rodadas e acompanhe os lances

### Para os Jogadores:
1. Acesse a página inicial
2. Digite seu nome e clique em "Entrar como Jogador"
3. Aguarde o administrador iniciar o leilão
4. Envie seus lances dentro da faixa de valores
5. Tente chegar o mais próximo possível do valor secreto!

## 📂 Estrutura do Projeto

```
leilao-socketio/
├── public/               # Arquivos estáticos
│   ├── css/              # Estilos CSS
│   ├── js/               # Código JavaScript do cliente
│   └── index.html         # Página inicial
├── server.js             # Código do servidor
├── package.json          # Dependências e scripts
└── README.md             # Este arquivo
```

## 🔧 Variáveis de Ambiente

O projeto utiliza as seguintes variáveis de ambiente:

```env
PORT=3000                 # Porta em que o servidor irá rodar
NODE_ENV=development      # Ambiente de execução
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estes passos:

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Adicione suas mudanças (`git add .`)
4. Comite suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push da Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👏 Agradecimentos

- Equipe de desenvolvimento
- Comunidade de código aberto
- Todos os contribuidores e testadores

---

Desenvolvido por:
- [@Willamis](https://github.com/WILL-JKI)
- [@Samuel Nogueira](https://github.com/ORUK-z)
- [@Pedro Henrique](https://github.com/pedrobezerra14)
- [@Maria Vitoria](https://github.com/airotivmaria)
- [@João Carlos](https://github.com/JoaoCorreio)
