import configureStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const middlewares = [thunkMiddleware];
export const mockStore = configureStore(middlewares);
export const mock = new MockAdapter(axios);
