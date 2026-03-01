import { User, Message, Room } from './types'
import { v4 as uuidv4 } from 'uuid'

// Available rooms
export const ROOMS: Room[] = [
  { id: 'general',    name: '#general',    description: 'Conversación general',         userCount: 0 },
  { id: 'backend',    name: '#backend',    description: 'Node.js, APIs, bases de datos', userCount: 0 },
  { id: 'security',   name: '#security',   description: 'Hacking ético, Kali, redes',   userCount: 0 },
  { id: 'portfolio',  name: '#portfolio',  description: 'Sobre este portfolio',          userCount: 0 },
]

// In-memory store
const users = new Map<string, User>()
const messages = new Map<string, Message[]>()
const MAX_MESSAGES_PER_ROOM = 50

// Initialize message arrays for each room
ROOMS.forEach((r) => messages.set(r.id, []))

// --- Users ---
export function addUser(socketId: string, nickname: string, room: string): User {
  const user: User = { id: socketId, nickname, room, joinedAt: Date.now() }
  users.set(socketId, user)
  updateRoomCount(room)
  return user
}

export function removeUser(socketId: string): User | undefined {
  const user = users.get(socketId)
  if (user) {
    users.delete(socketId)
    updateRoomCount(user.room)
  }
  return user
}

export function getUser(socketId: string): User | undefined {
  return users.get(socketId)
}

export function getUsersInRoom(room: string): User[] {
  return Array.from(users.values()).filter((u) => u.room === room)
}

// --- Messages ---
export function addMessage(
  userId: string,
  nickname: string,
  text: string,
  room: string,
  type: 'message' | 'system' = 'message'
): Message {
  const message: Message = {
    id: uuidv4(),
    userId,
    nickname,
    text,
    room,
    timestamp: Date.now(),
    type,
  }

  const roomMessages = messages.get(room) ?? []
  roomMessages.push(message)

  // Keep only last MAX_MESSAGES_PER_ROOM
  if (roomMessages.length > MAX_MESSAGES_PER_ROOM) {
    roomMessages.splice(0, roomMessages.length - MAX_MESSAGES_PER_ROOM)
  }

  messages.set(room, roomMessages)
  return message
}

export function getRoomMessages(room: string): Message[] {
  return messages.get(room) ?? []
}

// --- Room counts ---
function updateRoomCount(room: string): void {
  const roomDef = ROOMS.find((r) => r.id === room)
  if (roomDef) {
    roomDef.userCount = getUsersInRoom(room).length
  }
}

// --- Nickname validation ---
export function isNicknameTaken(nickname: string, room: string): boolean {
  return getUsersInRoom(room).some(
    (u) => u.nickname.toLowerCase() === nickname.toLowerCase()
  )
}
