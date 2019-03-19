import React from 'react';
import { createBrowserHistory } from 'history';
import { Router, StaticRouter, Switch } from 'react-router-dom';

interface WrapProps {
  children: React.ReactElement<any>;
  context?: any;
  location?: string;
  server?: boolean;
}

export default class _Wrap extends React.Component<WrapProps, {}> {
  constructor(props) {
    super(props);
  }

  history = !this.props.server ? createBrowserHistory() : null;

  render() {
    if (!this.props.server) {
      return (
        <Router history={this.history as History<any>}>
          <Switch>{this.props.children}</Switch>
        </Router>
      );
    }

    return (
      <StaticRouter location={this.props.location} context={this.props.context}>
        <Switch>{this.props.children}</Switch>
      </StaticRouter>
    );
  }
}
