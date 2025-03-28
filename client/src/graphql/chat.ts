import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats {
    chats {
      id
      name
      isGroup
      lastMessageAt
      members {
        id
        user {
          id
          username
          avatarUrl
          status
        }
        role
      }
      messages(last: 1) {
        id
        content
        createdAt
        sender {
          id
          username
          avatarUrl
        }
      }
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: ID!, $cursor: String) {
    messages(chatId: $chatId, first: 50, before: $cursor) {
      edges {
        node {
          id
          content
          createdAt
          sender {
            id
            username
            avatarUrl
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: ID!, $content: String!) {
    sendMessage(chatId: $chatId, content: $content) {
      id
      content
      createdAt
      sender {
        id
        username
        avatarUrl
      }
    }
  }
`;

export const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription OnNewMessage($chatId: ID!) {
    messageCreated(chatId: $chatId) {
      id
      content
      createdAt
      sender {
        id
        username
        avatarUrl
      }
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($input: CreateChatInput!) {
    createChat(input: $input) {
      id
      name
      isGroup
      members {
        id
        user {
          id
          username
          avatarUrl
          status
        }
        role
      }
    }
  }
`;