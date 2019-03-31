import React, { Component } from 'react'
import { Provider } from 'mobx-react'

import { RootStore } from './RootStore'

export default class RootComponent extends Component {
  render() {
    return (
      <Provider RootStore={RootStore}>
        {this.props.children}
      </Provider>
    )
  }
}