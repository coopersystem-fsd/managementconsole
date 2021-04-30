import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';

import SendEmailModal from '../';


describe('<SendEmailModal />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <SendEmailModal />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
