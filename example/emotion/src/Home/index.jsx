import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import { css } from '@emotion/core'

const mainTitle = css`
  color: blue;
  background: red;
  border-radius: 6px;
  &:hover {
    color: red;
    background: blue;
  }
`

export default class Home extends Component {
  render() {
    return <div>
      <h1 css={mainTitle}>This is home page</h1>
      <Link to="/about">About</Link>
    </div>
  }
}