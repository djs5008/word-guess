const INIT_STATE = {
  username: null,
  userID: null,
  uiState: undefined,
  reconnecting: false,
  loading: false,
  loadingText: 'Loading...',
  loadingCancellable: false,
  loadingTimer: undefined,

  activeLobby: undefined,
  createdLobby: false,
  lobbies: [],
  players: [],
  mousePos: {},
  lineBuffer: [],
  allLines: [],
  mutedUsers: [],
  guesses: [],
  drawOptions: {
    color: '#333333',
    size: 3,
    drawing: true,
    clear: false,
    rainbow: false,
  },
  gameState: {
    started: false,
    activeDrawer: undefined,
    winner: undefined,
    currentWord: 'Loading...',
    timeLeft: 90,
    round: 0,
    correctUsers: [],
    scores: {},
  }
};

const reducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case 'UI_STATE':
      return {
        ...state,
        uiState: action.state,
      };
    case 'START_LOADING':
      return {
        ...state,
        loading: true,
        loadingText: action.loadingText,
        loadingCancellable: action.loadingCancellable,
        loadingTimer: action.loadingTimer,
      };
    case 'CANCEL_LOADING':
      if (state.loadingTimer !== undefined) {
        clearTimeout(state.loadingTimer);
        return {
          ...state,
          loading: false,
          loadingText: 'Loading...',
          loadingCancellable: false,
          loadingTimer: undefined,
        };
      } else {
        return {
          ...state,
        };
      }
    case 'REGISTER':
      return {
        ...state,
        username: action.username,
        userID: action.userID,
      };
    case 'UNREGISTER':
      return {
        ...state,
        username: undefined,
        userID: undefined,
        createdLobby: false,
      };
    case 'CREATE_LOBBY':
      return {
        ...state,
        createdLobby: action.createdLobby,
      };
    case 'JOIN_LOBBY':
      return {
        ...state,
        activeLobby: action.activeLobby,
        guesses: INIT_STATE.guesses,
        gameState: INIT_STATE.gameState,
      };
    case 'LEAVE_LOBBY':
      return {
        ...state,
        activeLobby: undefined,
      };
    case 'START_GAME':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          started: true,
        }
      };
    case 'MUTE_USER':
      return {
        ...state,
        mutedUsers: [...state.mutedUsers, action.userID],
      };
    case 'UNMUTE_USER':
      return {
        ...state,
        mutedUsers: state.mutedUsers.filter(item => item !== action.userID),
      };
    case 'KICK_USER':
      return {
        ...state,
      };
    case 'BAN_USER':
      return {
        ...state,
      };
    case 'DRAW_LINE':
      if (action.line != null) {
        return {
          ...state,
          lineBuffer: [...state.lineBuffer, action.line],
          allLines: [...state.allLines, action.line],
        };
      } else {
        return {
          ...state,
        }
      }
    case 'REMOVE_LINE':
      return {
        ...state,
        lineBuffer: state.lineBuffer.filter(item => item !== action.line),
      };
    case 'SET_PEN_COLOR':
      return {
        ...state,
        drawOptions: {
          ...state.drawOptions,
          color: action.color,
        },
      };
    case 'SET_PEN_SIZE':
      return {
        ...state,
        drawOptions: {
          ...state.drawOptions,
          size: action.size,
        },
      };
    case 'SET_RAINBOW_PEN':
      return {
        ...state,
        drawOptions: {
          ...state.drawOptions,
          rainbow: action.rainbow,
        },
      };
    case 'CLEAR_CANVAS':
      return {
        ...state,
        lineBuffer: [],
        allLines: [],
        mousePos: {},
        drawOptions: {
          ...state.drawOptions,
          clear: true,
        },
      };
    case 'RESET_CLEAR':
      return {
        ...state,
        drawOptions: {
          ...state.drawOptions,
          clear: false,
        },
      };
    case 'GUESS':
      return {
        ...state,
        guesses: [...state.guesses, action.guess],
      };
    case 'LOBBY_LIST':
      return {
        ...state,
        lobbies: action.lobbies,
      };
    case 'PLAYER_LIST':
      return {
        ...state,
        players: action.players,
      };
    case 'MOUSE_POS':
      return {
        ...state,
        mousePos: {
          ...state.mousePos,
          [action.userID]: action.mouseInfo,
        },
      };
    case 'GAME_OVER':
      return {
        ...state,
        correctUsers: INIT_STATE.correctUsers,
        gameState: {
          ...INIT_STATE.gameState,
          winner: action.winner,
        },
      };
    case 'CORRECT_GUESS':
      return {
        ...state,
        guesses: [...state.guesses, {
          notification: true,
          guess: '&g(' + action.username + ' has guessed correctly!)',
        }],
        gameState: {
          ...state.gameState,
          correctUsers: [...state.gameState.correctUsers, action.userID],
        },
      };
    case 'TIME_LEFT':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          timeLeft: action.timeLeft,
        },
      };
    case 'DRAWER':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          activeDrawer: action.activeDrawer,
          correctUsers: INIT_STATE.gameState.correctUsers,
        },
      };
    case 'WORD':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          currentWord: action.currentWord,
        },
      };
    case 'NEW_ROUND':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          round: action.round,
        },
        guesses: [...state.guesses, {
          notification: true,
          guess: '----[ Round ' + (action.round) + ' ]----',
        }],
      };
    case 'UPDATE_SCORE':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          scores: {
            ...state.gameState.scores,
            [action.userID]: action.score,
          },
        },
      };
    case 'DISCONNECT':
      return {
        ...state,
        reconnecting: true,
      };
    case 'RECONNECT':
      return {
        ...state,
        reconnecting: false,
      };
    default:
      return {
        ...state
      };
  }
};

export default reducer;