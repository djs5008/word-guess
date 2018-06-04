const io = require('socket.io')();
const uuid = require('uuid/v4');
const port = 3001;

const REGISTER_DELAY = 750;
const CREATE_DELAY = 1000;
const JOIN_DELAY = 1000;
const LEAVE_DELAY = 500;
const RETRIEVE_GAME_DELAY = 100;
const LOBBY_DISPATCH_INTERVAL = 500;
const PLAYER_DISPATCH_INTERVAL = 250;

let users = {};
class SessionData {
  constructor(socketID, username) {
    this.socketID = socketID;
    this.username = username;
    this.connectedGame = undefined;
    this.lobbyDispatcher = undefined;
    this.playerDispatcher = undefined;
  }

  joinGame(gameID) {
    this.connectedGame = gameID;
  }

  leaveGame() {
    this.connectedGame = undefined;
  }
}

let lobbies = {};
let lobbyPasswords = {};
class LobbyData {
  constructor(creatorID, lobbyName, maxPlayers, rounds, privateLobby) {
    this.creatorID = creatorID;
    this.lobbyName = lobbyName;
    this.maxPlayers = maxPlayers;
    this.rounds = rounds;
    this.privateLobby = privateLobby;
    this.connectedUsers = [];
    this.bannedUsers = [];
  }

  connect(userID) {
    this.connectedUsers.push(userID);
  }

  disconnect(userID) {
    this.connectedUsers = this.connectedUsers.filter(id => id !== userID);
  }

  ban(userID) {
    this.bannedUsers.push(userID);
  }
}

function getConnectedUsernames(lobbyID) {
  let lobby = lobbies[lobbyID];
  let result = [];
  lobby.connectedUsers.forEach(userID => {
    result.push({
      username: users[userID].username,
      userID: userID,
    });
  });
  return result;
}

function getUserID(socketID) {
  let result = null;
  Object.keys(users).forEach(userID => {
    if (users[userID] !== null) {
      if (users[userID].socketID === socketID) {
        result = userID;
        return;
      }
    }
  });
  return result;
}

function registerUser(socket, username, userID) {
  setTimeout(() => {
    if (users[userID] === undefined || users[userID] === null) {
      users[userID] = new SessionData(socket.id, username);
    }

    // Setup lobby dispatcher interval
    users[userID].lobbyDispatcher = setInterval(() => {
      socket.emit('lobbies', lobbies);
    }, LOBBY_DISPATCH_INTERVAL);

    // Setup new socket ID (refreshes each page visit)
    users[userID].socketID = socket.id;
    
    // Alert client of successful registration
    socket.emit('registered');
    console.log('User: \'' + username + '\'(' + userID + ') Registered!');
  }, REGISTER_DELAY);
}

function unregisterUser(socket, userID, disconnect) {
  let sessionData = users[userID];
  if (sessionData !== undefined && sessionData !== null) {
    clearInterval(sessionData.lobbyDispatcher);
    if (disconnect) {
      console.log('User: \'' + sessionData.username + '\'(' + userID + ') Disconnected!');
    } else {
      console.log('User: \'' + sessionData.username + '\'(' + userID + ') Unregistered!');
      users[userID] = null;
    }
  }
}

function checkRegistration(socket, userID) {
  let sessionData = users[userID];
  socket.emit('registration_check', (sessionData !== undefined && sessionData !== null));
}

function createLobby(socket, userID, lobbyName, maxPlayers, rounds, privateLobby, password) {
  let sessionData = users[userID];
  if (sessionData !== undefined && sessionData !== null) {
    setTimeout(() => {
      let lobbyID = uuid().toString().replace(/-/g, '');
      lobbies[lobbyID] = new LobbyData(userID, lobbyName, maxPlayers, rounds, privateLobby);
      lobbyPasswords[lobbyID] = password;
      socket.emit('lobbycreated', lobbyID);
      console.log('Lobby Created: ' + lobbyID);
    }, CREATE_DELAY);
  }
}

function joinGame(socket, userID, lobbyID, password) {
  let sessionData = users[userID];
  let lobby = lobbies[lobbyID];
  if (sessionData !== undefined && sessionData !== null) {
    if (!lobby.connectedUsers.includes(userID)) {
      if (lobby !== undefined && lobby !== null) {
        if (!lobby.privateLobby
          || lobby.connectedUsers.includes(userID)
          || lobbyPasswords[lobbyID] === password) {
          if (!lobby.bannedUsers.includes(userID)) {
            setTimeout(() => {
              // Tell the client they joined
              socket.emit('joined', true);

              // Set the client join data
              sessionData.joinGame(lobbyID);
              lobby.connect(userID);

              users[userID].playerDispatcher = setInterval(() => {
                socket.emit('connectedPlayers', getConnectedUsernames(lobbyID));
              }, PLAYER_DISPATCH_INTERVAL);

              console.log('User \'' + sessionData.username + '\'(' + userID + ') Joined Lobby: ' + lobbyID);
            }, JOIN_DELAY);
          } else {
            setTimeout(() => {
              // Tell the client they are banned
              socket.emit('joined', false, 'banned from game lobby');
            }, JOIN_DELAY);
          }
        } else {
          setTimeout(() => {
            // Tell the client they had the wrong password
            socket.emit('joined', false, 'invalid password');
          }, JOIN_DELAY);
        }
      }
    }
  }
}

