import { shallow } from 'enzyme';  // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json';  // eslint-disable-line
import React from 'react';

import EditPromocodeModal from '../';

const props = {
  promocode: {

  },
};

describe('<EditPromocodeModal />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <EditPromocodeModal {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
