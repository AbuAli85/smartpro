import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "@/components/ui/toast-context"
import "@/app/globals.css"

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </SessionProvider>
  )
}

