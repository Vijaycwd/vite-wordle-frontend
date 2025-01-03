import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginModal from './Modals/LoginModal';
import PhrazlesModal from './Modals/PhrazleScoreModal';

function PhrazlePlayService({ updateStatsChart }) {
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

const onSubmit = async (event) => {
  event.preventDefault();
  setShowForm(false);

  if (typeof updateStatsChart === 'function') {
    updateStatsChart();
  }

  // Get time zone offset in minutes
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDate = new Date();
  const offsetMinutes = localDate.getTimezoneOffset();  // Offset in minutes (positive for behind UTC, negative for ahead)

  // Now adjust the time by adding the time zone offset (this does not affect UTC, it gives the correct local time)
  const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000); // Adjust time by the offset in milliseconds

  // Get the adjusted time in 24-hour format, e.g., "2024-12-02T15:10:29.476"
  const adjustedCreatedAt = adjustedDate.toISOString().slice(0, -1);  // "2024-12-02T15:10:29.476" (24-hour format)

  console.log(adjustedCreatedAt);  // Output: Local time in 24-hour format (without 'Z')

  // Process the Wordle score and match it against a valid format
  const phrazleScore = score.replace(/[🟩🟨⬜🟪]/g, "");
  const lettersAndNumbersRemoved = phrazleScore.replace(/[a-zA-Z0-9,#.:/\\]/g, "");
  const match = phrazleScore.match(/(\d+|X)\/(\d+)/);
  

  if (match) {
    let guessesUsed = match[1] === "X" ? 7 : parseInt(match[1], 10); // Assign 7 for failed attempts ("X")
    const totalGuesses = parseInt(match[2], 10);
    const isWin = match[1] !== "X" && guessesUsed <= totalGuesses;

    console.group(guessesUsed);
    setGameIsWin(isWin);

    const updatedGuessDistribution = [...guessDistribution];
    if (isWin && guessesUsed <= 6) {
      updatedGuessDistribution[guessesUsed - 1] += 1;
    }
    setGuessDistribution(updatedGuessDistribution);

    const phrazleObject = {
      username: loginUsername,
      useremail: loginUserEmail,
      phrazlescore: score,
      isWin,
      gamleScore:guessesUsed,
      createdAt:adjustedCreatedAt,
      currentUserTime: adjustedCreatedAt,
      timeZone,
    };
    console.log(phrazleObject);
    try {
      const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/phrazle/create-score.php', phrazleObject);
      console.log(res.data);
      if (res.data.status === 'success') {
        if (typeof updateStatsChart === 'function') {
          updateStatsChart();
        }
        // Fetch current statistics and update
        const currentStats = await Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/phrazle/create-statistics.php/${loginUserEmail}`);
        const currentStreak = currentStats.data.currentStreak || 0;
        const streak = isWin ? currentStreak + 1 : 0;
        const TotalGameObject = {
          username: loginUsername,
          useremail: loginUserEmail,
          totalWinGames: isWin ? (currentStats.data.totalWinGames || 0) + 1 : currentStats.data.totalWinGames || 0,
          lastgameisWin: isWin,
          currentStreak: streak,
          guessDistribution: updatedGuessDistribution,
          updatedDate: adjustedCreatedAt
        };
        toast.success(res.data.message, { position: "top-center" });
        await updateTotalGamesPlayed(TotalGameObject);
        setScore('');
        navigate('/phrazlestats');
       
      } else {
        toast.error(res.data.message, { position: "top-center" });
      }
    } catch (err) {
      toast.error(err.res?.data?.message || 'An unexpected error occurred.', { position: "top-center" });
    }
  }
};
const updateTotalGamesPlayed = async (TotalGameObject) => {
  // console.log(TotalGameObject);
    try {
        await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/phrazle/update-statistics.php', TotalGameObject);
    } catch (err) {
        toast.error('Failed to update total games played', { position: "top-center" });
    }
};

    return (
        <>
            <div className="my-3">
                <Button className="phrazle-btn px-5" onClick={() => handleShow('https://solitaired.com/phrazle')}>
                    Play
                </Button>
            </div>

            <LoginModal showLoginPrompt={showLoginPrompt} handleLoginPromptClose={handleLoginPromptClose} />

            <PhrazlesModal
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

export default PhrazlePlayService;
