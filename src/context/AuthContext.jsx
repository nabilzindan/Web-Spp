import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured, TABLES } from '../lib/supabaseClient'
import { MOCK_USERS } from '../lib/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Restore session from localStorage if available
    const cached = localStorage.getItem('spp_user_session_v2')
    if (cached) {
      try {
        setUser(JSON.parse(cached))
      } catch (_) {}
    } else {
      // Default to Admin session on initial visit
      setUser(MOCK_USERS[0])
      localStorage.setItem('spp_user_session_v2', JSON.stringify(MOCK_USERS[0]))
    }
    setLoading(false)
  }, [])

  // Robust universal login method that handles Supabase Auth AND local registered accounts seamlessly
  const signInWithPassword = useCallback(async (identifier, password = '') => {
    setAuthError(null)
    const cleanId = (identifier || '').trim().toLowerCase()

    if (!cleanId) {
      setAuthError('Silakan masukkan email, username, atau NIS Anda.')
      return { error: 'empty_identifier' }
    }

    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: password || '123456',
        })

        if (!error && data?.user) {
          const { data: profile } = await supabase
            .from(TABLES.profiles)
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profile) {
            setUser(profile)
            localStorage.setItem('spp_user_session_v2', JSON.stringify(profile))
            return { data: profile }
          }
        }
      } catch (err) {
        console.warn('Supabase auth attempt bypassed to local match:', err)
      }
    }

    // 2. Direct local account matching by Email, Username, Role alias, or NIS
    const matched = MOCK_USERS.find((u) => {
      const emailMatch = u.email.toLowerCase() === cleanId
      const nisMatch = u.nis && u.nis === cleanId
      const roleMatch = u.role.toLowerCase() === cleanId
      const nameMatch = u.full_name.toLowerCase().includes(cleanId)
      const aliasMatch =
        (cleanId === 'admin' && u.role === 'admin') ||
        (cleanId === 'tu' && u.role === 'tu') ||
        (cleanId === 'bendahara' && u.role === 'tu') ||
        (cleanId === 'kepsek' && u.role === 'kepsek') ||
        (cleanId === 'ortu' && u.role === 'ortu') ||
        (cleanId === 'siswa' && u.role === 'siswa')

      return emailMatch || nisMatch || roleMatch || aliasMatch || nameMatch
    })

    if (matched) {
      setUser(matched)
      localStorage.setItem('spp_user_session_v2', JSON.stringify(matched))
      return { data: matched }
    }

    // 3. Fallback for custom email: auto-assign role based on email pattern
    if (cleanId.includes('@')) {
      let role = 'ortu'
      if (cleanId.includes('admin')) role = 'admin'
      else if (cleanId.includes('tu') || cleanId.includes('bendahara')) role = 'tu'
      else if (cleanId.includes('kepsek') || cleanId.includes('kepala')) role = 'kepsek'
      else if (cleanId.includes('siswa')) role = 'siswa'

      const customUser = {
        id: `u-${Date.now()}`,
        full_name: cleanId.split('@')[0].replace('.', ' ').toUpperCase(),
        role,
        email: cleanId,
        phone: '0812-0000-0000',
        description: `Akun Kustom (${role.toUpperCase()})`,
      }

      setUser(customUser)
      localStorage.setItem('spp_user_session_v2', JSON.stringify(customUser))
      return { data: customUser }
    }

    setAuthError('Akun tidak ditemukan. Gunakan email terdaftar (misal: admin@smksjp1.sch.id, bendahara@smksjp1.sch.id, dll.) atau pilih akun cepat di bawah.')
    return { error: 'not_found' }
  }, [])

  const signInAsUser = useCallback((userObj) => {
    setUser(userObj)
    setAuthError(null)
    localStorage.setItem('spp_user_session_v2', JSON.stringify(userObj))
    return userObj
  }, [])

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {})
    }
    setUser(null)
    localStorage.removeItem('spp_user_session_v2')
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      signInWithPassword,
      signInAsUser,
      signOut,
      isSupabaseConfigured,
      availableUsers: MOCK_USERS,
    }),
    [user, loading, authError, signInWithPassword, signInAsUser, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
