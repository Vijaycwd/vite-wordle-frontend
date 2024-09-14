import React from 'react';
import Gameslayout from '../components/Gameslayout';
import { UserProvider } from '../constant/UserContext';
function Statistics() {
  return (
    <>
      <UserProvider>
        <Gameslayout/>
      </UserProvider>
    </>
    
  )
}

export default Statistics