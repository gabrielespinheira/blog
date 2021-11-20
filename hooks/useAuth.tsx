import { createContext, useState, useEffect, useContext } from 'react'

import { auth, firestore, googleAuthProvider } from 'services/firebase'
import { IUser } from 'types'
import { getStorage, setStorage } from 'services/storage'

interface IAuthContextType {
  user: IUser | null | undefined
  username: string | null
  signed: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext({} as IAuthContextType)

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState<IUser>()
  const [username, setUsername] = useState(null)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    loadUsername()
  }, [user])

  async function loadUser() {
    const cachedUser = await getStorage('user')

    if (cachedUser) {
      setUser(cachedUser)
    }
  }

  async function loadUsername() {
    const cachedUsername = await getStorage('username')

    if (!cachedUsername) {
      let unsubscribe
      if (user) {
        const ref = firestore.collection('users').doc(user.uid)
        unsubscribe = ref.onSnapshot(async (doc) => {
          setUsername(doc.data()?.username)
          setStorage('username', doc.data()?.username)
        })
      }
      return unsubscribe
    }

    setUsername(cachedUsername)
  }

  const signInWithGoogle = async () => {
    await auth
      .signInWithPopup(googleAuthProvider)
      .then((result) => {
        if (
          !result.user?.uid ||
          !result.user.displayName ||
          !result.user.photoURL
        ) {
          console.error('Fields not found')
          return
        }

        const userInfo = {
          uid: result.user.uid,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        }

        setUser(userInfo)
        setStorage('user', userInfo)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const signOut = async () => {
    await auth.signOut()
    return
  }

  return (
    <AuthContext.Provider
      value={{ user, username, signed: !!user, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
