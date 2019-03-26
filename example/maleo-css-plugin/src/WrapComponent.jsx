import React from 'react'
import { Link } from 'react-router-dom'

export default class extends React.Component {
  render() {
    return (
      <div>
        <div>
          <Link to="/">Root</Link><br/>
          <Link to="/A">A</Link><br />
          <Link to="/B">B</Link><br />
        </div>
        {this.props.children}
      </div>
    )
  }
}