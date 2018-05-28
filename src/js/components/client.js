import openSocket from 'socket.io-client';
import uuid from 'uuid/v4';

const socket = openSocket('http://localhost:3001/', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
});

let state = {
  username: null,
  userID: null,
  reconnecting: false,
  lobbies: [],
  players: [],
  activeLobby: undefined,
  createdLobby: false,
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

  // Subscribe to maintain list of lobbies
  socket.on('lobbies', (lobbies) => {
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
  socket.once('joined', (status) => {
    if (status) {
      state.activeLobby = lobbyID;
      socket.on('connectedPlayers', (players) => {
        state.players = players;
      });
      socket.off('lobbies');
      getCurrentGame(()=>{});
    }
    cb(status);
  });
  socket.emit('joining', state.userID, lobbyID, password);
}

function leaveLobby(cb) {
  socket.once('left', () => {
    socket.off('connectedPlayers');
    socket.on('lobbies', (lobbies) => {
      state.lobbies = lobbies;
    });
    state.activeLobby = undefined;
    state.players = [];
    state.createdLobby = false;
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

export { shouldAutoRegister, register, unregister, registered, createLobby, joinLobby, leaveLobby, getCurrentGame, state };