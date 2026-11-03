import { createContext, useContext, useState } from 'react'
import { api } from '../api/client.js'

const AuthContext = createContext(null)

function readUser() {
  const raw = localStorage.getItem('user')
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)

  function applyAuth(data) {
    const u = { id: data.id, email: data.email, fullName: data.fullName, role: data.role }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    return applyAuth(data)
  }

  const register = async (fullName, email, password) => {
    const data = await api.post('/auth/register', { fullName, email, password })
    return applyAuth(data)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      /* cookie уже могла протухнуть */
    }
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
