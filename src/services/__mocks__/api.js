import Q from 'q';
import api from './api';

export { api };

export function setDriverOfflinePromise() {
  return Q(true);
}
