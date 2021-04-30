import moment from 'moment';
import 'moment-timezone';
import { getItem } from '../helpers/localstorage';

export function getEnvironment(defaultVal) {
  const env = getItem('api');
  if (env) {
    return env.url === 'api' ? 'production' : 'stage';
  }

  return defaultVal;
}

export function getTexasTime(date, utc = true) {
  if (!date) date = moment();
  const d = date.clone();
  const isDaylightSavingTime = moment().tz('America/Denver').isDST();
  const localOffset = d.utcOffset() / 60;
  const texasOffset = isDaylightSavingTime ? 5 : 6;
  const offset = localOffset + texasOffset;
  if (utc) {
    return d.utc().add(offset, 'hours');
  }
  return d.clone().utc().utcOffset(-texasOffset);
}

export function getPaginationInfo({ currentPage, totalItems, pageSize }) {
  currentPage = currentPage === 0 ? 1 : currentPage;
  if (currentPage && totalItems && pageSize) {
    const pagingItemsStart = (((currentPage - 1) * pageSize) + 1);
    const pagingItemsEnd = (Math.min((currentPage) * pageSize, totalItems));

    if (pageSize < totalItems) {
      return `Showing ${pagingItemsStart} - ${pagingItemsEnd} of ${totalItems} items`;
    }
    return `Showing ${totalItems} items`;
  }

  return false;
}

export function fromMultipleSelectValues(options, allOptions, valField = 'id') {
  if (valField) {
    allOptions = allOptions.map(el => el[valField]);
  }

  let returnAll = options.indexOf('*') !== -1;

  if (!returnAll && options.length >= allOptions.length) {
    let allOptionsCount = allOptions.length;
    options.forEach((el) => {
      const index = allOptions.indexOf(el);
      if (index !== -1) {
        allOptionsCount -= 1;
      }
    });
    returnAll = !allOptionsCount;
  }

  if (returnAll) {
    return allOptions;
  }

  return options;
}

export function getMultipleSelectValues(selectedOptions, currentOptions) {
  const values = _.map(selectedOptions, ({value}) => value);
  let current = currentOptions.split(',');

  if (_.indexOf(values, '*') > -1) return '*';
  current = _.without(current, '*');

  if (values.length === 1 && _.indexOf(current, values[0]) > -1) {
    return _.without(current, values[0]).join(',');
  } else if (selectedOptions.length === 1 && _.indexOf(current, values[0]) === -1) {
    return [...current, values[0]].join(',');
  }

  return values.join(',');
}
