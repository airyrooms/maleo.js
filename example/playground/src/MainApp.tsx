import React from 'react';
import { Link } from 'react-router-dom';

export class RoomsMainApp extends React.Component<any, any> {
  static displayName = 'RoomsMainApp';

  static getInitialProps = async ({ store, ...context }) => {
    // const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    // const data = await response.json();
    const data = {};
    console.log('GIP Main App')

    if (store) {
      store.dispatch({ type: 'TEST', data: 'testttt' });
    }

    return { data, store };
  };

  render() {
    return (
      <div>
        rooms main app
        <h1>rooms main app</h1>
        <ul>
          <li>
            <Link to="/">Root</Link>
          </li>
          <li>
            <Link to="/search">Search</Link>
          </li>
          <li>
            <Link to="/detail">Detail</Link>
          </li>
        </ul>
        <div>{this.props.children}</div>
      </div>
    );
  }
}

export default RoomsMainApp;
