import { shallow } from 'enzyme'; // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json'; // eslint-disable-line
import React from 'react';
import Promocodes from '../';

const props = {
  actions: {
    getPromocodes: () => new Promise(resolve => resolve()),
  },
  promocodes: {

  },
};

describe('<Promocodes />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <Promocodes {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
