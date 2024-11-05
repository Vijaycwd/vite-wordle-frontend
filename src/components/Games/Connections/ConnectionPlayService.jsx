import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginModal from './Modals/LoginModal';
import ConnectionsModal from './Modals/ConnectionsScoreModal';

function ConnectionPlayService({ updateStatsChart }) {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
  const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;
  
  const [showForm, setShowForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [score, setScore] = useState('');
  const [guessDistribution, setGuessDistribution] = useState([0, 0, 0, 0, 0, 0]);
  const [gameIsWin, setGameIsWin] = useState(false);
  
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [totalWinGames, setTotalWinGames] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  const navigate = useNavigate();

  const handleFormClose = () => {
    setShowForm(false);
    setScore('');
  };

  const handleLoginPromptClose = () => {
    setShowLoginPrompt(false);
  };

  const handleShow = (url) => {
    if (!loginUsername || !loginUserEmail) {
        setShowLoginPrompt(true);
        return;
    }
    window.open(url, '_blank');
    setShowForm(true);
};

  const determineWinStatus = (pastedScore) => {
    // Example logic to determine if the game is won based on the pasted result
    // Customize this logic as per your actual game outcome structure
    const lines = pastedScore.split('\n');
    return lines.some(line => line.includes('🟩🟩🟩🟩')); // Checks for a win pattern
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (typeof updateStatsChart === 'function') {
      updateStatsChart();
    }
    setShowForm(false);
    const isWin = determineWinStatus(score);
    setGameIsWin(isWin); // Update state for future use if needed
    // console.log(isWin);
  
    const currentTime = new Date().toISOString();
    const createdAt = new Date().toISOString();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
    const scoreObject = {
      username: loginUsername,
      useremail: loginUserEmail,
      connectionscore: score,
      createdAt,
      currentUserTime: currentTime,
      lastgameisWin: isWin, // Use `isWin` directly here instead of `gameIsWin`
      timeZone
    };
    console.log(scoreObject);
  
    try {
      const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/connections/create-score.php', scoreObject);
      console.log(res.data.status);
      if (res.data.status === 'success') {
        if (typeof updateStatsChart === 'function') {
            updateStatsChart();
        }
        const newTotalGamesPlayed = (res.data.totalGamesPlayed || 0) + 1;
        const newTotalWinGames = isWin ? (res.data.totalWinGames || 0) + 1 : (res.data.totalWinGames || 0);
  
        setTotalGamesPlayed(newTotalGamesPlayed);
        setTotalWinGames(newTotalWinGames);
  
        const newCurrentStreak = isWin ? currentStreak + 1 : 0;
        const newMaxStreak = Math.max(currentStreak + (isWin ? 1 : 0), maxStreak);
  
        setCurrentStreak(newCurrentStreak);
        setMaxStreak(newMaxStreak);
  
        const TotalGameObject = {
          username: loginUsername,
          useremail: loginUserEmail,
          totalWinGames: newTotalWinGames,
          totalGamesPlayed: newTotalGamesPlayed,
          lastgameisWin: isWin, // Use `isWin` directly here
          currentStreak: newCurrentStreak,
          maxStreak: newMaxStreak,
          guessDistribution: guessDistribution
        };

        console.log(TotalGameObject);
        await updateTotalGamesPlayed(TotalGameObject);
        setScore('');
        navigate('/connectionstats');
      }
      else{
        toast.error(res.data.message, { position: "top-center" });
      }
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'An unexpected error occurred.', { position: "top-center" });
    }
  };
  

  const updateTotalGamesPlayed = async (TotalGameObject) => {
    console.log(TotalGameObject);
    try {
      const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/connections/update-statistics.php', TotalGameObject);
      console.log(res.data);

    } catch (err) {
      toast.error('Failed to update total games played', { position: "top-center" });
    }
  };

    return (
        <>
            <div className="my-3">
                <Button className="connections-btn px-5" onClick={() => handleShow('https://www.nytimes.com/games/connections')}>
                    Play
                </Button>
            </div>

            <LoginModal showLoginPrompt={showLoginPrompt} handleLoginPromptClose={handleLoginPromptClose} />

            <ConnectionsModal
                showForm={showForm}
                handleFormClose={handleFormClose}
                onSubmit={onSubmit}
                score={score}
                setScore={setScore}
                loginUsername={loginUsername}
            />

            <ToastContainer />
        </>
    );
}

export default ConnectionPlayService;
