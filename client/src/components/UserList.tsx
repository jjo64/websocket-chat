import { User } from '../types'

interface UserListProps {
  users: User[]
  currentUserId: string
}

export function UserList({ users, currentUserId }: UserListProps) {
  return (
    <div className="w-48 flex-shrink-0 border-l border-[#1e1e30] flex flex-col bg-[#050508]">
      <div className="px-4 py-3 border-b border-[#1e1e30]">
        <span className="text-[10px] text-[#44445a] tracking-[3px] uppercase">
          Online — {users.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {users.map((user) => {
          const isMe = user.id === currentUserId
          return (
            <div
              key={user.id}
              className={`flex items-center gap-2.5 px-4 py-2 ${isMe ? 'bg-[#00ff8806]' : ''}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] flex-shrink-0 animate-pulse" />
              <span className={`text-[12px] font-mono truncate ${isMe ? 'text-[#00ff88]' : 'text-[#666680]'}`}>
                {user.nickname}
                {isMe && <span className="text-[#00ff88]/40 ml-1 text-[10px]">(tú)</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
