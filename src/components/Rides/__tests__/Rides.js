import { shallow } from 'enzyme'; // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json'; // eslint-disable-line
import React from 'react';
import Rides from '../';

const props = {
  actions: {
    getRidesAction: () => new Promise(resolve => resolve()),
    getRideAction: () => new Promise(resolve => resolve()),
  },
  notificationsActions: {},
};

describe('<Rides />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <Rides {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
