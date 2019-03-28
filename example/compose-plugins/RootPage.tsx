import React from 'react'

const style = require('./style.css')

export default class RootPage extends React.Component {
  render() {
    return (
      <div>
        <h1 className={style.h1}>Hello World</h1>
      </div>
    )
  }
}