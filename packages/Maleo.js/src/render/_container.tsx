import React from 'react';
import { createBrowserHistory } from 'history';
import { Router, StaticRouter } from 'react-router-dom';

import { ContainerProps } from '@interfaces/render/IRender';

export class ContainerComponent extends React.Component<ContainerProps, {}> {
  history = !this.props.server ? createBrowserHistory() : null;

  render() {
    const { server, children, location, context } = this.props;

    if (!server) {
      return <Router history={this.history as History<any>}>{children}</Router>;
    }

    return (
      <StaticRouter location={location} context={context}>
        {children}
      </StaticRouter>
    );
  }
}

export default ContainerComponent;
