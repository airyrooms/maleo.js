import React from 'react'

import style from './a-style.css'

export default class extends React.Component {
  render() {
    return (
      <div className={style.wrapper}>
        <h5>ComponentA</h5>
        <h5>ComponentA</h5>
        <h5>ComponentA</h5>
        <h5>ComponentA</h5>
      </div>
    )
  }
}