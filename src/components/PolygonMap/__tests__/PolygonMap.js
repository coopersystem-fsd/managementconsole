import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';
import PolygonMap from '../';

describe('<PolygonMap />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <PolygonMap />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
