import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabaseClient'

/**
 * Generic hook wrapping Supabase CRUD for a table, with graceful fallback
 * to local mock data (and local-only mutations) when Supabase isn't
 * configured or a request fails. This lets every screen in the app work
 * standalone for demos, and "just work" once real credentials are supplied.
 */
export function useSupabaseTable(tableName, mockRows) {
  const [rows, setRows] = useState(mockRows)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usingMock, setUsingMock] = useState(!isSupabaseConfigured)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUsingMock(true)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase.from(tableName).select('*')
    if (err) {
      setError(err.message)
      setUsingMock(true)
    } else {
      setRows(data)
      setUsingMock(false)
    }
    setLoading(false)
  }, [tableName])

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const insert = useCallback(
    async (payload) => {
      if (!isSupabaseConfigured) {
        const optimistic = { id: `local-${Date.now()}`, ...payload }
        setRows((prev) => [optimistic, ...prev])
        return { data: optimistic }
      }
      const { data, error: err } = await supabase.from(tableName).insert(payload).select().single()
      if (!err) setRows((prev) => [data, ...prev])
      return { data, error: err }
    },
    [tableName]
  )

  const update = useCallback(
    async (id, payload) => {
      if (!isSupabaseConfigured) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...payload } : r)))
        return { data: { id, ...payload } }
      }
      const { data, error: err } = await supabase.from(tableName).update(payload).eq('id', id).select().single()
      if (!err) setRows((prev) => prev.map((r) => (r.id === id ? data : r)))
      return { data, error: err }
    },
    [tableName]
  )

  const remove = useCallback(
    async (id) => {
      if (!isSupabaseConfigured) {
        setRows((prev) => prev.filter((r) => r.id !== id))
        return { error: null }
      }
      const { error: err } = await supabase.from(tableName).delete().eq('id', id)
      if (!err) setRows((prev) => prev.filter((r) => r.id !== id))
      return { error: err }
    },
    [tableName]
  )

  return { rows, setRows, loading, error, usingMock, refresh, insert, update, remove }
}
