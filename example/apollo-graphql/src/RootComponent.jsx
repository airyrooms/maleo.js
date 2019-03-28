import React from 'react';
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const query = gql`
  {
    todos{
      description
      status
      user {
        id
        name
      }
    }
  }
`

export default class extends React.Component {
  render() {
    return (
      <Query query={query}>
        {({ loading, error, data }) => {
          if (loading) return 'Loading...';
          if (error) return `Error! ${error.message}`;

          return (
            <ul>
              {data.todos.map((d) => (
                <li key={d.id}>
                  <p>
                    {d.description}
                  </p>
                  <p>
                    {d.status}
                  </p>
                  <p>
                    {d.user.name}
                  </p>
                </li>
              ))}
            </ul>
          )
        }}
      </Query>
    )
  }
}