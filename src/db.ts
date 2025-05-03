import { get, set } from 'idb-keyval';
import type { Conversation } from './types';

export const saveConversations = async (conversations: Conversation[]) => {
  await set('conversations', conversations);
};

export const loadConversations = async (): Promise<Conversation[] | null | undefined> => {
  return await get('conversations');
};
