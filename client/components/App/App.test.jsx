import React from 'react'
import { shallow } from 'enzyme'

import App from './App'

describe('App', () => {
  it('should display correctly', () => {
    const wrapper = shallow(<App />)
    expect(wrapper.find('.header')).toHaveLength(1)
    expect(wrapper.find('.header').text()).toBe('Hello Outpost Config Tool!')
  })
})
