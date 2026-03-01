import { useState, FormEvent } from 'react'
import { ArrowRight, ChatCircleDots, WifiHigh, WifiSlash } from '@phosphor-icons/react'
import { Room } from '../types'
import { ConnectionStatus } from '../hooks/useChat'

interface JoinScreenProps {
  rooms: Room[]
  status: ConnectionStatus
  error: string | null
  onJoin: (nickname: string, room: string) => void
  onClearError: () => void
}

export function JoinScreen({ rooms, status, error, onJoin, onClearError }: JoinScreenProps) {
  const [nickname, setNickname] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('general')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return
    onJoin(nickname.trim(), selectedRoom)
  }

  const isConnecting = status === 'connecting'

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(#151520 1px, transparent 1px), linear-gradient(90deg, #151520 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[#00ff88] text-[10px] tracking-[4px] uppercase mb-4">
            <ChatCircleDots size={14} />
            CineVault Chat
          </div>
          <h1 className="font-display text-[#e8e8f5] mb-2" style={{ fontSize: 'clamp(48px, 10vw, 72px)', letterSpacing: 3 }}>
            CHAT
          </h1>
          <p className="text-[#44445a] text-[12px]">WebSockets · Socket.io · Tiempo real</p>
        </div>

        {/* Connection status */}
        <div className={`flex items-center gap-2 text-[11px] mb-6 px-4 py-2.5 border ${
          status === 'connected'
            ? 'border-[#00ff8830] bg-[#00ff8808] text-[#00ff88]'
            : status === 'error'
            ? 'border-[#ff336630] bg-[#ff336608] text-[#ff3366]'
            : 'border-[#1e1e30] bg-[#0a0a10] text-[#44445a]'
        }`}>
          {status === 'connected'
            ? <WifiHigh size={14} />
            : <WifiSlash size={14} />
          }
          <span className="uppercase tracking-widest">
            {status === 'connected' ? 'Servidor conectado'
              : status === 'connecting' ? 'Conectando...'
              : status === 'error' ? 'Error de conexión'
              : 'Desconectado'}
          </span>
          {status === 'connected' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 border border-[#ff336630] bg-[#ff336608] text-[#ff3366] text-[12px] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={onClearError} className="text-[#ff3366]/60 hover:text-[#ff3366] ml-3 text-lg leading-none">×</button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-0">
          {/* Nickname */}
          <div className="border border-[#1e1e30] bg-[#0a0a10]">
            <label className="block px-4 pt-3 text-[10px] text-[#44445a] tracking-[3px] uppercase">
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); onClearError() }}
              placeholder="tu_nick"
              maxLength={20}
              autoFocus
              className="w-full bg-transparent px-4 pb-3 pt-1 text-[14px] text-[#e8e8f5] placeholder-[#2a2a40] outline-none font-mono"
            />
          </div>

          {/* Room selector */}
          <div className="border border-t-0 border-[#1e1e30] bg-[#0a0a10]">
            <div className="px-4 pt-3 text-[10px] text-[#44445a] tracking-[3px] uppercase mb-3">
              Sala
            </div>
            <div className="px-4 pb-4 space-y-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all border ${
                    selectedRoom === room.id
                      ? 'border-[#00ff8840] bg-[#00ff8808] text-[#00ff88]'
                      : 'border-transparent text-[#44445a] hover:text-[#e8e8f5] hover:border-[#1e1e30]'
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-mono">{room.name}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{room.description}</div>
                  </div>
                  <div className="text-[10px] tracking-widest uppercase opacity-60 flex-shrink-0 ml-3">
                    {room.userCount} online
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!nickname.trim() || isConnecting || status === 'error'}
            className="w-full bg-[#00ff88] text-[#050508] py-4 text-[12px] font-bold tracking-[3px] uppercase flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Conectando...' : <>Entrar al chat <ArrowRight size={14} weight="bold" /></>}
          </button>
        </form>

        <p className="text-center text-[10px] text-[#2a2a40] mt-6 font-mono">
          // nickname: 2-20 chars, alfanumérico
        </p>
      </div>
    </div>
  )
}
