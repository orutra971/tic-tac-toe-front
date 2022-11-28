import { SessionProvider, useSession } from "next-auth/react";
import type { AppProps } from 'next/app';
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import { NextComponentType } from "next";
import * as Progress from '@radix-ui/react-progress';
import { blackA } from "@radix-ui/colors";
import { styled } from "@stitches/react";
import React from "react";
import { Image } from '@components';
import { useRouter } from "next/router";


//Add custom appProp type then use union to add it
type CustomAppProps = AppProps<{ session: Session }> & {
  Component: NextComponentType & {auth?: boolean} // add auth type
}

export default function MyApp({ 
  Component,
  pageProps: { session, ...pageProps }
}: CustomAppProps) {
  return (
    <>
      <SessionProvider session={session} basePath='/api/auth'>
      {Component.auth ? (
        <Auth>
          <Component {...pageProps} />
        </Auth>
      ) : (
        <Component {...pageProps} />
      )}
      </SessionProvider>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Auth({ children } : any) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isUser = !!session?.user
  
  useEffect(() => {
    // if (!session) return
    if (status === "loading") return
    if (status === "unauthenticated" && !router.route.startsWith('/login')) router.replace('/login');
  }, [isUser, status])
  
  if (isUser && session.user.id) {
    return children
  }
  
  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <ProgressIndeterminate/>// <div>Loading...</div> // <ProgressBar />
}

const Container = styled('div', {
  height: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  rowGap: '12px'
});


const ProgressRoot = styled(Progress.Root, {
  position: 'relative',
  overflow: 'hidden',
  background: blackA.blackA9,
  borderRadius: '99999px',
  width: 200,
  height: 25,
  // Fix overflow clipping in Safari
  // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
  transform: 'translateZ(0)',
});

const ProgressIndicator = styled(Progress.Indicator, {
  backgroundColor: 'green',
  width: '100%',
  height: '100%',
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
});

export const ProgressIndeterminate = () => {
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 20);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container>
      <Image src="/assets/icon.png" alt="logo" width="64"  height="64" variant='centered'/>
            
      <ProgressRoot value={0}>
        <ProgressIndicator style={{ transform: `translateX(-${100 - progress}%)` }} />
      </ProgressRoot>
    </Container>
  );
};