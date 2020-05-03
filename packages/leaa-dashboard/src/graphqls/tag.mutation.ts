import gql from 'graphql-tag';

export const CREATE_TAG = gql`
  mutation($tag: CreateTagInput!) {
    createTag(tag: $tag) {
      id
      name
      icon
      description
      created_at
      updated_at
    }
  }
`;

export const UPDATE_TAG = gql`
  mutation($id: String!, $tag: UpdateTagInput!) {
    updateTag(id: $id, tag: $tag) {
      id
      name
      icon
      description
      created_at
      updated_at
    }
  }
`;

export const DELETE_TAG = gql`
  mutation($id: String!) {
    deleteTag(id: $id) {
      id
      name
      icon
      description
      created_at
      updated_at
    }
  }
`;

export const SYNC_TAGS_TO_FILE = gql`
  mutation {
    syncTagsToDictFile {
      status
    }
  }
`;
