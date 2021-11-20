import Link from 'next/link'

import { useAuth } from 'hooks'

interface IAuthCheck {
  children: JSX.Element | JSX.Element[]
  fallback?: JSX.Element | JSX.Element[]
}

export default function AuthCheck({ children, fallback }: IAuthCheck) {
  const { username } = useAuth()

  if (!username) {
    return (
      <>
        fallback || <Link href="/login">You must be signed in</Link>
      </>
    )
  }

  return <>{children}</>
}
