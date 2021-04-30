import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

import rootReducer from './reducer';

let middleware = [thunkMiddleware];
if (NODE_ENV === 'development') middleware = [...middleware, createLogger()];

const isDevToolsInstalled = window.__REDUX_DEVTOOLS_EXTENSION__; // eslint-disable-line

const composed =
  isDevToolsInstalled ?
    compose(applyMiddleware(...middleware), window.__REDUX_DEVTOOLS_EXTENSION__()) : // eslint-disable-line
    compose(applyMiddleware(...middleware));

const configureStore = () => {
  const store = createStore(
    rootReducer,
    {},
    compose(
      applyMiddleware(...middleware),
      composed,
    ),
  );

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducer', () => {
      store.replaceReducer(require('./reducer').default); // eslint-disable-line
    });
  }

  return store;
};

const store = configureStore();
export default store;
