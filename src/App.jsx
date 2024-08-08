
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
import Wordlestats from './pages/Wordlestats';

function App() {
  return (
    <Layout>
      <Routes>
        <Route exact path="/" element={<Userlogin />} />
        <Route exact path="/login" element={<Userlogin />} />
        <Route exact path="/register" element={<Registerform />} />
        <Route path="*" element={<NotFound/>} />
        <Route exact path='/' element={<ProtectedRouter/>}>
          <Route exact path='/dashboard' element={<Dashboard/>}/>
          <Route exact path='/statistics' element={<Statistics/>}/>
          <Route exact path= '/wordlestats' element={<Wordlestats/>}/>
        </Route>
      </Routes>
    </Layout>
    
  );
}

export default App;
