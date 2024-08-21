
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
import Wordlestats from './components/Games/Wordle/Wordlestats';

function App() {
  return (
    <Layout>
      <Routes>
        <Route  path="/" element={<Userlogin />} />
        <Route  path="/login" element={<Userlogin />} />
        <Route  path="/register" element={<Registerform />} />
        <Route  path="*" element={<NotFound/>} />
        <Route  path='/' element={<ProtectedRouter/>}>
          <Route  path='/dashboard' element={<Dashboard/>}/>
          <Route  path='/wordle' element={<Statistics/>}/>
          <Route  path= '/wordlestats' element={<Wordlestats/>}/>
        </Route>
      </Routes>
    </Layout>
    
  );
}

export default App;
