import { shallow } from 'enzyme'; // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json'; // eslint-disable-line
import React from 'react';
import {Profile} from '../../';

const props = {
  params: {},
  profile: {},
};

describe('<Profile />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <Profile {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
