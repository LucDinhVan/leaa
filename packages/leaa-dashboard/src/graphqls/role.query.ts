import gql from 'graphql-tag';

export const GET_ROLES = gql`
  query($page: Int, $pageSize: Int, $orderBy: String, $orderSort: String, $q: String) {
    roles(page: $page, pageSize: $pageSize, orderBy: $orderBy, orderSort: $orderSort, q: $q) {
      total
      items {
        id
        name
        slug
        created_at
        updated_at
        permissions {
          id
          slug
        }
      }
    }
  }
`;

export const GET_ROLE = gql`
  query($id: String!) {
    role(id: $id) {
      id
      name
      slug
      created_at
      updated_at
      permissions {
        id
        name
        slug
      }
    }
  }
`;
