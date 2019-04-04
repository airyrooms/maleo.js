import React from 'react'
import { Provider } from 'mobx-react'
import Wrap from '@airy/maleo/wrap'

import { RootStore } from './src/RootStore'

export default class CustomWrap extends Wrap {
  render() {
    return (
      <Provider RootStore={RootStore}>
        {super.render()}
      </Provider>
    )
  }
}
