'use client'

import React from 'react'
import { AuthContext, useAuthProvider } from '@/frontend/hooks/useAuth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthProvider()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}