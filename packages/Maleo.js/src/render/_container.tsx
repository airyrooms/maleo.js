import React from 'react';
import { createBrowserHistory } from 'history';
import { Router, StaticRouter } from 'react-router-dom';

import { ContainerProps } from '@interfaces/render';

export class ContainerComponent extends React.Component<ContainerProps, {}> {
  // @ts-ignore
  history: History<any> | null = !this.props.server ? createBrowserHistory() : null;

  render() {
    const { server, children, location, context } = this.props;

    if (!server) {
      return <Router history={this.history}>{children}</Router>;
    }

    return (
      <StaticRouter location={location} context={context}>
        {children}
      </StaticRouter>
    );
  }
}

export default ContainerComponent;
