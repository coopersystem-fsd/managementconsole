import { shallow } from 'enzyme'; // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json'; // eslint-disable-line
import React from 'react';
import {RideHistory} from '../../';

const props = {
  rideHistory: {
    serverResponse: {},
  },
};

describe('<RideHistory />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <RideHistory {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
