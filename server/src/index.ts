import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { ServerToClientEvents, ClientToServerEvents } from './types'
import { registerSocketHandlers } from './handlers'
import { ROOMS } from './store'

const PORT = process.env.PORT ?? 3001
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'
const isDev = process.env.NODE_ENV !== 'production'

// ── Express ──────────────────────────────────────────────────────────────────
const app = express()

app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())

// Health check — Railway uses this
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() })
})

// Rooms list endpoint
app.get('/rooms', (_req, res) => {
  res.json({ rooms: ROOMS })
})

// ── HTTP Server ───────────────────────────────────────────────────────────────
const httpServer = createServer(app)

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Ping/pong to detect dead connections
  pingTimeout: 20000,
  pingInterval: 10000,
})

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket)
})

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Chat server running`)
  console.log(`   http://localhost:${PORT}`)
  console.log(`   Client origin: ${CLIENT_URL}`)
  console.log(`   Mode: ${isDev ? 'development' : 'production'}\n`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing...')
  httpServer.close(() => process.exit(0))
})
