import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App/App'

import 'normalize.css'
import './styles/reset.css'

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
