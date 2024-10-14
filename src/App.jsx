
import './App.css';
import React from 'react';
import { Routes, Route} from 'react-router-dom';
import Layout from './components/Layout';
import Userlogin from './auth/Userlogin';
import Registerform from './auth/Registerform';
import ProtectedRouter from './auth/Protect';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Statistics from './pages/Statistics';
import Resetpwd from './auth/Resetpwd';
import Resetpwdform from './auth/Resetpwdform';
import Wordlestats from './components/Games/Wordle/Wordlestats';
import UserProfile from './components/Games/Wordle/UserProfile';
import Home from './pages/Home';
import Connectionsgame from './components/Games/Connections/Connectionsgame';
import Phrazlegame from './components/Games/Phrazle/Phrazlegame';


function App() {
  return (
    <Layout>
      <Routes>
        <Route  path="/" element={<Home/>} />
        <Route  path="/login" element={<Userlogin />} />
        <Route  path="/register" element={<Registerform />} />
        <Route  path="*" element={<NotFound/>} />
        <Route  path='/wordle' element={<Statistics/>}/>
        <Route  path= '/connections' element={<Connectionsgame/>}/>
        <Route  path= '/phrazle' element={<Phrazlegame/>}/>
        <Route exact path="/reset-password" element={<Resetpwd />} />
        <Route exact path="/reset-password/:id/:token" element={<Resetpwdform />} />
        <Route  path='/' element={<ProtectedRouter/>}>
          <Route  path='/dashboard' element={<Dashboard/>}/>
          <Route  path= '/wordlestats' element={<Wordlestats/>}/>
          <Route  path= '/edit-profile' element={<UserProfile/>}/>
        </Route>
      </Routes>
    </Layout>
    
  );
}

export default App;
