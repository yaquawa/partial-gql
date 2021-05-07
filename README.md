# partial-gql
A tiny lib for extracting partial GraphQL AST from a given set of paths.

## Installation
```bash
npm i partial-gql
```

## Basic Usage

```js
import gql from 'graphql-tag'
import { print } from 'graphql'
import { pickNodesByPath, omitNodesByPath } from 'partial-gql'

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

const picked = pickNodesByPath(ast, ['getClient.owner', 'getClient.address', 'getClient.logo'])
console.log(print(picked))
// output:
//
// query GetClient($owner: String!) {
//   getClient(owner: $owner) {
//     owner
//     address
//     logo {
//       file {
//         id
//         key
//       }
//       category
//       description
//     }
//   }
// }



const omitted = omitNodesByPath(ast, ['getClient.createdAt', 'getClient.logo.file'])
console.log(print(omitted))

// output:
//
// query GetClient($owner: String!) {
//   getClient(owner: $owner) {
//     owner
//     address
//     tel
//     logo {
//       category
//       description
//     }
//     updatedAt
//   }
// }
```

