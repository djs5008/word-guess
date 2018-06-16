import { Provider } from 'react-redux';  
import { store } from './redux';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './js/registerServiceWorker';
import './css/index.css';

import App from './js/components/app';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, 
  document.querySelector("#root")
);
registerServiceWorker();