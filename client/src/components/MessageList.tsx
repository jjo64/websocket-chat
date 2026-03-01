import { useEffect, useRef } from 'react'
import { Message } from '../types'

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#2a2a40] text-[12px] font-mono tracking-widest uppercase">
          // sin mensajes aún
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin">
      {messages.map((msg, i) => {
        const isOwn = msg.userId === currentUserId
        const isSystem = msg.type === 'system'
        const prevMsg = messages[i - 1]
        const showNick = !isSystem && (!prevMsg || prevMsg.userId !== msg.userId || prevMsg.type === 'system')

        if (isSystem) {
          return (
            <div key={msg.id} className="flex justify-center py-2">
              <span className="text-[#2a2a40] text-[10px] font-mono tracking-widest uppercase px-3 py-1 border border-[#1e1e30]">
                // {msg.text}
              </span>
            </div>
          )
        }

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${showNick ? 'mt-3' : 'mt-0.5'}`}
          >
            {showNick && (
              <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <span className={`text-[10px] tracking-widest uppercase font-mono ${isOwn ? 'text-[#00d4ff]' : 'text-[#00ff88]'}`}>
                  {msg.nickname}
                </span>
                <span className="text-[#2a2a40] text-[10px]">{formatTime(msg.timestamp)}</span>
              </div>
            )}
            <div
              className={`max-w-[75%] px-3 py-2 text-[13px] leading-relaxed border font-mono break-words ${
                isOwn
                  ? 'border-[#00d4ff]/25 bg-[#00d4ff]/5 text-[#e8e8f5]'
                  : 'border-[#1e1e30] bg-[#0a0a10] text-[#e8e8f5]'
              }`}
            >
              {msg.text}
            </div>
            {!showNick && (
              <span className="text-[9px] text-[#2a2a40] mt-0.5 px-1">{formatTime(msg.timestamp)}</span>
            )}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
