import {
  applyMiddleware,
  // combineReducers,
  createStore,
} from 'redux';
import thunk from 'redux-thunk';
import reducer from './js/reducers/reducer';

// export const reducers = combineReducers({  
//   reducer,
// });

export function configureStore() {  
  const store = createStore(reducer, applyMiddleware(thunk));
  return store;
};

export const store = configureStore();