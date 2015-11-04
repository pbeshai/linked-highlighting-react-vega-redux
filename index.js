import 'babel-core/polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import configureStore from './store/configureStore';

const store = configureStore();

// Every time the state changes, log it
// let unsubscribe = store.subscribe(() =>
//   console.log('[Store]', store.getState())
// );

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
