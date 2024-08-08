import React from 'react';
import Loginform from '../components/Loginform';
import Headerbar from '../components/Headerbar';
import { UserProvider } from '../constant/UserContext';
function Userlogin() {
   
  return (
    <>
      <UserProvider>
        <Loginform/>
      </UserProvider>
    </>
  )
}

export default Userlogin