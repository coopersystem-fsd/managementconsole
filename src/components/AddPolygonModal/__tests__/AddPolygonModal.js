import { shallow } from 'enzyme';  // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json';  // eslint-disable-line
import React from 'react';
import AddPolygonModal from '../';

const props = {
  polygon: {},
};

describe('<AddPolygonModal />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <AddPolygonModal {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
