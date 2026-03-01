import { useState, useEffect } from 'react'
import { Room } from '../types'

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001'

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${SERVER_URL}/rooms`)
      .then((r) => r.json())
      .then((data) => {
        setRooms(data.rooms ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo cargar las salas')
        setLoading(false)
      })
  }, [])

  return { rooms, loading, error }
}
