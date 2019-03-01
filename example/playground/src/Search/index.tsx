import * as React from 'react';
import Loadable from 'react-loadable';

const DetailComponent = Loadable({
  loading: () => <div>loading getting detail...</div>,
  loader: () => import('src/Detail' /* webpackChunkName:"Detail" */),
  modules: ['./src/Detail'],
});

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
          backgroundColor: 'blue',
          display: 'inline-block',
          float: 'left',
          maxWidth: '50%',
        }}>
        <h1>Rooms Search</h1>
        {this.props.children}

        <br />
        <br />
        <br />
        <DetailComponent />
      </div>
    );
  }
}

export default RoomsSearch;
