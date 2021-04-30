import { createAction, createReducer } from 'redux-action';
import { browserHistory } from 'react-router';

import { handleError } from './handle-error-module';
import { login } from '../services/user';
import { usersAPI } from '../services/rest';
import { runLoggedBootstrap, setToken } from './common-module';

export const LOGIN_STATUS_ACTION = 'LOGIN_STATUS_ACTION';
export const LOGIN_ACTION = 'LOGIN_ACTION';
export const LOGOUT_ACTION = 'LOGOUT_ACTION';
export const GET_USER = 'GET_USER';

const loginStatusAction = logging => dispatch =>
dispatch({
  type: LOGIN_STATUS_ACTION,
  payload: {
    isLogged: false,
    logging,
  },
});

export const getUser = () => (dispatch, getState) => {
  if (getState().common.token) {
    return usersAPI.getUser()
      .then(({data: user}) => {
        runLoggedBootstrap(dispatch);
        return new Promise(resolve => resolve(
          dispatch({
            type: GET_USER,
            payload: {
              isLogged: true,
              logging: false,
              user,
            },
          })
        ));
      })
      .catch(err => dispatch(handleError(err)));
  }
  browserHistory.push('/login');
  return new Promise(resolve => resolve(
    dispatch({
      type: GET_USER,
      payload: {
        isLogged: false,
        logging: false,
        user: {},
      },
    })
  ));
};

const loginAction = createAction(LOGIN_ACTION, (dispatch, loginData) =>
  new Promise((resolve) => {
    const user = _.get(loginData, 'user');
    if (user) {
      resolve({
        isLogged: true,
        logging: false,
        user,
      });
      runLoggedBootstrap(dispatch);
      return;
    }

    dispatch(loginStatusAction(true));

    login(loginData.username, loginData.password)
      .then(({data}) => dispatch(setToken(data.token)))
      .then(() => dispatch(getUser()))
      .then(() => {
        runLoggedBootstrap(dispatch);
        const locationState = _.get(loginData, 'locationState');
        if (locationState && locationState.nextPathname) {
          browserHistory.push(locationState.nextPathname);
        } else {
          browserHistory.push('/online');
        }
        return resolve({
          isLogged: true,
          logging: false,
        });
      })
      .catch((err) => {
        dispatch(handleError(err));
        dispatch(loginStatusAction(false));
      });
  })
);

export const logoutAction = () => (dispatch) => {
  dispatch(setToken())
    .then(() =>
      dispatch({
        type: LOGOUT_ACTION,
        payload: {
          isLogged: false,
          logging: false,
          user: {},
        },
      })
    );
};

export const actions = {
  logout: logoutAction,
  getUser,
};

export const complexActions = {
  login: loginAction,
};

export const allActions = {...actions, ...complexActions};

const initialState = {
  isLogged: false,
  user: null,
};

export default createReducer(initialState, {
  [GET_USER]: state => state,
  [LOGIN_ACTION]: state => state,
  [LOGIN_STATUS_ACTION]: state => state,
  [LOGOUT_ACTION]: state => state,
});
