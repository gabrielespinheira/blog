import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'

import 'styles/globals.css'
import Navbar from 'components/Navbar'

import { AuthContextProvider } from 'hooks/useAuth'

function App({ Component, pageProps }: AppProps) {
  return (
    <AuthContextProvider>
      <Navbar />
      <Component {...pageProps} />
      <Toaster />
    </AuthContextProvider>
  )
}

export default App
