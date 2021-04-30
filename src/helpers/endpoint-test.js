import axios from 'axios';
import store from '../store';
import config from '../services/config';
import {getReqObject} from '../services/api';
import {ADD_RESULT} from '../modules/test-endpoint-module';

const axiosInstance = axios.create(Object.assign({
  baseURL: config().getAPI(),
  ...getReqObject(),
}));

export const tests = [
  // users
  {
    page: 'users',
    url: '/drivers/list?cityId=1&avatarType=ADMIN&page=0&type=drivers&sort=id&desc=true&pageSize=100',
  },
  // map
  {
    page: 'map',
    url: '/rides/map?cityId=1',
  },
  // rides
  {
    page: 'rides',
    url: '/rides?cityId=1&id=&avatarType=ADMIN&page=0&status=COMPLETED&sort=completedOn&desc=true&completedOnAfter=2017-03-09T06:00:00.000Z&completedOnBefore=2017-03-10T05:59:59.999Z&pageSize=50&format=compact',
  },
  // online
  {
    page: 'online',
    url: '/acdr?cityId=1&avatarType=ADMIN&page=0&pageSize=100',
  },
  {
    page: 'online',
    url: '/rides/list?cityId=1&avatarType=ADMIN&page=0&pageSize=100&status=DRIVER_ASSIGNED,ACTIVE,DRIVER_REACHED',
  },
  {
    page: 'online',
    url: '/rides/list?cityId=1&avatarType=ADMIN&page=0&pageSize=100&status=REQUESTED',
  },
  // surgepricing
  {
    page: 'surgepricing',
    url: '/surgeareas?avatarType=ADMIN&page=0&pageSize=1000&cityId=1',
  },
  // payments
  {
    page: 'payments',
    url: '/custompayment?page=0&desc=true&sort=id&cityId=1&pageSize=100',
  },
  // reports
  {
    page: 'reports',
    url: '/reports/ridesZipCodeReport?avatarType=ADMIN&completedOnAfter=2017-03-09T06:00:00.000Z&completedOnBefore=2017-03-10T05:59:59.999Z&timeZoneOffset=-06:00+UTC',
  },
  {
    page: 'reports',
    url: '/reports/cumulativeRidesReport?avatarType=ADMIN&sort=u.firstName&desc=false&page=0&pageSize=100&completedOnAfter=2017-03-09T06:00:00.000Z&completedOnBefore=2017-03-10T05:59:59.999Z&timeZoneOffset=-06:00+UTC',
  },
  {
    page: 'reports',
    url: '/reports',
  },
  // upgrades
  {
    page: 'upgrades',
    url: '/configs/app/info?pageSize=100',
  },
  // promocodes
  {
    page: 'promocodes',
    url: '/promocodes?page=0&pageSize=100&cityBitMask=1',
  },
  // statistics
  {
    page: 'statistics',
    url: '/reports/driversRidesReport?page=0&sort=completedRides&desc=true&pageSize=100&completedOnAfter=2017-02-22T06:00:00.000Z&completedOnBefore=2017-03-10T05:59:59.999Z&avatarType=ADMIN&timeZoneOffset=-06:00',
  },
  {
    page: 'statistics',
    url: '/reports/ridesZipCodeReport?sort=rideCount&desc=true&pageSize=1000&completedOnAfter=2017-02-22T06:00:00.000Z&completedOnBefore=2017-03-10T05:59:59.999Z&avatarType=ADMIN&timeZoneOffset=-06:00',
  },
  {
    page: 'statistics',
    url: '/reports/ridesReport?sort=ridesCount&desc=false&pageSize=100&completedOnAfter=2017-02-22T06:00:00.000Z&completedOnBefore=2017-03-10T05:59:59.999Z&avatarType=ADMIN&timeZoneOffset=-06:00',
  },
  // notifications
  {
    page: 'notifications',
    url: '/notifications',
  },
  // onboarding
  {
    page: 'onboarding',
    url: '/drivers/statuses/pending?cityId=1',
  },
  {
    page: 'onboarding',
    url: '/drivers/list?onboardingStatus=PENDING&page=0&desc=true&sort=id&cityId=1',
  },
  // profile
  {
    page: 'profile',
    url: '/rides?cityId=1&sort=id&desc=true&charged=true&pageSize=100&status=COMPLETED,RIDER_CANCELLED,DRIVER_CANCELLED&avatarType=ADMIN&driverId=279489',
  },
  {
    page: 'profile',
    url: '/drivers/251435',
  },
  {
    page: 'profile',
    url: '/driversDocuments/279489/cars/8338',
  },
  // ride
  {
    page: 'ride',
    url: '/rides/1000/map',
  },
  {
    page: 'ride',
    url: '/rides/1000?avatarType=ADMIN',
  },
  // history
  {
    page: 'history',
    url: '/rides?cityId=1&sort=id&desc=true&charged=true&pageSize=100&status=COMPLETED,RIDER_CANCELLED,DRIVER_CANCELLED&avatarType=ADMIN&driverId=12597',
  },
  // edit
  {
    page: 'edit',
    url: '/drivers/1000/reminders',
  },
  {
    page: 'edit',
    url: '/drivers/list?email=jim.degnan@rideaustin.com',
  },
  {
    page: 'edit',
    url: '/driversDocuments/1000',
  },
  {
    page: 'edit',
    url: '/drivers/251435',
  },
];

const testEndpoint = ({url, params, method = 'GET', page}) => {
  let time = 0;
  const timer = setInterval(() => { time += 100; }, 100);
  const reqConfig = Object.assign({},
    {
      transformResponse: [(data) => {
        clearInterval(timer);
        return data;
      }],
    },
    {
      url,
      params,
      method,
      page,
    });

  return axiosInstance.request(reqConfig)
  .then(({status}) => (
    {
      seconds: `${time / 1000}`,
      url,
      status,
      params,
      page,
    }
  ))
  .catch(({status}) => (
    {
      seconds: `${time / 1000}`,
      url,
      status,
      params,
      page,
    }
  ));
};

const runTests = (testsToRun = [], cb) => {
  let results = [];

  const runTest = (t) => {
    const test = t.shift();
    if (!test) return cb(null, results);

    return testEndpoint(test)
      .then((res) => {
        res.date = moment.utc().format();
        results = [...results, res];

        store.dispatch({
          type: ADD_RESULT,
          payload: {results},
        });

        return runTest(t);
      });
  };

  runTest(testsToRun);
};

export default runTests;
