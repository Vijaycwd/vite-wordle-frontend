
import './App.css';
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
import Quordlegame from './components/Games/Quordle/GameLayout';
import Wordlestats from './components/Games/Wordle/Wordlestats';
import ConnectionStat from './components/Games/Connections/ConnectionStat';
import PhrazleStat from './components/Games/Phrazle/PhrazleStat';
import QuordleStat from './components/Games/Quordle/QuordleStat';
import GamesStat from './components/Games/GamesStat';
import Groups from './pages/Groups';
import Grouppage from './pages/Grouppage';
import GroupInvites from './pages/GroupInvites';
import GroupInfo from './pages/GroupInfo';
import GroupStats from './pages/GroupStats';
import GroupStatsPage from './pages/GroupStatsPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminText from './pages/AdminText';
import AdminRoute from './auth/AdminRoute';
import UsersList from './pages/UsersList';
import GamleIntro from './pages/GamleIntro';
import FAQPage from './pages/FAQPage';
// import Games from './pages/Games';

function App() {
  return (
    <Layout>
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route exact path="/:group_id" element={<Home/>} />
        <Route exact path="/gamleintro" element={<GamleIntro />} />
        <Route exact path="/faq" element={<FAQPage />} />
        <Route exact path="/login" element={<Userlogin />} />
        <Route exact path="/register" element={<Registerform />} />
        <Route path="/register/:group_id" element={<Registerform />} />
        <Route exact path="*" element={<NotFound/>} />
        {/* <Route exact path='/games' element={<Games/>}/> */}
        <Route exact path='/wordle' element={<Statistics/>}/>
        <Route exact path= '/connections' element={<Connectionsgame/>}/>
        <Route exact path= '/phrazle' element={<Phrazlegame/>}/>
        {/* <Route exact path='/quordle' element={<Quordlegame/>}/> */}
        <Route exact path="/reset-password" element={<Resetpwd />} />
        <Route exact path="/reset-password/:id/:token" element={<Resetpwdform />} />
        <Route  path='/' element={<ProtectedRouter/>}>
          <Route element={<AdminRoute />}>
            <Route exact path="/admin-text" element={<AdminText />} />
            <Route exact path="/users-list" element={<UsersList />} />
          </Route>
          <Route exact path= '/groups' element={<Groups/>}/>
          <Route exact path = '/group-invites' element = {<GroupInvites/>}/>
          <Route exact path="/group-info/:id" element={<GroupInfo/>} />
          <Route path="/group/:id/stats" element={<GroupStats/>}/>
          <Route path="/group/:id" element={<Grouppage/>}/>
          <Route exact path="/group/:id/stats/:game" element={<GroupStatsPage/>} />
          <Route exact path= '/gamesstat' element={<GamesStat/>}/>
          <Route exact path= '/wordlestats' element={<Wordlestats/>}/>
          <Route exact path= '/connectionstats' element={<ConnectionStat/>}/>
          <Route exact path= '/phrazlestats' element={<PhrazleStat/>}/>
          {/* <Route exact path= '/quordlestats' element={<QuordleStat/>}/> */}
          <Route exact path= '/edit-profile' element={<UserProfile/>}/>
        </Route>
      </Routes>
    <ToastContainer position="top-right" autoClose={1000}/>
    </Layout>
    
  );
}

export default App;
