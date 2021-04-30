import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';
import Filters from '../Filters';
import constants from '../../../data/constants';

const mockFn = jest.fn();

describe('<Filters />', () => {
  describe('Init', () => {
    it('should render with default props', () => {
      const wrapper = shallow(
        <Filters
          filters={constants.driverFunnel.filters.slice()}
          filter={constants.driverFunnel.filters.slice()[1]}
          funnel={[{ id: 'activationStatus', drivers: 100 }]}
          onChange={() => {}}
        />
      );
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
    it('select active option and deselect option', () => {
      const wrapper = shallow(
        <Filters
          filters={constants.driverFunnel.filters.slice()}
          funnel={[{ id: 'activationStatus', drivers: 100 }]}
          onChange={mockFn}
          filter={constants.driverFunnel.filters.slice()[1]}
        />
      );
      wrapper.find('.menu-item-activationStatus-active').simulate('click');
      expect(mockFn).toHaveBeenCalled();
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });
});