function leaveGame(socket, userID, disconnect) {
  let sessionData = users[userID];
  if (sessionData !== null && sessionData !== undefined) {
    let lobby = lobbies[sessionData.connectedGame];
    if (lobby !== null && lobby !== undefined) {
      setTimeout(() => {
        // Tell the client they left
        socket.emit('left');

        // Disconnect the client from their lobby
        lobby.disconnect(userID);

        clearInterval(sessionData.playerDispatcher);

        if (disconnect) {
          // Don't remove session data if they just refreshed page
          console.log('User \'' + sessionData.username + '\'(' + userID + ') Disconnected from Lobby: ' + sessionData.connectedGame);
        } else {
          // Remove user's session data
          sessionData.leaveGame();
          console.log('User \'' + sessionData.username + '\'(' + userID + ') Left Lobby: ' + sessionData.connectedGame);
        }
      }, LEAVE_DELAY);
    }
  }
}

function getCurrentGame(socket, userID) {
  let sessionData = users[userID];
  if (sessionData !== null && sessionData !== undefined) {
    setTimeout(() => {
      let lobby = lobbies[sessionData.connectedGame];
      let creatorID = undefined;
      if (lobby !== undefined && lobby !== null) {
        creatorID = lobby.creatorID;
      }
      socket.emit('retrievegame_status', sessionData.connectedGame, creatorID === userID);
    }, RETRIEVE_GAME_DELAY);
  }
}

function kickUser(masterID, userID) {
  let sessionData = users[userID];
  if (sessionData !== null && sessionData !== undefined) {
    let lobby = lobbies[sessionData.connectedGame];
    if (lobby !== undefined && lobby !== null) {
      if (lobby.creatorID === masterID) {
        let userSocket = io.sockets.connected[sessionData.socketID];
        let masterSocket = io.sockets.connected[users[masterID].socketID];
        if (userSocket !== undefined && userSocket !== null
          && masterSocket !== undefined && masterSocket !== null) {
          console.log('User \'' + sessionData.username + '\'(' + userID + ') Kicked from Lobby: ' + sessionData.connectedGame);
          userSocket.emit('kick', userID, 'you have been kicked!');
          masterSocket.emit('kicked', userID);
        }
      }
    }
  }
}

function banUser(masterID, userID) {
  let sessionData = users[userID];
  if (sessionData !== null && sessionData !== undefined) {
    let lobby = lobbies[sessionData.connectedGame];
    if (lobby !== undefined && lobby !== null) {
      if (lobby.creatorID === masterID) {
        let userSocket = io.sockets.connected[sessionData.socketID];
        let masterSocket = io.sockets.connected[users[masterID].socketID];
        if (userSocket !== undefined && userSocket !== null
          && masterSocket !== undefined && masterSocket !== null) {
          console.log('User \'' + sessionData.username + '\'(' + userID + ') Banned from Lobby: ' + sessionData.connectedGame);
          userSocket.emit('kick', userID, 'you have been banned!');
          masterSocket.emit('kicked', userID);
          lobby.ban(userID);
        }
      }
    }
  }
}

function echoLine(userID, line) {
  let user = users[userID];
  if (user !== undefined && user !== null) {
    let lobby = lobbies[user.connectedGame];
    if (lobby !== undefined && lobby !== null) {
      lobby.connectedUsers.forEach(playerID => {
        if (userID !== playerID) {
          let player = users[playerID];
          let socket = io.sockets.connected[player.socketID];
          if (socket !== undefined && socket !== null) {
            io.sockets.connected[player.socketID].emit('line', line);
          }
        }
      });
    }
  }
}

function echoMouses(userID, x, y, color, size) {
  let user = users[userID];
  if (user !== undefined && user !== null) {
    let lobby = lobbies[user.connectedGame];
    if (lobby !== undefined && lobby !== null) {
      lobby.connectedUsers.forEach(playerID => {
        if (userID !== playerID) {
          let player = users[playerID];
          let socket = io.sockets.connected[player.socketID];
          if (socket !== undefined && socket !== null) {
            socket.emit('mousePos', userID, x, y, color, size);
          }
        }
      });
    }
  }
}

function makeGuess(userID, guess) {
  if (guess.length <= 30) {
    if (guess.replace(/ /g, '') !== '') {
      let user = users[userID];
      if (user !== undefined && user !== null) {
        let lobby = lobbies[user.connectedGame];
        if (lobby !== undefined && lobby !== null) {
          lobby.connectedUsers.forEach(playerID => {
            let player = users[playerID];
            let socket = io.sockets.connected[player.socketID];
            if (socket !== undefined && socket !== null) {
              socket.emit('guess', userID, user.username, guess);
            }
          });
        }
      }
    }  
  }  
}

io.on('connection', (socket) => {
  socket.on('register', (username, userID) => registerUser(socket, username, userID));
  socket.on('unregister', (userID) => unregisterUser(socket, userID, false));
  socket.on('checkRegistration', (userID) => checkRegistration(socket, userID));
  
  socket.on('createlobby', (userID, lobbyName, maxPlayers, rounds, privateLobby, password) => createLobby(socket, userID, lobbyName, maxPlayers, rounds, privateLobby, password));
  socket.on('joining', (userID, lobbyID, password) => joinGame(socket, userID, lobbyID, password));
  socket.on('leaving', (userID) => leaveGame(socket, userID, false));
  socket.on('retrievegame', (userID) => getCurrentGame(socket, userID));
  socket.on('banuser', (masterID, userID) => banUser(masterID, userID));
  socket.on('kickuser', (masterID, userID) => kickUser(masterID, userID));

  socket.on('line', (userID, line) => echoLine(userID, line));
  socket.on('mousePos', (userID, x, y, color, size) => echoMouses(userID, x, y, color, size));
  socket.on('guess', (userID, guess) => makeGuess(userID, guess));

  socket.on('disconnect', () => {
    leaveGame(socket, getUserID(socket.id), true);
    unregisterUser(socket, getUserID(socket.id), true);
  });
});

io.listen(port);
console.log('Server listening on *:' + port);