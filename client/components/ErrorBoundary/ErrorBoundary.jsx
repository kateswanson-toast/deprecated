import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as Sentry from '@sentry/browser'

class ErrorBoundary extends Component {
  constructor (props) {
    super(props)
    this.state = { error: null }
  }

  componentDidCatch (error, errorInfo) {
    this.setState({ error, errorInfo })
    Sentry.configureScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key])
      })
    })
    Sentry.captureException(error)
  }

  render () {
    const { error, errorInfo } = this.state
    const { errorContent } = this.props

    if (error) {
      return errorContent(error, errorInfo)
    }
    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  errorContent: PropTypes.func
}

ErrorBoundary.defaultProps = {
  errorContent: () => <span><span role='img' aria-label='warning'>⚠️</span> Something went wrong</span>
}

export default ErrorBoundary
