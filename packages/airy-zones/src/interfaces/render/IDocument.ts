import React from 'react';
import { DocumentContext } from './IRender';

export interface Document extends React.Component {
  getInitialProps(a: DocumentContext): any;
}
