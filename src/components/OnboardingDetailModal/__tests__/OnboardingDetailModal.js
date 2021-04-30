import { shallow } from 'enzyme'; // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json'; // eslint-disable-line
import React from 'react';
import OnboardingDetailModal from '../';

const props = {

};

describe('<OnboardingDetailModal />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <OnboardingDetailModal {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
