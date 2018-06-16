import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:3001/', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
});

export default socket;