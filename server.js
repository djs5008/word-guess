const io = require('socket.io')();
const port = 3001;

let users = {};
class SessionData {
  constructor(username, userID) {
    this.username = username;
    this.userID = userID;
  }
}

function registerUser(username, userID, socket) {
  console.log('Client: \'' + username + '\'(' + userID + ') Registered!');
  users[socket.id] = new SessionData(username, userID);
  socket.emit('registered');
}

function unregisterUser(socket) {
  let sessionData = users[socket.id];
  if (sessionData !== undefined) {
    console.log('Client: \'' + sessionData.username + '\'(' + sessionData.userID + ') Unregistered!');
    users[socket.id] = null;
  }
}

io.on('connection', (socket) => {
  socket.on('register', (username, userID) => registerUser(username, userID, socket));
  socket.on('unregister', () => unregisterUser(socket));
  socket.on('disconnect', () => unregisterUser(socket));
});

io.listen(port);
console.log('Server listening on *:' + port);