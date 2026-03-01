import { useState, useEffect, useRef, useCallback } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket'
import { Message, User, Room } from '../types'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface UseChatReturn {
  // State
  status: ConnectionStatus
  messages: Message[]
  users: User[]
  currentUser: User | null
  currentRoom: string | null
  typingUsers: string[]
  error: string | null

  // Actions
  join: (nickname: string, room: string) => void
  leave: () => void
  sendMessage: (text: string) => void
  setTyping: (isTyping: boolean) => void
  clearError: () => void
}

export function useChat(): UseChatReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const socket = connectSocket()

    // Connection lifecycle
    socket.on('connect', () => {
      setStatus('connected')
      setError(null)
      console.log('[socket] connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      setStatus('disconnected')
      console.log('[socket] disconnected:', reason)
      if (reason === 'io server disconnect') {
        // Server kicked us — don't auto-reconnect
        setCurrentUser(null)
        setCurrentRoom(null)
      }
    })

    socket.on('connect_error', (err) => {
      setStatus('error')
      setError(`No se pudo conectar al servidor: ${err.message}`)
      console.error('[socket] connect_error:', err)
    })

    // Room events
    socket.on('room:joined', ({ user, messages: history, users: roomUsers }) => {
      setCurrentUser(user)
      setCurrentRoom(user.room)
      setMessages(history)
      setUsers(roomUsers)
      setStatus('connected')
    })

    socket.on('room:users', (roomUsers) => {
      setUsers(roomUsers)
    })

    // Message events
    socket.on('message:new', (message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on('user:joined', ({ message }) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on('user:left', ({ message }) => {
      setMessages((prev) => [...prev, message])
    })

    // Typing
    socket.on('user:typing', ({ nickname, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(nickname) ? prev : [...prev, nickname]
        } else {
          return prev.filter((n) => n !== nickname)
        }
      })
    })

    // Server errors
    socket.on('error', ({ message }) => {
      setError(message)
    })

    setStatus('connecting')

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('room:joined')
      socket.off('room:users')
      socket.off('message:new')
      socket.off('user:joined')
      socket.off('user:left')
      socket.off('user:typing')
      socket.off('error')
      disconnectSocket()
    }
  }, [])

  const join = useCallback((nickname: string, room: string) => {
    const socket = getSocket()
    setError(null)
    socket.emit('room:join', { nickname, room })
  }, [])

  const leave = useCallback(() => {
    const socket = getSocket()
    socket.emit('room:leave')
    setCurrentUser(null)
    setCurrentRoom(null)
    setMessages([])
    setUsers([])
    setTypingUsers([])
  }, [])

  const sendMessage = useCallback((text: string) => {
    if (!currentRoom) return
    const socket = getSocket()
    socket.emit('message:send', { text, room: currentRoom })

    // Stop typing indicator when message sent
    if (currentUser && currentRoom) {
      socket.emit('user:typing', { room: currentRoom, nickname: currentUser.nickname, isTyping: false })
    }
  }, [currentRoom, currentUser])

  const setTyping = useCallback((isTyping: boolean) => {
    if (!currentRoom || !currentUser) return
    const socket = getSocket()

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)

    socket.emit('user:typing', {
      room: currentRoom,
      nickname: currentUser.nickname,
      isTyping,
    })

    // Auto-clear typing after 3s
    if (isTyping) {
      typingTimerRef.current = setTimeout(() => {
        socket.emit('user:typing', {
          room: currentRoom,
          nickname: currentUser.nickname,
          isTyping: false,
        })
      }, 3000)
    }
  }, [currentRoom, currentUser])

  const clearError = useCallback(() => setError(null), [])

  return {
    status,
    messages,
    users,
    currentUser,
    currentRoom,
    typingUsers,
    error,
    join,
    leave,
    sendMessage,
    setTyping,
    clearError,
  }
}
