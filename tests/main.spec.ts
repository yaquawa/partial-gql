import gql from 'graphql-tag'
import { print } from 'graphql'
import { pickNodesByPath, omitNodesByPath } from '../src'

const ast = gql`
  query GetClient($owner: String!) {
    getClient(owner: $owner) {
      owner
      address
      tel
      logo {
        file {
          id
          key
        }
        category
        description
      }
      createdAt
      updatedAt
    }
  }
`

it('pick nodes by path', () => {
  const picked = pickNodesByPath(ast, ['getClient.owner', 'getClient.address', 'getClient.logo'])
  expect(print(picked)).toMatchSnapshot()
})

it('omit nodes by path', () => {
  const omitted = omitNodesByPath(ast, ['getClient.createdAt', 'getClient.logo.file'])
  expect(print(omitted)).toMatchSnapshot()
})
