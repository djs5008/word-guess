import openSocket from 'socket.io-client';
import uuid from 'uuid/v4';

const socket = openSocket('http://localhost:3001');

let state = {
  username: null,
  userID: null,
  registering: false,
  lobbies: [],
};

function shouldRegister() {
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
  socket.on('registered', () => {
    state.username = sessionStorage.getItem('username');
    state.userID = sessionStorage.getItem('userID');
    state.registering = false;
    cb();
  });

  // Subscribe to list of lobbies
  socket.on('lobbies', (lobbies) => {
    state.lobbies = lobbies;
  });

  // Tell the server we are registering
  socket.emit('register', username, userID);
}

function registered() {
  return state.userID !== null;
}

function unregister() {
  state.username = null;
  state.userID = null;
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('userID');
  socket.emit('unregister');
}

function createLobby(lobbyName, maxPlayers, rounds, privateLobby, password, cb) {
  socket.on('lobbycreated', (lobbyID) => {
    joinLobby(lobbyID, () => {
      cb();
    });
  });
  socket.emit('createlobby', lobbyName, maxPlayers, rounds, privateLobby, password);
}

function joinLobby(lobbyID, cb) {
  socket.on('joined', () => cb());
  socket.emit('joining', lobbyID);
}

export { shouldRegister, register, unregister, registered, createLobby, joinLobby, state };