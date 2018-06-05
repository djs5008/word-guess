import openSocket from 'socket.io-client';
import uuid from 'uuid/v4';

const socket = openSocket('http://localhost:3001/', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
});

const state = {
  username: null,
  userID: null,
  reconnecting: false,
  lobbies: [],
  players: [],
  activeLobby: undefined,
  createdLobby: false,
  mousePos: {},
  lineBuffer: [],
  mutedUsers: [],
  guesses: [],
};

function shouldAutoRegister() {
  return sessionStorage.getItem('userID') !== null;
}

function register(username, cb) {
  
  // Check if values are set in local (session) storage
  let userID = sessionStorage.getItem('userID');
  if (userID === null) {
    userID = uuid().toString().replace(/-/g, '');
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('userID', userID);
  }

  // Subscribe to 'registered' packet
  socket.once('registered', () => {
    state.username = sessionStorage.getItem('username');
    state.userID = sessionStorage.getItem('userID');
    cb();
  });

  // Handle reconnecting to server when a disconnection happens
  socket.once('disconnect', () => {
    state.reconnecting = true;
  });
  socket.once('reconnect', () => {
    state.reconnecting = false;
  });

  // Subscribe to maintain list of lobbies
  socket.on('lobbies', (lobbies) => {
    state.lobbies = lobbies;
  });

  // Tell the server we are registering
  socket.emit('register', username, userID);
}

function registered(cb) {
  socket.once('registration_check', (result) => {
    cb(result);
  });
  socket.emit('checkRegistration', state.userID);
}

function unregister() {
  socket.off('lobbies');
  socket.emit('unregister', state.userID);
  state.username = null;
  state.userID = null;
  state.created = false;
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('userID');
}

function createLobby(lobbyName, maxPlayers, rounds, privateLobby, password, cb) {
  socket.once('lobbycreated', (lobbyID) => {
    state.createdLobby = true;
    cb(lobbyID);
  });
  socket.emit('createlobby', state.userID, lobbyName, maxPlayers, rounds, privateLobby, password);
}

function joinLobby(lobbyID, password, cb) {
  socket.once('joined', (status, message) => {
    if (status) {
      state.activeLobby = lobbyID;

      socket.on('connectedPlayers', (players) => {
        state.players = players;
      });

      socket.on('line', (line) => addToLines(line));

      socket.on('mousePos', (userID, x, y, color, size) => {
        state.mousePos[userID] = {x, y, color, size};
      });

      socket.on('guess', (userID, username, guess) => {
        state.guesses.push({userID, username, guess});
      });

      socket.once('kick', (userID, reason) => {
        leaveLobby(() => {
          console.log('kicked reason: ' + reason);
        });
      });

      socket.off('lobbies');

      getCurrentGame(()=>{});
    } else {
      console.log('Unable to join game: ' + message);
    }
    cb(status);
  });
  socket.emit('joining', state.userID, lobbyID, password);
}

function leaveLobby(cb) {
  socket.once('left', () => {
    // Unregister socket from persistent listeners
    socket.off('connectedPlayers');
    socket.off('line');
    socket.off('mousePos');
    socket.off('guess');

    // Re-register for list of lobbies
    socket.on('lobbies', (lobbies) => {
      state.lobbies = lobbies;
    });

    // Reset State Information
    state.activeLobby = undefined;
    state.players = [];
    state.lineBuffer = [];
    state.guesses = [];
    state.createdLobby = false;

    // Alert client leave was successful
    cb();
  });
  socket.emit('leaving', state.userID);
}

function getCurrentGame(cb) {
  socket.once('retrievegame_status', (status, created) => {
    state.createdLobby = created;
    cb(status);
  });
  socket.emit('retrievegame', state.userID);
}

function kickUser(userID, cb) {
  socket.once('kicked', (userID) => {
    cb(userID);
  });
  socket.emit('kickuser', state.userID, userID);
}

function banUser(userID, cb) {
  socket.once('kicked', (userID) => {
    cb(userID);
  });
  socket.emit('banuser', state.userID, userID);
}

function getLines() {
  return state.lineBuffer;
}

function addToLines(line) {
  state.lineBuffer.push(line);
}

function removeLine(line) {
  state.lineBuffer = state.lineBuffer.filter(item => item !== line);
}

function sendLine(line) {
  socket.emit('line', state.userID, line);
}

function sendMouse(x, y, color, size) {
  socket.emit('mousePos', state.userID, x, y, color, size);
}

function sendGuess(guess) {
  if (guess.length <= 30) {
    if (guess.replace(/ /g, '') !== '') {
      socket.emit('guess', state.userID, guess);
    }
  }  
}

function muteUser(userID) {
  state.mutedUsers.push(userID);
}

function unmuteUser(userID) {
  state.mutedUsers = state.mutedUsers.filter(item => item !== userID);
}

export { 
  shouldAutoRegister, 
  register, 
  unregister, 
  registered, 
  
  createLobby, 
  joinLobby, 
  leaveLobby, 
  getCurrentGame, 

  getLines,
  addToLines,
  removeLine,
  sendLine,
  sendMouse,
  kickUser,
  banUser,
  muteUser,
  unmuteUser,
  sendGuess,

  state,
};