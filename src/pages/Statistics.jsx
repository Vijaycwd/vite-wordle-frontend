import React from 'react';
import Gamebuttons from '../components/Gamebuttons';
import { UserProvider } from '../constant/UserContext';
function Statistics() {
  return (
    <>
      <UserProvider>
        <Gamebuttons/>
      </UserProvider>
        
    </>
    
  )
}

export default Statistics