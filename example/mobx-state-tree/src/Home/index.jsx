import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

@inject('RootStore')
@observer
export default class Home extends Component {
  render() {
    const { userStore } = this.props.RootStore

    return <>
      {
        userStore.map(user => {
          return (
            <React.Fragment key={user.firstName}>
              <p>First Name: { user.firstName }</p>
              <p>Last Name: { user.lastName }</p>
              <p>BirtDate: { user.birthDate }</p>
            </React.Fragment>
          )
        })
      }
    </>
  }
}