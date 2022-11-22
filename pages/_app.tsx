import { SessionProvider } from "next-auth/react";
import type { AppProps } from 'next/app';
import type { Session } from "next-auth";

export default function MyApp({ 
  Component,
  pageProps: { session, ...pageProps }
}: AppProps<{ session: Session }>) {
  // Providers - Context/Providers, Theme, data
  // Layout
  // add props
  return (
    <>
      <SessionProvider session={session}>
        <Component {...pageProps}/>
      </SessionProvider>
    </>
  )
}