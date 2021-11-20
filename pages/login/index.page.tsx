import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'

import MetaTags from 'components/MetaTags'
import debounce from 'lodash.debounce'
import { useAuth } from 'hooks'
import { firestore } from 'services/firebase'

export default function Login() {
  const router = useRouter()
  const { user, username } = useAuth()

  useEffect(() => {
    if (user && username) {
      router.push(`/${username}`)
    }
  }, [])

  return (
    <main>
      <MetaTags title="Login" description="Sign up for this amazing app!" />
      {user ? (
        !username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <SignInButton />
      )}
    </main>
  )
}

// Sign in with Google button
function SignInButton() {
  const { signInWithGoogle } = useAuth()

  return (
    <>
      <button className="btn-google" onClick={signInWithGoogle}>
        {/* <img src={'/google.png'} width="30px" />  */}
        Sign in with Google
      </button>
    </>
  )
}

// Sign out button
function SignOutButton() {
  const { signOut } = useAuth()
  return <button onClick={signOut}>Sign Out</button>
}

// Username form
function UsernameForm() {
  const { user } = useAuth()
  const [formValue, setFormValue] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()

    const userDoc = firestore.doc(`users/${user?.uid}`)
    const usernameDoc = firestore.doc(`usernames/${formValue}`)

    const batch = firestore.batch()
    batch.set(userDoc, {
      username: formValue,
      photoURL: user?.photoURL,
      displayName: user?.displayName,
    })
    batch.set(usernameDoc, { uid: user?.uid })

    await batch.commit()
  }

  const onChange = (e) => {
    const val = e.target.value.toLowerCase()
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/

    if (val.length < 3) {
      setFormValue(val)
      setLoading(false)
      setIsValid(false)
    }

    if (re.test(val)) {
      setFormValue(val)
      setLoading(true)
      setIsValid(false)
    }
  }

  useEffect(() => {
    checkUsername(formValue)
  }, [formValue])

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = firestore.doc(`usernames/${username}`)
        const { exists } = await ref.get()
        console.log('Firestore read executed!')
        setIsValid(!exists)
        setLoading(false)
      }
    }, 500),
    []
  )

  return (
    <section>
      <h3>Choose Username</h3>
      <form onSubmit={onSubmit}>
        <input
          name="username"
          placeholder="myname"
          value={formValue}
          onChange={onChange}
        />
        <UsernameMessage
          username={formValue}
          isValid={isValid}
          loading={loading}
        />
        <button type="submit" className="btn-green" disabled={!isValid}>
          Choose
        </button>

        <h3>Debug State</h3>
        <div>
          Username: {formValue}
          <br />
          Loading: {loading.toString()}
          <br />
          Username Valid: {isValid.toString()}
        </div>
      </form>
    </section>
  )
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>
  } else {
    return <p></p>
  }
}
