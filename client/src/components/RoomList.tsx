import { Room } from '../types'

interface RoomListProps {
  rooms: Room[]
  currentRoom: string
  onSwitch: (roomId: string) => void
}

export function RoomList({ rooms, currentRoom, onSwitch }: RoomListProps) {
  return (
    <div className="w-44 flex-shrink-0 border-r border-[#1e1e30] flex flex-col bg-[#050508]">
      <div className="px-4 py-3 border-b border-[#1e1e30]">
        <span className="text-[10px] text-[#44445a] tracking-[3px] uppercase">Salas</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {rooms.map((room) => {
          const isActive = room.id === currentRoom
          return (
            <button
              key={room.id}
              onClick={() => !isActive && onSwitch(room.id)}
              className={`w-full text-left px-4 py-2.5 transition-all group ${
                isActive
                  ? 'bg-[#00ff8808] text-[#00ff88]'
                  : 'text-[#44445a] hover:text-[#e8e8f5] hover:bg-[#0a0a10]'
              }`}
            >
              <div className="text-[12px] font-mono">{room.name}</div>
              <div className="text-[10px] opacity-50 mt-0.5">{room.userCount} online</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
