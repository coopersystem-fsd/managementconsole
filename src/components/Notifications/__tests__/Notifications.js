import { shallow } from 'enzyme'; // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json'; // eslint-disable-line
import React from 'react';

import Notifications from '../';

import {mockStore} from '../../../helpers/test-helpers';

const props = {

};

const store = mockStore({
  data: {},
});

describe('<Notifications />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <Notifications {...props} store={store} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
