# cinevault-chat

Chat en tiempo real · Socket.io · Node.js · React · TypeScript

```
┌─────────────────────────────────────────────────────────┐
│                     ARQUITECTURA                        │
│                                                         │
│   Browser (React)  ←─ WebSocket ─→  Server (Node.js)   │
│   Vercel                              Railway           │
│                                                         │
│   • JoinScreen     →  room:join    →  addUser()         │
│   • ChatScreen     →  message:send →  broadcast         │
│   • MessageList    ←  message:new  ←  io.to(room)       │
│   • UserList       ←  room:users   ←  getUsersInRoom()  │
└─────────────────────────────────────────────────────────┘
```

## Setup local

```bash
# Backend
cd server && npm install && cp .env.example .env && npm run dev
# → http://localhost:3001

# Frontend (nueva terminal)
cd client && npm install && cp .env.example .env && npm run dev
# → http://localhost:5173
```

Abrí varias pestañas para probar múltiples usuarios en tiempo real.

## Estructura

```
cinevault-chat/
├── server/
│   ├── src/
│   │   ├── index.ts      ← Express + Socket.io setup
│   │   ├── handlers.ts   ← Todos los eventos Socket.io
│   │   ├── store.ts      ← Estado en memoria
│   │   └── types.ts      ← Tipos compartidos
│   ├── railway.json
│   └── package.json
└── client/
    ├── src/
    │   ├── components/   ← JoinScreen, ChatScreen, MessageList...
    │   ├── hooks/        ← useChat (socket logic), useRooms
    │   ├── lib/          ← socket singleton
    │   └── types/
    ├── vercel.json
    └── package.json
```

## Deploy

### Backend → Railway
1. New Project → Deploy from GitHub → carpeta `server/`
2. Variables: `CLIENT_URL=https://tu-frontend.vercel.app`, `NODE_ENV=production`

### Frontend → Vercel
1. New Project → Root Directory: `client`
2. Variable: `VITE_SERVER_URL=https://tu-servidor.railway.app`

**Orden:** primero Railway (copiás la URL), luego Vercel (con esa URL), luego actualizás CLIENT_URL en Railway.

## Eventos Socket.io

| Evento | Dirección | Descripción |
|---|---|---|
| `room:join` | C→S | Entrar con nickname |
| `message:send` | C→S | Enviar mensaje |
| `user:typing` | C→S | Indicador de escritura |
| `room:joined` | S→C | Confirmación + historial |
| `message:new` | S→C | Nuevo mensaje broadcast |
| `room:users` | S→C | Lista de usuarios actualizada |
| `user:joined/left` | S→C | Mensajes de sistema |

## Features
- 4 salas independientes
- Historial de los últimos 50 mensajes por sala
- Indicador "está escribiendo..." en tiempo real
- Contador de usuarios online
- Reconexión automática (5 intentos)
- Validación de nickname (2-20 chars, alfanumérico)
- Nicknames únicos por sala
- Health check en `/health` para Railway
