import { shallow } from 'enzyme'; // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json'; // eslint-disable-line
import React from 'react';
import Statistics from '../';

const props = {
  statistics: {},
};

describe('<Statistics />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <Statistics {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
