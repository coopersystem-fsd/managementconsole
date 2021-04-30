import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';

import Upgrades from '../';

describe('<Upgrades />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <Upgrades />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
