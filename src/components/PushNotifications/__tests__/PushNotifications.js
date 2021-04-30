import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';

import PushNotifications from '../';

describe('<PushNotifications />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(<PushNotifications />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
