import base64 from 'base-64';
import store from '../store';

/**
 * availables roles:
 *  - ADMIN
 *  - DRIVER
 *  - RIDER
 *
 * @return {Boolean} has roles
 */
export function hasRole({user, rolesRequired = []}) {
  if (user) {
    const userAvatars = _.map(user.avatars, 'type');
    const isAuthorized = _.intersection(_.flattenDeep(rolesRequired), userAvatars).length > 0;

    if (userAvatars.indexOf('ADMIN') > -1) {
      return true;
    }

    return isAuthorized;
  }
  return false;
}

export function getAvatars(user) {
  if (user) {
    return _.map(user.avatars, 'type');
  }
  return false;
}

export function getAvatar(user) {
  if (user) {
    return _.last(_.map(user.avatars, 'type'));
  }
  return false;
}

export function generateAuthToken({username, password}) {
  const partialToken = password;
  const authToken = base64.encode(`${username}:${partialToken}`);
  return authToken;
}

export function isAuth(nextState, replace) {
  if (store.getState().login.isLogged) {
    replace({pathname: '/online'});
  }
}
