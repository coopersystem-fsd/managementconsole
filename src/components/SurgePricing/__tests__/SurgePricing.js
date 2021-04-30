import { shallow } from 'enzyme'; // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json'; // eslint-disable-line
import React from 'react';
import SurgePricing from '../';

const props = {
  common: {},
  actions: {
    getSurgePricing: () => new Promise(resolve => resolve()),
    getCurrentSurgeMode: () => new Promise(resolve => resolve()),
  },
  surgePricing: {
    polygons: [],
  },
};

describe('<SurgePricing />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <SurgePricing {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
