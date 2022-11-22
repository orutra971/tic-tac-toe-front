import Footer from '@components/Footer/Footer';
import Navbar from '@components/Navbar/Navbar';
import React from 'react';

const Layout: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <style jsx>{`
        footer {
          background: salmon;
        }
      `}</style>
    </>
  )
}

export default Layout;