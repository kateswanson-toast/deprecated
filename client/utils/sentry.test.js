import * as sentry from './sentry'
import * as Sentry from '@sentry/browser'
import envFromHostname from '@toasttab/env-from-hostname'

jest.mock('@sentry/browser')
jest.mock('@toasttab/env-from-hostname')

describe('Sentry initialization', () => {
  let scope

  beforeEach(() => {
    scope = { setTag: jest.fn() }
    Sentry.init.mockClear()
    Sentry.init.mockImplementationOnce(jest.fn)
    Sentry.configureScope.mockClear()
    Sentry.configureScope.mockImplementationOnce(cb => cb(scope))
  })

  test('works with proper config', () => {
    envFromHostname.mockReturnValueOnce('prod')
    sentry.init({ publicKey: 'PUBLIC_KEY', projectId: 'PROJECT_ID' })

    expect(Sentry.init).toBeCalledTimes(1)
    expect(Sentry.init.mock.calls[0][0]).toHaveProperty('dsn', 'https://PUBLIC_KEY@sentry.io/PROJECT_ID')
    expect(scope.setTag).toBeCalledTimes(1)
    expect(Sentry.captureMessage).toBeCalledTimes(1)
  })

  test('does not init during local development', () => {
    envFromHostname.mockReturnValueOnce('dev')
    sentry.init({ publicKey: 'PUBLIC_KEY', projectId: 'PROJECT_ID' })

    expect(Sentry.init).not.toHaveBeenCalled()
  })

  test('throws when missing public key', () => {
    expect(() => {
      sentry.init({ publicKey: '', projectId: 'PROJECT_ID' })
    }).toThrow()
  })

  test('throws when missing project Id', () => {
    expect(() => {
      sentry.init({ publicKey: 'PUBLIC_KEY', projectId: '' })
    }).toThrow()
  })
})
