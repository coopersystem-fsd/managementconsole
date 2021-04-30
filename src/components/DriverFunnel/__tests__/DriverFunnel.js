import { shallow, mount } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';
import DriverFunnel from '../DriverFunnel';
import constants from '../../../data/constants';

jest.mock('../../common/CityFilter');
jest.mock('../../User');
jest.mock('../../../containers/PropsWatcher');

const common = {
  selectedCity: 1,
};

const driverFunnel = {
  loading: false,
  funnel: [
    {users: 100, color: 'green', name: 'Active', id: 'active'},
  ],
  pendingFilters: [
    { id: 'activationStatus', drivers: 100 },
  ],
  users: [
    {
      id: 1,
      email: 'someDriver@email.com',
      firstName: 'Alex',
      lastName: 'Stelea',
      activation: 'Active',
      checkrStatus: 'Pending',
      payoneer: 'Active',
      cityapproval: 'Pending',
      fingerprint: 'Pending',
      carinspection: 'Pending',
      driverlicense: 'Approved',
      insurance: 'Approved',
      carphotos: 'Approved',
      profilephotos: 'Approved',
      inspectionsticker: 'Approved',
    },
  ],
  serverResponse: {
    number: 0,
    size: 1,
    totalPages: 1,
    totalElements: 1,
  },
};

const actions = {
  listUsers: () => new Promise(resolve => resolve({payload: driverFunnel})),
  updateDriver: () => new Promise(resolve => resolve({payload: driverFunnel})),
};

const login = {
  user: {},
};

describe('<DriverFunnel />', () => {
  describe('Init', () => {
    it('should render with default props', () => {
      const wrapper = shallow(
        <DriverFunnel driverFunnel={driverFunnel} />
      );
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should call handleLoad', () => {
      const listUsers = jest.fn();

      const wrapper = mount(
        <DriverFunnel
          common={common}
          driverFunnel={driverFunnel}
          actions={{
            listUsers: () => new Promise((resolve) => {
              listUsers();
              resolve({payload: driverFunnel});
            }),
          }}
        />
      );

      wrapper.instance().table = {
        tableConfig: {
          getDataMap: jest.fn().mockImplementation(u => u),
        },
      };

      expect(listUsers).toHaveBeenCalled();
    });
  });
  describe('UI', () => {
    it('should render filters', () => {
      const wrapper = mount(
        <DriverFunnel
          common={common}
          driverFunnel={driverFunnel}
          actions={{
            listUsers: () => new Promise((resolve) => {
              resolve({payload: driverFunnel});
            }),
          }}
        />
      );
      wrapper.instance().table = {
        tableConfig: {
          getDataMap: jest.fn().mockImplementation(u => u),
        },
      };
      expect(wrapper.find('DropdownButton').length).toBeGreaterThan(0);
    });
    it('should render funnel-stack', () => {
      const wrapper = shallow(
        <DriverFunnel
          driverFunnel={driverFunnel}
          actions={{
            listUsers: () => new Promise(resolve => resolve({payload: driverFunnel})),
          }}
        />
      );
      wrapper.instance().table = {
        tableConfig: {
          getDataMap: d => d,
        },
      };

      expect(wrapper.find('.funnel-stack')).toBeDefined();
    });
    it('should render PaginatedTable', () => {
      const wrapper = shallow(
        <DriverFunnel driverFunnel={driverFunnel} />
      );

      expect(wrapper.find('PaginatedTable').length).toBe(1);
    });
  });

  describe('methods', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <DriverFunnel common={common} driverFunnel={driverFunnel} actions={actions} login={login} />
      );
      const users = wrapper.instance().mapUsers(driverFunnel.serverResponse.content);
      wrapper.setState({users});
      wrapper.instance().table = {
        tableConfig: {
          getDataMap: jest.fn().mockImplementation(u => u),
        },
      };
    });

    describe('onFunnelClick ', () => {
      it('should return filtergroup', () => {
        const filters = constants.driverFunnel.filters.slice();
        const id = 'onboardingStatus';
        const newFilters = wrapper.instance().getFilterGroup({filters, id});
        wrapper.instance().onFunnelClick('onboardingStatus');
        expect(wrapper.state().filters).toEqual(newFilters);
      });
      it('should set new filters', () => {
        const oldFilter = Object.assign({}, wrapper.state().filters[0].selected);
        const filters = constants.driverFunnel.filters.slice();
        const id = 'checkrStatus';
        const newFilters = wrapper.instance().getFilterGroup({filters, id});
        expect(oldFilter[0]).not.toEqual(newFilters[0]);
      });
    });
  });
});
