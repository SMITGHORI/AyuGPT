export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  feedback?: 'up' | 'down' | null;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface SendMessageParams {
  history: Message[];
  newMessage: string;
  onStream: (chunk: string) => void;
  onFinish: (fullText: string) => void;
  onError: (error: Error) => void;
}