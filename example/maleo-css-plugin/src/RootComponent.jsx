import React from 'react'
import cn from 'classnames'

import style from './root-style.css'

const getColor = () =>  ['teal', 'green', 'lime'][(Math.floor(Math.random() * 10 % 3))]

export default class extends React.Component {
  render() {
    return (
      <div className={style.wrapper}>
        <h1 className={cn(style.h1, style[getColor()])}>Hello World</h1>
        <h1 className={cn(style.h1, style[getColor()])}>Hello World</h1>
        <h1 className={cn(style.h1, style[getColor()])}>Hello World</h1>
        <h1 className={cn(style.h1, style[getColor()])}>Hello World</h1>
        <h1 className={cn(style.h1, style[getColor()])}>Hello World</h1>
      </div>
    )
  }
}