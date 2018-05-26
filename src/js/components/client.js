import openSocket from 'socket.io-client';
import uuid from 'uuid/v4';

const socket = openSocket('http://localhost:3001/', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax : 5000,
  reconnectionAttempts: Infinity
});

let state = {
  username: null,
  userID: null,
  registering: false,
  reconnecting: false,
  lobbies: [],
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
    state.registering = false;
    cb();
  });

  // Subscribe to maintain list of lobbies
  socket.once('lobbies', (lobbies) => {
    state.lobbies = lobbies;
  });

  // Subscribe to disconnection handler
  socket.once('disconnect', () => {
    state.reconnecting = true;
  });

  socket.once('reconnect', () => {
    state.reconnecting = false;
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
  state.username = null;
  state.userID = null;
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('userID');
  socket.emit('unregister');
}

function createLobby(lobbyName, maxPlayers, rounds, privateLobby, password, cb) {
  socket.once('lobbycreated', (lobbyID) => {
    joinLobby(lobbyID, password, (status) => {
      cb(status);
    });
  });
  socket.emit('createlobby', lobbyName, maxPlayers, rounds, privateLobby, password);
}

function joinLobby(lobbyID, password, cb) {
  socket.once('joined', (status) => {
    cb(status);
  });
  socket.emit('joining', lobbyID, password);
}

function leaveLobby(lobbyID, cb) {
  socket.once('left', () => cb());
  socket.emit('leaving', lobbyID);
}

export { shouldAutoRegister, register, unregister, registered, createLobby, joinLobby, leaveLobby, state };