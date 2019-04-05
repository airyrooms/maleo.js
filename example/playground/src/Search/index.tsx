import * as React from 'react';
import { Link } from 'react-router-dom';

export class RoomsSearch extends React.Component<any, any> {
  static displayName = 'RoomsSearch';

  static getInitialProps = async (appContext) => {
    const { store } = appContext;
    if (store) {
      store.dispatch({ type: 'TEST', data: 'searchhh' });
    }
    return { data: { searchPage: true, a: 5 }, store };
  };

  render() {
    return (
      <div
        style={{
          backgroundColor: 'teal',
          display: 'inline-block',
          float: 'left',
          maxWidth: '50%',
        }}>
        <h1>Rooms Search</h1>
        <Link to="/search/hello">Hello</Link>
        {this.props.children}
      </div>
    );
  }
}

export default RoomsSearch;
