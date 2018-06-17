import uuid from 'uuid/v4';

export const Register = (data) => ({
  type: 'REGISTER',
  username: data.username,
  userID: data.userID,
});

export const Unregister = (data) => ({
  type: 'UNREGISTER',
});

export const CreateLobby = (createdLobby) => ({
  type: 'CREATE_LOBBY',
  createdLobby: createdLobby,
});

export const JoinLobby = (lobbyID) => ({
  type: 'JOIN_LOBBY',
  activeLobby: lobbyID,
});

export const LeaveLobby = (data) => ({
  type: 'LEAVE_LOBBY',
});

export const StartGame = (data) => ({
  type: 'START_GAME',
});

export const MuteUser = (userID) => ({
  type: 'MUTE_USER',
  userID: userID,
});

export const UnmuteUser = (userID) => ({
  type: 'UNMUTE_USER',
  userID: userID,
});

export const KickUser = (data) => ({
  type: 'KICK_USER',
});

export const BanUser = (data) => ({
  type: 'BAN_USER',
});

export const DrawLine = (line) => ({
  type: 'DRAW_LINE',
  line: line,
});

export const RemoveLine = (line) => ({
  type: 'REMOVE_LINE',
  line: line,
});

export const SetPenColor = (color) => ({
  type: 'SET_PEN_COLOR',
  color: color,
});

export const SetPenSize = (size) => ({
  type: 'SET_PEN_SIZE',
  size: size,
});

export const ClearCanvas = (data) => ({
  type: 'CLEAR_CANVAS',
});

export const ResetClear = (data) => ({
  type: 'RESET_CLEAR',
});

export const LobbyList = (lobbies) => ({
  type: 'LOBBY_LIST',
  lobbies: lobbies,
});

export const PlayerList = (players) => ({
  type: 'PLAYER_LIST',
  players: players,
});

export const MousePos = (data) => ({
  type: 'MOUSE_POS',
  userID: data.userID,
  mouseInfo: data.mouseInfo,
});

export const ReceiveGuess = (guess) => ({
  type: 'GUESS',
  guess: guess,
});

export const ReceiveCorrectGuess = (data) => ({
  type: 'CORRECT_GUESS',
  username: data.username,
  userID: data.userID,
});

export const ReceiveGameOver = (winner) => ({
  type: 'GAME_OVER',
  winner: winner,
});

export const ReceiveTimeLeft = (timeLeft) => ({
  type: 'TIME_LEFT',
  timeLeft: timeLeft,
});

export const ReceiveNewDrawer = (drawer) => ({
  type: 'DRAWER',
  activeDrawer: drawer,
});

export const ReceiveNewWord = (word) => ({
  type: 'WORD',
  currentWord: word,
});

export const ReceiveNewRound = (round) => ({
  type: 'NEW_ROUND',
  round: round,
});

export const UpdateScore = (data) => ({
  type: 'UPDATE_SCORE',
  userID: data.userID,
  score: data.score,
});

export const Disconnect = (data) => ({
  type: 'DISCONNECT',
});

export const Reconnect = (data) => ({
  type: 'RECONNECT',
});

/**************************************/
/* Async Action items using - Sockets	*/
/**************************************/

export const sendRegister = (socket, username, cb) => {
  return (dispatch) => {

    // Check if values are set in local (session) storage
    let userID = sessionStorage.getItem('userID');
    if (userID === null) {
      userID = uuid().toString().replace(/-/g, '');
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('userID', userID);
    }

    socket.once('registered', () => {
      dispatch(Register({
        username: sessionStorage.getItem('username'),
        userID: sessionStorage.getItem('userID')
      }));
      cb();
    });

    socket.once('disconnect', () => {
      dispatch(Disconnect());
    });
    socket.once('reconnect', () => {
      dispatch(Reconnect());
    });

    // Tell the server we are registering
    socket.emit('register', username, userID);
  };
};

export const sendUnregister = (socket, userID) => {
  return (dispatch) => {
    dispatch(Unregister());
    socket.emit('unregister', userID);
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userID');
  };
};

export const sendCreateLobby = (socket, userID, lobbyName, maxPlayers, rounds, privateLobby, password, cb) => {
  return (dispatch) => {
    socket.once('lobbycreated', (lobbyID) => {
      dispatch(CreateLobby(lobbyID));
      cb(lobbyID);
    });
    socket.emit('createlobby', userID, lobbyName, maxPlayers, rounds, privateLobby, password);
  };
};

export const sendJoinLobby = (socket, userID, lobbyID, password, cb) => {
  return (dispatch) => {
    socket.once('joined', (status, message) => {
      if (status) {
        dispatch(JoinLobby(lobbyID));
        socket.emit('requestGameInfo', userID);
        dispatch(getGameStatus(socket, userID, () => { }));
      } else {
        console.log('Unable to join game: ' + message);
      }
      cb(status);
    });
    socket.emit('joining', userID, lobbyID, password);
  };
};

