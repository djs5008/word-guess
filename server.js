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
  if (sessionData !== undefined && sessionData !== null) {
    console.log('Client: \'' + sessionData.username + '\'(' + sessionData.userID + ') Unregistered!');
    clearInterval(users[socket.id].lobbyDispatcher);
    users[socket.id] = null;
  }
}

function checkRegistration(socket, userID) {
  let sessionData = users[socket.id];
  socket.emit('registration_check', (sessionData !== undefined && sessionData !== null));
}

function createLobby(socket, lobbyName, maxPlayers, rounds, privateLobby, password) {
  let sessionData = users[socket.id];
  if (sessionData !== undefined && sessionData !== null) {
    setTimeout(() => {
      let lobbyID = uuid().toString().replace(/-/g, '');
      lobbies[lobbyID] = new LobbyData(lobbyName, maxPlayers, rounds, privateLobby, password);
      socket.emit('lobbycreated', lobbyID);
      console.log('Created Lobby: ' + lobbyID);
    }, 1000);
  }
}

function joinGame(socket, lobbyID) {
  let sessionData = users[socket.id];
  if (sessionData !== undefined && sessionData !== null) {
    setTimeout(() => {
      // Tell the client they joined
      socket.emit('joined');

      // Set the client join data
      sessionData.joinGame(lobbyID);
      lobbies[lobbyID].connect(sessionData.userID);

      console.log('User \'' + sessionData.username + '\'(' + sessionData.userID + ') Joined Lobby: ' + lobbyID);
    }, 1000);
  }
}

function leaveGame(socket, disconnect) {
  let sessionData = users[socket.id];
  // Ensure they are signed in and in a game
  if (sessionData !== null && sessionData !== undefined) {
    if (sessionData.connectedGame !== undefined) {
      setTimeout(() => {
        // Tell the client they left
        socket.emit('left');
        console.log('User \'' + sessionData.username + '\'(' + sessionData.userID + ') Left Lobby: ' + sessionData.connectedGame);

        // Disconnect the client from their lobby
        lobbies[sessionData.connectedGame].disconnect(sessionData.userID);

        // Don't remove session data if they just refreshed page
        if (!disconnect) {
          sessionData.leaveGame();
        }
      }, 1000);
    }
  }
}

io.on('connection', (socket) => {
  socket.on('register', (username, userID) => registerUser(username, userID, socket));
  socket.on('unregister', () => unregisterUser(socket));
  socket.on('checkRegistration', (userID) => checkRegistration(socket, userID));
  socket.on('createlobby', (lobbyName, maxPlayers, rounds, privateLobby, password) => createLobby(socket, lobbyName, maxPlayers, rounds, privateLobby, password));
  socket.on('joining', (lobbyID) => joinGame(socket, lobbyID));
  socket.on('leaving', () => leaveGame(socket, false));
  socket.on('disconnect', () => {
    leaveGame(socket, true);
    unregisterUser(socket);
  });
});

io.listen(port);
console.log('Server listening on *:' + port);