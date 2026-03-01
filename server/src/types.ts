// Shared types used by both server and client

export interface User {
  id: string
  nickname: string
  room: string
  joinedAt: number
}

export interface Message {
  id: string
  userId: string
  nickname: string
  text: string
  room: string
  timestamp: number
  type: 'message' | 'system'
}

export interface Room {
  id: string
  name: string
  description: string
  userCount: number
}

// Socket event payloads
export interface JoinRoomPayload {
  nickname: string
  room: string
}

export interface SendMessagePayload {
  text: string
  room: string
}

export interface TypingPayload {
  room: string
  nickname: string
  isTyping: boolean
}

// Server → Client events
export interface ServerToClientEvents {
  'room:joined': (data: { user: User; messages: Message[]; users: User[] }) => void
  'room:left': (data: { userId: string; nickname: string }) => void
  'room:users': (users: User[]) => void
  'message:new': (message: Message) => void
  'user:joined': (data: { user: User; message: Message }) => void
  'user:left': (data: { userId: string; nickname: string; message: Message }) => void
  'user:typing': (data: { nickname: string; isTyping: boolean }) => void
  'error': (data: { message: string }) => void
}

// Client → Server events
export interface ClientToServerEvents {
  'room:join': (payload: JoinRoomPayload) => void
  'room:leave': () => void
  'message:send': (payload: SendMessagePayload) => void
  'user:typing': (payload: TypingPayload) => void
}
