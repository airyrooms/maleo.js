import React from 'react';
import Wrap from '@airy/maleo/wrap';
import { ApolloProvider } from 'react-apollo';

import client from './src/client';

export default class CustomWrap extends Wrap{
  render() {
    return (
      <ApolloProvider client={client}>
        {super.render()}
      </ApolloProvider>
    )
  }
}