import { io, Socket } from 'socket.io-client'
import { ServerToClientEvents, ClientToServerEvents } from '../types'

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001'

let socket: AppSocket | null = null

export function getSocket(): AppSocket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ['polling', 'websocket'],
    })
  }
  return socket
}

export function connectSocket(): AppSocket {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}
