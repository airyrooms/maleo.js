import React from 'react';

import { AppProps, ContainerProps } from '@interfaces/render/IRender';

interface WrapProps {
  children: React.ReactElement<any>;
  Container: typeof React.Component;
  App: typeof React.Component;
  containerProps: ContainerProps;
  appProps: AppProps;
}

export default class _Wrap extends React.Component<WrapProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { Container, App, containerProps, appProps } = this.props;

    return (
      <Container {...containerProps}>
        <App {...appProps} />
      </Container>
    );
  }
}
