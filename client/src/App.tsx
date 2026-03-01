import { useChat } from './hooks/useChat'
import { useRooms } from './hooks/useRooms'
import { JoinScreen } from './components/JoinScreen'
import { ChatScreen } from './components/ChatScreen'

export default function App() {
  const { rooms, loading: roomsLoading } = useRooms()

  const {
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
  } = useChat()

  const inRoom = currentUser !== null && currentRoom !== null

  // Switching room = leave + rejoin with same nickname
  const handleSwitchRoom = (roomId: string) => {
    if (!currentUser) return
    join(currentUser.nickname, roomId)
  }

  if (roomsLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <span className="text-[#44445a] text-[12px] font-mono tracking-widest animate-pulse">
          // cargando salas...
        </span>
      </div>
    )
  }

  if (!inRoom) {
    return (
      <JoinScreen
        rooms={rooms}
        status={status}
        error={error}
        onJoin={join}
        onClearError={clearError}
      />
    )
  }

  return (
    <ChatScreen
      messages={messages}
      users={users}
      rooms={rooms}
      currentUser={currentUser}
      currentRoom={currentRoom}
      typingUsers={typingUsers}
      status={status}
      error={error}
      onSendMessage={sendMessage}
      onTyping={setTyping}
      onSwitchRoom={handleSwitchRoom}
      onLeave={leave}
      onClearError={clearError}
    />
  )
}
