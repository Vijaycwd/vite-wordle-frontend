import React from 'react';
import Header from '../components/Headerbar';

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <main className='my-3'>
        {children}
      </main>
    </div>
  );
};

export default Layout;