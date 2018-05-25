const io = require('socket.io')();
const uuid = require('uuid/v4');
const port = 3001;

let users = {};
class SessionData {
  constructor(username, userID) {
    this.username = username;
    this.userID = userID;
    this.connectedGame = undefined;
    this.lobbyDispatcher = undefined;
  }

  joinGame(gameID) {
    this.connectedGame = gameID;
  }

  leaveGame() {
    this.connectedGame = undefined;
  }
}

let lobbies = {};
class LobbyData {
  constructor(lobbyName, maxPlayers, rounds, privateLobby, password) {
    this.lobbyName = lobbyName;
    this.maxPlayers = maxPlayers;
    this.rounds = rounds;
    this.privateLobby = privateLobby;
    this.password = password;
    this.connectedUsers = [];
  }

  connect(userID) {
    this.connectedUsers.push(userID);
  }

  disconnect(userID) {
    this.connectedUsers = this.connectedUsers.filter(id => id !== userID);
  }
}

function registerUser(username, userID, socket) {
  console.log('Client: \'' + username + '\'(' + userID + ') Registered!');
  users[socket.id] = new SessionData(username, userID);
  users[socket.id].lobbyDispatcher = setInterval(() => {
    socket.emit('lobbies', lobbies);
  }, 500);
  socket.emit('registered');
}

function unregisterUser(socket) {
  let sessionData = users[socket.id];
  if (sessionData !== undefined) {
    console.log('Client: \'' + sessionData.username + '\'(' + sessionData.userID + ') Unregistered!');
    clearInterval(users[socket.id].lobbyDispatcher);
    users[socket.id] = null;
  }
}

function createLobby(socket, lobbyName, maxPlayers, rounds, privateLobby, password) {
  let sessionData = users[socket.id];
  if (sessionData !== undefined) {
    let lobbyID = uuid().toString().replace(/-/g, '');
    lobbies[lobbyID] = new LobbyData(lobbyName, maxPlayers, rounds, privateLobby, password);
    socket.emit('lobbycreated', lobbyID);
    console.log('Created Lobby: ' + lobbyID);
  }
}

function joinGame(socket, lobbyID) {
  let sessionData = users[socket.id];
  if (sessionData !== undefined) {
    socket.emit('joined');
    console.log('User \'' + sessionData.username + '\'(' + sessionData.userID + ') Joined Lobby: ' + lobbyID);
  }
}

io.on('connection', (socket) => {
  socket.on('register', (username, userID) => registerUser(username, userID, socket));
  socket.on('unregister', () => unregisterUser(socket));
  socket.on('createlobby', (lobbyName, maxPlayers, rounds, privateLobby, password) => createLobby(socket, lobbyName, maxPlayers, rounds, privateLobby, password));
  socket.on('joining', (lobbyID) => joinGame(socket, lobbyID));
  socket.on('disconnect', () => unregisterUser(socket));
});

io.listen(port);
console.log('Server listening on *:' + port);