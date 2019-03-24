import React, {Component} from 'react'
import {Link} from 'react-router-dom'

import { aboutTitle } from './styles'

export default class About extends Component {
  render() {
    return <div>
      <h1 css={aboutTitle}>This is about page</h1>
      <Link to="/">Home</Link>
    </div>
  }
}