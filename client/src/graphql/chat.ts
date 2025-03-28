import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats {
    getChats {
      id
      name
      isGroup
      lastMessageAt
      messages(last: 1) {
        id
        content
        createdAt
        user {
          id
          username
          avatarUrl
        }
      }
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($input: GetMessagesInput!) {
    getMessages(input: $input) {
      id
      content
      type
      metadata
      createdAt
      user {
        id
        username
        avatarUrl
        status
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      createdAt
      user {
        id
        username
        avatarUrl
      }
    }
  }
`;

export const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription OnNewMessage($chatId: String!) {
    messageCreated(chatId: $chatId) {
      id
      content
      createdAt
      user {
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
        userId
      }
    }
  }
`;
