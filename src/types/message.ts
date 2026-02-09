export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'admin' | 'client';
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  tenantId: string;
  adminId: string;
  subject: string;
  lastMessageAt: string;
  unreadAdmin: number;
  unreadClient: number;
  createdAt: string;
}
