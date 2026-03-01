import { useState, KeyboardEvent, useRef } from 'react'
import { PaperPlaneTilt } from '@phosphor-icons/react'

interface MessageInputProps {
  onSend: (text: string) => void
  onTyping: (isTyping: boolean) => void
  disabled?: boolean
}

export function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [text, setText] = useState('')
  const typingRef = useRef(false)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (typingRef.current) {
      onTyping(false)
      typingRef.current = false
    }
  }

  const handleChange = (val: string) => {
    setText(val)
    if (val.length > 0 && !typingRef.current) {
      typingRef.current = true
      onTyping(true)
    } else if (val.length === 0 && typingRef.current) {
      typingRef.current = false
      onTyping(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const charsLeft = 500 - text.length
  const nearLimit = charsLeft < 50

  return (
    <div className="border-t border-[#1e1e30] bg-[#050508]">
      <div className="flex items-end gap-0">
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje... (Enter para enviar)"
          disabled={disabled}
          maxLength={500}
          rows={1}
          className="flex-1 bg-transparent resize-none px-4 py-3.5 text-[13px] text-[#e8e8f5] placeholder-[#2a2a40] outline-none font-mono leading-relaxed disabled:opacity-40"
          style={{ maxHeight: '120px', overflowY: 'auto' }}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 120) + 'px'
          }}
        />

        <div className="flex items-center gap-2 px-3 pb-3 self-end">
          {nearLimit && (
            <span className={`text-[10px] font-mono ${charsLeft < 10 ? 'text-[#ff3366]' : 'text-[#ffcc00]'}`}>
              {charsLeft}
            </span>
          )}
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className="w-8 h-8 flex items-center justify-center bg-[#00ff88] text-[#050508] hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <PaperPlaneTilt size={15} weight="fill" />
          </button>
        </div>
      </div>
      <div className="px-4 pb-2 text-[10px] text-[#1e1e30] font-mono">
        Enter para enviar · Shift+Enter nueva línea
      </div>
    </div>
  )
}
