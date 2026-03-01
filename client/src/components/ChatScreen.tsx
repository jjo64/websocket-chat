import { useState } from 'react'
import { SignOut, WifiHigh, WifiSlash, Users, X } from '@phosphor-icons/react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { UserList } from './UserList'
import { RoomList } from './RoomList'
import { Room, User, Message } from '../types'
import { ConnectionStatus } from '../hooks/useChat'

interface ChatScreenProps {
  messages: Message[]
  users: User[]
  rooms: Room[]
  currentUser: User
  currentRoom: string
  typingUsers: string[]
  status: ConnectionStatus
  error: string | null
  onSendMessage: (text: string) => void
  onTyping: (isTyping: boolean) => void
  onSwitchRoom: (roomId: string) => void
  onLeave: () => void
  onClearError: () => void
}

export function ChatScreen({
  messages,
  users,
  rooms,
  currentUser,
  currentRoom,
  typingUsers,
  status,
  error,
  onSendMessage,
  onTyping,
  onSwitchRoom,
  onLeave,
  onClearError,
}: ChatScreenProps) {
  const [showUsers, setShowUsers] = useState(true)
  const roomDef = rooms.find((r) => r.id === currentRoom)

  const otherTyping = typingUsers.filter((n) => n !== currentUser.nickname)

  return (
    <div className="h-screen bg-[#050508] flex flex-col font-mono overflow-hidden">

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 h-12 border-b border-[#1e1e30] flex-shrink-0 bg-[#050508]">
        {/* Logo */}
        <span className="text-[#00ff88] text-[11px] tracking-[3px] uppercase hidden sm:block">
          ~/chat
        </span>
        <span className="text-[#1e1e30] hidden sm:block">/</span>

        {/* Room name */}
        <span className="text-[#e8e8f5] text-[13px]">
          {roomDef?.name ?? `#${currentRoom}`}
        </span>
        {roomDef?.description && (
          <span className="text-[#44445a] text-[11px] hidden md:block">— {roomDef.description}</span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Connection badge */}
        <div className={`flex items-center gap-1.5 text-[10px] tracking-widest uppercase px-2 py-1 border ${
          status === 'connected'
            ? 'border-[#00ff8830] text-[#00ff88]'
            : 'border-[#ff336630] text-[#ff3366]'
        }`}>
          {status === 'connected' ? <WifiHigh size={11} /> : <WifiSlash size={11} />}
          <span className="hidden sm:inline">{status === 'connected' ? 'connected' : status}</span>
        </div>

        {/* User count toggle */}
        <button
          onClick={() => setShowUsers((v) => !v)}
          className="flex items-center gap-1.5 text-[#44445a] hover:text-[#e8e8f5] transition-colors text-[11px] px-2 py-1"
          title="Mostrar/ocultar usuarios"
        >
          <Users size={14} />
          <span>{users.length}</span>
        </button>

        {/* Leave */}
        <button
          onClick={onLeave}
          className="flex items-center gap-1.5 text-[#44445a] hover:text-[#ff3366] transition-colors text-[11px] px-2 py-1 border border-transparent hover:border-[#ff336630]"
          title="Salir del chat"
        >
          <SignOut size={14} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </header>

      {/* ── ERROR BANNER ────────────────────────────────────────────────── */}
      {error && (
        <div className="px-4 py-2 border-b border-[#ff336630] bg-[#ff336808] text-[#ff3366] text-[12px] flex items-center justify-between flex-shrink-0">
          <span>{error}</span>
          <button onClick={onClearError}><X size={14} /></button>
        </div>
      )}

      {/* ── MAIN AREA ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Room list — hidden on mobile */}
        <div className="hidden lg:flex">
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onSwitch={onSwitchRoom}
          />
        </div>

        {/* Messages + input */}
        <div className="flex flex-col flex-1 min-w-0">
          <MessageList messages={messages} currentUserId={currentUser.id} />

          {/* Typing indicator */}
          <div className="px-4 h-6 flex items-center flex-shrink-0">
            {otherTyping.length > 0 && (
              <span className="text-[11px] text-[#44445a] font-mono animate-pulse">
                {otherTyping.length === 1
                  ? `${otherTyping[0]} está escribiendo...`
                  : `${otherTyping.join(', ')} están escribiendo...`}
              </span>
            )}
          </div>

          <MessageInput
            onSend={onSendMessage}
            onTyping={onTyping}
            disabled={status !== 'connected'}
          />
        </div>

        {/* User list — toggle-able */}
        {showUsers && (
          <div className="hidden sm:flex">
            <UserList users={users} currentUserId={currentUser.id} />
          </div>
        )}
      </div>

      {/* ── BOTTOM STATUS (mobile) ──────────────────────────────────────── */}
      <div className="sm:hidden flex items-center justify-between px-4 py-2 border-t border-[#1e1e30] bg-[#050508] text-[10px] text-[#44445a]">
        <span>{currentUser.nickname}</span>
        <span>{users.length} online</span>
      </div>
    </div>
  )
}
