import { createContext } from 'react'

interface IContext {
  user: {
    photoURL: string | null
    uid: string | null
    displayName: string | null
  } | null
  username: string | null
}

export const UserContext = createContext({
  user: null,
  username: null,
} as IContext)
