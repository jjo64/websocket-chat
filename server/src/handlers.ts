import { Server, Socket } from 'socket.io'
import {
  ServerToClientEvents,
  ClientToServerEvents,
  JoinRoomPayload,
  SendMessagePayload,
  TypingPayload,
} from './types'
import {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  addMessage,
  getRoomMessages,
  isNicknameTaken,
  ROOMS,
} from './store'

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>

const MAX_MESSAGE_LENGTH = 500
const NICKNAME_REGEX = /^[a-zA-Z0-9_\-\.]{2,20}$/

export function registerSocketHandlers(io: AppServer, socket: AppSocket): void {
  console.log(`[socket] connected: ${socket.id}`)

  // ── JOIN ROOM ──────────────────────────────────────────────────────────────
  socket.on('room:join', ({ nickname, room }: JoinRoomPayload) => {
    // Validate nickname
    if (!NICKNAME_REGEX.test(nickname)) {
      socket.emit('error', { message: 'Nickname inválido. Usa 2-20 caracteres alfanuméricos.' })
      return
    }

    // Validate room
    const validRoom = ROOMS.find((r) => r.id === room)
    if (!validRoom) {
      socket.emit('error', { message: 'Sala no encontrada.' })
      return
    }

    // Check nickname taken
    if (isNicknameTaken(nickname, room)) {
      socket.emit('error', { message: 'Ese nickname ya está en uso en esta sala.' })
      return
    }

    // Leave any previous room
    const existing = getUser(socket.id)
    if (existing) {
      socket.leave(existing.room)
      removeUser(socket.id)
    }

    // Join new room
    socket.join(room)
    const user = addUser(socket.id, nickname, room)
    const history = getRoomMessages(room)
    const users = getUsersInRoom(room)

    // Tell the joiner about their session + history
    socket.emit('room:joined', { user, messages: history, users })

    // Notify others in the room
    const sysMsg = addMessage('system', 'sistema', `${nickname} se unió a la sala`, room, 'system')
    socket.to(room).emit('user:joined', { user, message: sysMsg })
    socket.to(room).emit('room:users', users)

    console.log(`[chat] ${nickname} joined #${room}`)
  })

  // ── SEND MESSAGE ──────────────────────────────────────────────────────────
  socket.on('message:send', ({ text, room }: SendMessagePayload) => {
    const user = getUser(socket.id)
    if (!user) {
      socket.emit('error', { message: 'No estás en ninguna sala.' })
      return
    }

    const trimmed = text.trim()
    if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) {
      socket.emit('error', { message: `Mensaje inválido (máx ${MAX_MESSAGE_LENGTH} caracteres).` })
      return
    }

    const message = addMessage(user.id, user.nickname, trimmed, room)

    // Broadcast to everyone in room (including sender)
    io.to(room).emit('message:new', message)
    console.log(`[chat] [#${room}] ${user.nickname}: ${trimmed.substring(0, 60)}`)
  })

  // ── TYPING ────────────────────────────────────────────────────────────────
  socket.on('user:typing', ({ room, nickname, isTyping }: TypingPayload) => {
    socket.to(room).emit('user:typing', { nickname, isTyping })
  })

  // ── LEAVE ROOM ────────────────────────────────────────────────────────────
  socket.on('room:leave', () => {
    handleDisconnect(io, socket)
  })

  // ── DISCONNECT ────────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log(`[socket] disconnected: ${socket.id} (${reason})`)
    handleDisconnect(io, socket)
  })
}

function handleDisconnect(io: AppServer, socket: AppSocket): void {
  const user = removeUser(socket.id)
  if (!user) return

  const sysMsg = addMessage('system', 'sistema', `${user.nickname} salió de la sala`, user.room, 'system')
  const remaining = getUsersInRoom(user.room)

  io.to(user.room).emit('user:left', {
    userId: user.id,
    nickname: user.nickname,
    message: sysMsg,
  })
  io.to(user.room).emit('room:users', remaining)

  console.log(`[chat] ${user.nickname} left #${user.room}`)
}
