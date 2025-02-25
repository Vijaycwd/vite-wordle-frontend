
import './App.css';
import React from 'react';
import { Routes, Route} from 'react-router-dom';
import Layout from './components/Layout';
import Userlogin from './auth/Userlogin';
import Registerform from './auth/Registerform';
import ProtectedRouter from './auth/Protect';
import NotFound from './pages/NotFound';
import Statistics from './pages/Statistics';
import Resetpwd from './auth/Resetpwd';
import Resetpwdform from './auth/Resetpwdform';
import UserProfile from './components/Games/Wordle/UserProfile';
import Home from './pages/Home';
import Connectionsgame from './components/Games/Connections/GameLayout';
import Phrazlegame from './components/Games/Phrazle/GameLayout';
import Wordlestats from './components/Games/Wordle/Wordlestats';
import ConnectionStat from './components/Games/Connections/ConnectionStat';
import PhrazleStat from './components/Games/Phrazle/PhrazleStat';
import GamesStat from './components/Games/GamesStat';
import Groups from './pages/Groups';
import Grouppage from './pages/Grouppage';
import GroupInvites from './pages/GroupInvites';
import GroupInfo from './pages/GroupInfo';
import GroupStats from './pages/GroupStats';
import GroupStatsPage from './pages/GroupStatsPage';


function App() {
  return (
    <Layout>
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route exact path="/login" element={<Userlogin />} />
        <Route exact path="/register" element={<Registerform />} />
        <Route exact path="*" element={<NotFound/>} />
        <Route exact path='/wordle' element={<Statistics/>}/>
        <Route exact path= '/connections' element={<Connectionsgame/>}/>
        <Route exact path= '/phrazle' element={<Phrazlegame/>}/>
        <Route exact path="/reset-password" element={<Resetpwd />} />
        <Route exact path="/reset-password/:id/:token" element={<Resetpwdform />} />
        <Route  path='/' element={<ProtectedRouter/>}>
          <Route exact path= '/groups' element={<Groups/>}/>
          <Route exact path = '/group-invites' element = {<GroupInvites/>}/>
          <Route exact path="/group/:id/:groupName" element={<Grouppage/>}/>
          <Route exact path="/group-info/:id" element={<GroupInfo/>} />
          <Route path="/group/:id/:groupName/stats" element={<GroupStats/>}/>
          <Route path="/group/:id/:groupName" element={<Grouppage/>}/>
          <Route exact path="/group/:id/:groupName/stats/:game" element={<GroupStatsPage/>} />
          <Route exact path= '/gamesstat' element={<GamesStat/>}/>
          <Route exact path= '/wordlestats' element={<Wordlestats/>}/>
          <Route exact path= '/connectionstats' element={<ConnectionStat/>}/>
          <Route exact path= '/phrazlestats' element={<PhrazleStat/>}/>
          <Route exact path= '/edit-profile' element={<UserProfile/>}/>
        </Route>
      </Routes>
    </Layout>
    
  );
}

export default App;
