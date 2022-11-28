import { Navbar } from '@components';
import { User } from 'next-auth';
import React from 'react';

interface INavar { children: React.ReactNode, user: User, signOut: any }

const Layout: React.FC<INavar> = ({children, user, signOut}) => {


  return (
    <>
      <Navbar user={user} signOut={signOut}/>
      {children}
    </>
  )
}



export default Layout;