export const sendMousePos = (socket, userID, x, y, color, size) => {
  return (dispatch) => {
    socket.emit('mousePos', userID, { x, y, color, size });
  };
};

export const sendGuess = (socket, userID, guess) => {
  return (dispatch) => {
    if (guess.length <= 30) {
      if (guess.replace(/ /g, '') !== '') {
        socket.emit('guess', userID, guess);
      }
    }
  };
};

export const sendLine = (socket, userID, line) => {
  return (dispatch) => {
    socket.emit('line', userID, line);
  };
};

export const sendClearCanvas = (socket, userID) => {
  return (dispatch) => {
    socket.emit('clearCanvas', userID);
  };
};

export const startGame = (socket, userID, lobbyID) => {
  return (dispatch) => {
    socket.emit('startgame', userID, lobbyID);
  };
};

export const sendKickUser = (socket, userID, kickedUserID, cb) => {
  return (dispatch) => {
    socket.once('kicked', (userID) => {
      cb(userID);
    });
    socket.emit('kickuser', userID, kickedUserID);
  }
};

export const sendBanUser = (socket, userID, bannedUserID, cb) => {
  return (dispatch) => {
    socket.once('kicked', (userID) => {
      cb(userID);
    });
    socket.emit('banuser', userID, bannedUserID);
  }
};

export const sendLeaveLobby = (socket, userID, cb) => {
  return (dispatch) => {
    socket.once('left', () => {
      dispatch(LeaveLobby());
      cb();
    });
    socket.emit('leaving', userID);
  }
};

export const getGameStatus = (socket, userID, cb) => {
  return (dispatch) => {
    socket.once('retrievegame_status', (status, createdLobby) => {
      dispatch(CreateLobby(createdLobby));
      cb(status);
    });
    socket.emit('retrievegame', userID);
  }
};

export const getRegistrationStatus = (socket, userID, cb) => {
  return (dispatch) => {
    socket.once('registration_check', (result) => {
      cb(result);
    });
    socket.emit('checkRegistration', userID);
  }
};

/* Persistent Action Handlers	*/

export const getMousePos = (socket) => {
  return (dispatch) => {
    socket.on('mousePos', (userID, mouseInfo) => {
      dispatch(MousePos({ userID, mouseInfo }));
    });
  };
};

export const getGuess = (socket) => {
  return (dispatch) => {
    socket.on('guess', (userID, username, guess) => {
      dispatch(ReceiveGuess({ userID, username, guess }));
    });
  };
};

export const getCorrectGuess = (socket) => {
  return (dispatch) => {
    socket.on('correctguess', (userID, username) => {
      dispatch(ReceiveCorrectGuess({ userID, username }))
    });
  }
};

export const getLobbyList = (socket) => {
  return (dispatch) => {
    socket.on('lobbies', (lobbies) => {
      dispatch(LobbyList(lobbies));
    });
  };
};

export const getPlayerList = (socket) => {
  return (dispatch) => {
    socket.on('connectedPlayers', (players) => {
      dispatch(PlayerList(players));
    });
  };
};

export const getLine = (socket) => {
  return (dispatch) => {
    socket.on('line', (line) => {
      dispatch(DrawLine(line));
    });
  };
};

export const getClearCanvas = (socket) => {
  return (dispatch) => {
    socket.on('clearCanvas', () => {
      dispatch(ClearCanvas());
    });
  }
};

export const getKick = (socket) => {
  return (dispatch) => {
    socket.on('kick', (userID, reason) => {
      dispatch(sendLeaveLobby(socket, userID, () => {
        console.log('kicked reason: ' + reason);
      }));
    });
  };
};

export const getScoreUpdate = (socket) => {
  return (dispatch) => {
    socket.on('score', (userID, score) => {
      dispatch(UpdateScore({ userID, score }));
    });
  };
};

export const getGameInfo = (socket) => {
  return (dispatch) => {
    socket.on('gamestart', () => {
      dispatch(StartGame());
    });
    socket.on('newround', (round) => {
      dispatch(ReceiveNewRound(round));
    });
    socket.on('word', (currentWord) => {
      dispatch(ReceiveNewWord(currentWord));
    });
    socket.on('drawer', (activeDrawer) => {
      dispatch(ReceiveNewDrawer(activeDrawer));
    });
    socket.on('timeLeft', (timeLeft) => {
      dispatch(ReceiveTimeLeft(timeLeft));
    });
    socket.on('gameover', (winner) => {
      dispatch(ReceiveGameOver(winner));
    });
  }
};