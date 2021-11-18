import Link from 'next/link'
import { useContext } from 'react'

import { UserContext } from 'lib/context'

interface IAuthCheck {
  children: JSX.Element | JSX.Element[]
  fallback?: JSX.Element | JSX.Element[]
}

export default function AuthCheck({ children, fallback }: IAuthCheck) {
  const { username } = useContext(UserContext)

  if (!username) {
    return (
      <>
        fallback || <Link href="/login">You must be signed in</Link>
      </>
    )
  }

  return <>{children}</>
}
