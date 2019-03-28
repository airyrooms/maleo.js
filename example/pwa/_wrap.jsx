import React from 'react';
import Wrap from '@airy/maleo/wrap';
import pageWithStyles from '@airy/maleo-css-plugin/pageWithStyles';

@pageWithStyles
export default class extends Wrap {
  static getInitialProps = () => {
    // Register Service Worker on client
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw').then(function() {
          console.log('Service Worker Registered');
        });
      }
    }
  };
}
