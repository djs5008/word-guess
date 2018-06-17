const io = require('socket.io')();
const uuid = require('uuid/v4');
const http = require('http');
const port = 3001;

const REGISTER_DELAY = 500;
const CREATE_DELAY = 500;
const JOIN_DELAY = 500;
const LEAVE_DELAY = 500;
const RETRIEVE_GAME_DELAY = 100;
const DEFAULT_WORD_TIME = 90;
const NEW_WORD_DELAY = 5000;

let users = {};
class SessionData {
  constructor(socketID, username) {
    this.socketID = socketID;
    this.username = username;
    this.connectedGame = undefined;
    this.score = 0;
    this.guessedCorrectly = false;
  }

  joinGame(gameID) {
    this.connectedGame = gameID;
  }

  leaveGame() {
    this.connectedGame = undefined;
  }

  setScore(score) {
    this.score = score;
}
}

let lobbies = {};
let lobbyPasswords = {};
let wordTimers = {};
class LobbyData {
  constructor(creatorID, lobbyName, maxPlayers, rounds, privateLobby) {
    this.creatorID = creatorID;
    this.lobbyName = lobbyName;
    this.maxPlayers = maxPlayers;
    this.rounds = rounds;
    this.privateLobby = privateLobby;
    this.connectedUsers = [];
    this.bannedUsers = [];
    this.gameState = {
      currentDrawer: undefined,
      activeWord: undefined,
      timeLeft: -1,
      round: 0,
      scores: {},
      lines: [],
    };
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
  if (lobby != null) {
    lobby.connectedUsers.forEach(userID => {
      let user = users[userID];
      result.push({
        username: user.username,
        userID: userID,
      });
    });
  }
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
  if (userID != null) {
  setTimeout(() => {
    if (users[userID] === undefined || users[userID] === null) {
      users[userID] = new SessionData(socket.id, username);
    }

    // Setup new socket ID (refreshes each page visit)
    users[userID].socketID = socket.id;
    
    // Broadcast new list of lobbies to users
    socket.emit('lobbies', lobbies);
  
    // Alert client of successful registration
    socket.emit('registered');
    console.log('User: \'' + username + '\'(' + userID + ') Registered!');
  }, REGISTER_DELAY);
}
}

function unregisterUser(socket, userID, disconnect) {
  let sessionData = users[userID];
  if (sessionData != null) {
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
  socket.emit('registration_check', (sessionData != null));
}

function broadcastLobbies() {
  Object.keys(users).forEach(userID => {
    let user = users[userID];
    let userSocket = io.sockets.connected[user.socketID];
    if (userSocket != null) {
      userSocket.emit('lobbies', lobbies);
    }
  });
}

function broadcastScores(lobbyID) {
  let lobby = lobbies[lobbyID];
  if (lobby != null) {
    lobby.connectedUsers.forEach(userID => {
      let user = users[userID];
      let userSocket = io.sockets.connected[user.socketID];
      if (userSocket != null) {
        lobby.connectedUsers.forEach(playerID => {
          let player = users[playerID];
          userSocket.emit('score', playerID, player.score);
        });
      }
    });
  }
}

function createLobby(socket, userID, lobbyName, maxPlayers, rounds, privateLobby, password) {
  let sessionData = users[userID];
  if (sessionData != null) {
    setTimeout(() => {
      let lobbyID = uuid().toString().replace(/-/g, '');
      lobbies[lobbyID] = new LobbyData(userID, lobbyName, maxPlayers, rounds, privateLobby);
      lobbyPasswords[lobbyID] = password;
      socket.emit('lobbycreated', lobbyID);
      console.log('Lobby Created: ' + lobbyID);

      // Broadcast new list of lobbies to users
      broadcastLobbies();

    }, CREATE_DELAY);
  }
}

function joinGame(socket, userID, lobbyID, password) {
  let sessionData = users[userID];
  let lobby = lobbies[lobbyID];
  if (sessionData != null) {
    if (!lobby.connectedUsers.includes(userID)) {
      if (lobby != null) {
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

              // Update all players' new player list
              lobby.connectedUsers.forEach(playerID => {
                let player = users[playerID];
                if (player != null) {
                  let playerSocket = io.sockets.connected[player.socketID];
                  if (playerSocket != null) {
                    playerSocket.emit('connectedPlayers', getConnectedUsernames(lobbyID));
                  }
                }
              });

              console.log('User \'' + sessionData.username + '\'(' + userID + ') Joined Lobby: ' + lobbyID);

              // Broadcast new list of lobbies to users
              broadcastLobbies();
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
  if (sessionData != null) {
    let lobby = lobbies[sessionData.connectedGame];
    if (lobby != null) {
      setTimeout(() => {
        // Tell the client they left
        socket.emit('left');

        // Disconnect the client from their lobby
        lobby.disconnect(userID);

        // Update all players' new player list
        lobby.connectedUsers.forEach(playerID => {
          let player = users[playerID];
          if (player != null) {
            let playerSocket = io.sockets.connected[player.socketID];
            if (playerSocket != null) {
              playerSocket.emit('connectedPlayers', getConnectedUsernames(sessionData.connectedGame));
            }
          }
        });

        if (disconnect) {
          // Don't remove session data if they just refreshed page
          console.log('User \'' + sessionData.username + '\'(' + userID + ') Disconnected from Lobby: ' + sessionData.connectedGame);
        } else {
          // Remove user's session data
          sessionData.leaveGame();
          console.log('User \'' + sessionData.username + '\'(' + userID + ') Left Lobby: ' + sessionData.connectedGame);
        }

        // Broadcast new list of lobbies to users
        broadcastLobbies();
      }, LEAVE_DELAY);
    }
  }
}

function getCurrentGame(socket, userID) {
  let sessionData = users[userID];
  if (sessionData != null) {
    setTimeout(() => {
      let lobby = lobbies[sessionData.connectedGame];
      let creatorID = undefined;
      if (lobby != null) {
        creatorID = lobby.creatorID;
      }
      socket.emit('retrievegame_status', sessionData.connectedGame, creatorID === userID);
    }, RETRIEVE_GAME_DELAY);
  }
}

function kickUser(masterID, userID) {
  let sessionData = users[userID];
  if (sessionData != null) {
    let lobby = lobbies[sessionData.connectedGame];
    if (lobby != null) {
      if (lobby.creatorID === masterID) {
        let userSocket = io.sockets.connected[sessionData.socketID];
        let masterSocket = io.sockets.connected[users[masterID].socketID];
        if (userSocket != null && masterSocket != null) {
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
  if (sessionData != null) {
    let lobby = lobbies[sessionData.connectedGame];
    if (lobby != null) {
      if (lobby.creatorID === masterID) {
        let userSocket = io.sockets.connected[sessionData.socketID];
        let masterSocket = io.sockets.connected[users[masterID].socketID];
        if (userSocket != null && masterSocket != null) {
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
  if (user != null) {
    let lobby = lobbies[user.connectedGame];
    if (lobby != null) {

      // Ensure they can draw at the time
      if (!lobby.gameState.started
        || lobby.gameState.currentDrawer === userID) {

      // Stores lines on in lobby data
      // Limit amount of lines
      const MAX_LINES = 5000;
      lobby.gameState.lines.push(line);
      if (lobby.gameState.lines.length > MAX_LINES) {
        lobby.gameState.lines.shift();
      }

      // Echo new line to each player in lobby
      lobby.connectedUsers.forEach(playerID => {
        if (userID !== playerID) {
          let player = users[playerID];
          let socket = io.sockets.connected[player.socketID];
          if (socket != null) {
            io.sockets.connected[player.socketID].emit('line', line);
          }
        }
      });
    }
  }
}
}

function echoClear(userID) {
  let user = users[userID];
  if (user != null) {
    let lobby = lobbies[user.connectedGame];
    if (lobby != null) {
      lobby.connectedUsers.forEach(playerID => {
        let player = users[playerID];
        let socket = io.sockets.connected[player.socketID];
        if (socket != null) {
          io.sockets.connected[player.socketID].emit('clearCanvas');
        }
      });
      lobby.gameState.lines = [];
    }
  }
}

function echoMouses(userID, mouseInfo) {
  let user = users[userID];
  if (user != null) {
    let lobby = lobbies[user.connectedGame];
    if (lobby != null) {
      lobby.connectedUsers.forEach(playerID => {
        if (userID !== playerID) {
          let player = users[playerID];
          let socket = io.sockets.connected[player.socketID];
          if (socket != null) {
            socket.emit('mousePos', userID, mouseInfo);
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
      if (user != null) {
        let lobby = lobbies[user.connectedGame];
        if (lobby != null) {

          // Broadcast guess or correct guess to all users
          if (guess.includes(lobby.gameState.activeWord)) {
            if (!user.guessedCorrectly) {
              user.guessedCorrectly = true;
              user.setScore(user.score + lobby.gameState.timeLeft);
              let drawer = users[lobby.gameState.currentDrawer];
              drawer.setScore(Math.ceil(drawer.score + (lobby.gameState.timeLeft / (lobby.connectedUsers.length - 1))));

              broadcastScores(user.connectedGame);

              lobby.connectedUsers.forEach(playerID => {
                let player = users[playerID];
                let playerSocket = io.sockets.connected[player.socketID];
                if (playerSocket != null) {
                  playerSocket.emit('correctguess', userID, user.username);
                }
              });
            }
          } else {
            lobby.connectedUsers.forEach(playerID => {
              let player = users[playerID];
              let playerSocket = io.sockets.connected[player.socketID];
              if (playerSocket != null) {
                playerSocket.emit('guess', userID, user.username, guess);
              }
            });
          }
        }
      }
    }  
  }  
}

function requestGameInfo(userID) {
  let user = users[userID];
  if (user != null) {
    let lobby = lobbies[user.connectedGame];
    if (lobby != null) {
      let socket = io.sockets.connected[user.socketID];
      if (socket != null) {
        lobby.gameState.lines.forEach(line => {
          socket.emit('line', line);
        });
        if (lobby.gameState.started) {
          socket.emit('gamestart');
          socket.emit('drawer', lobby.gameState.currentDrawer);
          socket.emit('newround', lobby.gameState.round);
          sendTimeLeft(user.connectedGame);
          sendCurrentWord(user.connectedGame, false);
        }
        broadcastScores(user.connectedGame);
      }
    }
  }
}

function retrieveWord(cb) {
  var options = {
    host: 'lab46.g7n.org',
    path: '/~dschmitt/wordgen.php?count=1'
  };
  var request = http.request(options, function (res) {
      var data = '';
      res.on('data', function (chunk) {
          data += chunk;
      });
      res.on('end', function () {
        cb(data);
      });
  });
  request.on('error', function (e) {
    console.log(e.message);
  });
  request.end();
}

function startGame(masterID, lobbyID) {
  let lobby = lobbies[lobbyID];
  if (lobby != null) {
    if (lobby.creatorID === masterID) {
      lobby.gameState.currentDrawer = lobby.connectedUsers[Math.floor(Math.random() * lobby.connectedUsers.length)];

      if (!lobby.gameState.started) {
        lobby.connectedUsers.forEach(userID => {
          let user = users[userID];
          let socket = io.sockets.connected[user.socketID];
          if (socket != null) {
            socket.emit('gamestart');
          }
        });
        lobby.gameState.started = true;
      }

      startNewRound(lobbyID);
      nextDrawer(lobbyID);
    }
  }
}

function nextDrawer(lobbyID) {
  let lobby = lobbies[lobbyID];
  if (lobby != null) {
    // Clear correct guessers
    lobby.connectedUsers.forEach(userID => {
      users[userID].guessedCorrectly = false;
    });

    // Set next drawer
    let currentDrawerIndex = lobby.connectedUsers.indexOf(lobby.gameState.currentDrawer);
    let newDrawerIndex = currentDrawerIndex;
    if (currentDrawerIndex === lobby.connectedUsers.length - 1) {
      newDrawerIndex = 0;
      startNewRound(lobbyID);
    } else {
      newDrawerIndex = newDrawerIndex + 1;
    }
    lobby.gameState.currentDrawer = lobby.connectedUsers[newDrawerIndex];
    users[lobby.gameState.currentDrawer].guessedCorrectly = true;
    
    if (lobby.gameState.started) {
      
      // Dispatch new word
      getNewWord(lobbyID, () => {
        lobby.gameState.timeLeft = DEFAULT_WORD_TIME;
        
        lobby.connectedUsers.forEach(userID => {
          let user = users[userID];
          let socket = io.sockets.connected[user.socketID];
          if (socket != null) {
            socket.emit('drawer', lobby.gameState.currentDrawer);
          }
        });

        sendCurrentWord(lobbyID, false);

        // Clear drawing
        echoClear(lobby.creatorID);
  
        // Dispatch game state information
        sendTimeLeft(lobbyID);
        wordTimers[lobbyID] = setInterval(() => {
          let correctGuessers = [];
          lobby.connectedUsers.forEach(userID => {
            let user = users[userID];
            if (userID !== lobby.gameState.currentDrawer) {
              if (user.guessedCorrectly) {
                correctGuessers.push(userID);
              }
            }
          });
  
          if (correctGuessers.length === (lobby.connectedUsers.length - 1)) {
            clearInterval(wordTimers[lobbyID]);
            sendCurrentWord(lobbyID, true);
            setTimeout(() => {
              nextDrawer(lobbyID);
            }, NEW_WORD_DELAY);
          } else {
            if (lobby.gameState.timeLeft > 0) {
              lobby.gameState.timeLeft -= 1;
              sendCurrentWord(lobbyID, false);
              sendTimeLeft(lobbyID);
            } else {
              clearInterval(wordTimers[lobbyID]);
              sendCurrentWord(lobbyID, true);
              setTimeout(() => {
                nextDrawer(lobbyID);
              }, NEW_WORD_DELAY);
            }
          }
        }, 1000);
      });
    } else {
      clearInterval(wordTimers[lobbyID]);
    }
  }
}

function getNewWord(lobbyID, cb) {
  let lobby = lobbies[lobbyID];
  if (lobby != null) {
    clearInterval(wordTimers[lobbyID]);
    // Wait for server to retrieve word
    retrieveWord((word) => {
      if (lobby.gameState.started) {
        lobby.gameState.activeWord = word;
        cb();
      }
    });
  }
}

function sendCurrentWord(lobbyID, force) {
  let lobby = lobbies[lobbyID];
  if (lobby != null) {
    let word = lobby.gameState.activeWord;
    lobby.connectedUsers.forEach(userID => {
      let user = users[userID];
      let socket = io.sockets.connected[user.socketID];
      if (socket != null) {
        let parsedWord = (lobby.gameState.currentDrawer === userID || user.guessedCorrectly || force)
          ? word
          : word.replace(/[ ]/g, '  ').replace(/[-]/g, '-').replace(/[^ -]/g, '_ ');
        socket.emit('word', parsedWord);
      }
    });
  }
}

function sendTimeLeft(lobbyID) {
  let lobby = lobbies[lobbyID];
  if (lobby != null) {
    // send new time to clients
    lobby.connectedUsers.forEach(userID => {
      let user = users[userID];
      let socket = io.sockets.connected[user.socketID];
      if (socket != null) {
        socket.emit('timeLeft', lobby.gameState.timeLeft);
      }
    });
  }
}

function startNewRound(lobbyID) {
  let lobby = lobbies[lobbyID];
  if (lobby != null) {
    if (lobby.gameState.round < lobby.rounds) {
      lobby.gameState.round += 1;
      lobby.connectedUsers.forEach(userID => {
        let user = users[userID];
        let socket = io.sockets.connected[user.socketID];
        if (socket != null) {
          socket.emit('newround', lobby.gameState.round);
        }
      });
    } else {
      let winner = undefined;
      lobby.gameState.started = false;
      lobby.gameState.activeWord = undefined;
      lobby.gameState.round = 0;
      lobby.gameState.timeLeft = 90;
      lobby.gameState.currentDrawer = undefined;
      lobby.connectedUsers.forEach(userID => {
        let user = users[userID];
        if (winner === undefined || user.score > winner.score) {
          winner = user;
        }
      });
      lobby.connectedUsers.forEach(userID => {
        let user = users[userID];
        let socket = io.sockets.connected[user.socketID];
        if (socket != null) {
          socket.emit('gameover', winner.username);
          user.score = 0;
        }
      });
      broadcastScores(lobbyID);
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
  socket.on('clearCanvas', (userID) => echoClear(userID));
  socket.on('mousePos', (userID, mouseInfo) => echoMouses(userID, mouseInfo));
  socket.on('guess', (userID, guess) => makeGuess(userID, guess));
  socket.on('requestGameInfo', (userID) => requestGameInfo(userID));
  socket.on('startgame', (userID, lobbyID) => startGame(userID, lobbyID));

  socket.on('disconnect', () => {
    leaveGame(socket, getUserID(socket.id), true);
    unregisterUser(socket, getUserID(socket.id), true);
  });
});

io.listen(port);
console.log('Server listening on *:' + port);