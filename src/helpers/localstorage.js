const isLocalStorageNameSupported = () => {
  const testKey = 'test';
  const storage = window.localStorage;
  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

function setItemFn(id, val) {
  this.data[id] = String(val);
  return String(val);
}

function getItemFn(id) {
  return this.data.hasOwnProperty(id) ? this.data[id] : undefined; // eslint-disable-line
}

function removeItemFn(id) {
  return delete this.data[id];
}

function clearFn() {
  this.data = {};
  return this.data;
}

if (!NODE_ENV !== 'test') {
  if (!window.localStorage) {
    window.localStorage = {
      data: {},
      setItem: setItemFn,
      getItem: getItemFn,
      removeItem: removeItemFn,
      clear: clearFn,
    };
  }
}

export function setItem({id, value}) {
  if (isLocalStorageNameSupported()) {
    if (value) {
      value = _.isObject(value) ? JSON.stringify(value) : value;
    }
    window.localStorage.setItem(id, value);
    return value;
  }
  return false;
}

const isJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export function getItem(id) {
  if (isLocalStorageNameSupported() && id) {
    const item = window.localStorage.getItem(id);

    if (item && isJSON(item)) {
      return JSON.parse(window.localStorage.getItem(id));
    }
    return window.localStorage.getItem(id);
  }
  return false;
}

export function removeItem(id) {
  if (isLocalStorageNameSupported()) {
    window.localStorage.removeItem(id);
  }
}

export function clear() {
  if (isLocalStorageNameSupported()) {
    window.localStorage.clear();
  }
}
