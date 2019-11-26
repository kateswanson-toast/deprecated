import React from 'react'
import { shallow } from 'enzyme'
import * as Sentry from '@sentry/browser'
import ErrorBoundary from './ErrorBoundary'

jest.mock('@sentry/browser')

describe('ErrorBoundary', () => {
  it('should render children inside of body', () => {
    const Child1 = () => <div id='a' />
    const Child2 = () => <div id='b' />
    const wrapper = shallow(<ErrorBoundary><Child1 /><Child2 /></ErrorBoundary>)
    expect(wrapper.find(Child1)).toHaveLength(1)
    expect(wrapper.find(Child2)).toHaveLength(1)
  })

  it('should render default message on error', () => {
    const Child = () => <div id='a' />
    const wrapper = shallow(<ErrorBoundary><Child /></ErrorBoundary>)
    const err = new Error('Fake Error')
    wrapper.find(Child).simulateError(err)

    expect(wrapper.contains(<span><span role='img' aria-label='warning'>⚠️</span> Something went wrong</span>)).toBe(true)
    expect(wrapper.contains(Child())).toBe(false)
  })

  it('should render errorContent on error', () => {
    const Child = () => <div id='a' />
    let errorInfo = {}
    const ErrComponent = ({ message }) => <span>{message}</span>
    const onError = (error, info) => {
      errorInfo = info
      return (<ErrComponent message={error.message} />)
    }

    const wrapper = shallow(<ErrorBoundary errorContent={onError}><Child /></ErrorBoundary>)
    const err = new Error('Fake Error')
    wrapper.find(Child).simulateError(err)

    expect(wrapper.find(ErrComponent)).toHaveLength(1)
    expect(wrapper.find(ErrComponent).props()).toHaveProperty('message', 'Fake Error')
    expect(Object.keys(errorInfo).length).toBeGreaterThan(0)
    expect(wrapper.find(Child)).toHaveLength(0)
  })

  it('should call to sentry with correct context on error', () => {
  // Must mock sentry scope setting because configureScope does
  // nothing when sentry is in test mode
  // https://docs.sentry.io/clientdev/unified-api/#scope
    let scope = { setExtra: jest.fn() }
    Sentry.configureScope.mockImplementation(cb => cb(scope))

    const Child = () => <div id='a' />
    const wrapper = shallow(<ErrorBoundary><Child /></ErrorBoundary>)
    const error = new Error('Fake Error')
    wrapper.find(Child).simulateError(error)
    expect(Sentry.captureException).toHaveBeenCalledWith(error)
    expect(scope.setExtra.mock.calls.length).toBeGreaterThan(0)
  })
})
