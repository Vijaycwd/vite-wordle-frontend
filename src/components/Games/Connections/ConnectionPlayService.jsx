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
  const [guessDistribution, setGuessDistribution] = useState([0, 0, 0, 0, 0]);
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

const splitIntoRows = (inputString, rowLength) => {
  const rows = [];
  const charArray = Array.from(inputString);
  for (let i = 0; i < charArray.length; i += rowLength) {
      rows.push(charArray.slice(i, i + rowLength).join(''));
  }
  return rows;
};

const determineAttempts = (score) => {
  const value = score.replace(/[a-zA-Z0-9,#/\\]/g, "");
  const removespace = value.replace(/\s+/g, "");
  const connectionsScore = splitIntoRows(removespace, 4);

  let successGroups = new Set(); // Track unique winning patterns
  let mistakeCount = 0; // Count rows that don't qualify as successful

  for (let i = 0; i < connectionsScore.length; i++) {
    const row = connectionsScore[i].trim();

    // Add successful groups to the set
    if (row === "🟨🟨🟨🟨" || row === "🟩🟩🟩🟩" || row === "🟪🟪🟪🟪" || row === "🟦🟦🟦🟦") {
      successGroups.add(row);
    } else {
      mistakeCount++; // Increment mistake count for invalid rows
    }
  }

  // A win occurs if all 4 distinct groups are completed
  const isWin = successGroups.size === 4;

  return {
    isWin,
    mistakeCount,
  };
};



const onSubmit = async (event) => {
  event.preventDefault();
  
  if (typeof updateStatsChart === "function") {
    updateStatsChart();
  }
  setShowForm(false);

  const { isWin, mistakeCount } = determineAttempts(score);

  let updatedDistribution = [...guessDistribution];
  if (isWin) {
    if (mistakeCount >= 0 && mistakeCount < updatedDistribution.length) {
      updatedDistribution[mistakeCount] += 1; // Update distribution for wins
    }
    setGuessDistribution(updatedDistribution);
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


  const scoreObject = {
    username: loginUsername,
    useremail: loginUserEmail,
    connectionscore: score,
    gamleScore: mistakeCount,
    createdAt: adjustedCreatedAt,
    currentUserTime: adjustedCreatedAt,
    lastgameisWin: isWin,
    guessDistribution: updatedDistribution,
    handleHighlight: mistakeCount,
    timeZone,
  };
 console.log(scoreObject);
  try {
    const res = await Axios.post(
      "https://coralwebdesigns.com/college/wordgamle/games/connections/create-score.php",
      scoreObject
    );

    if (res.data.status === "success") {
      if (typeof updateStatsChart === "function") {
        updateStatsChart();
      }

      const newTotalGamesPlayed = (res.data.totalGamesPlayed || 0) + 1;
      const newTotalWinGames = isWin
        ? (res.data.totalWinGames || 0) + 1
        : res.data.totalWinGames || 0;

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
        lastgameisWin: isWin,
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
        guessDistribution: updatedDistribution,
        handleHighlight: mistakeCount,
        updatedDate: adjustedCreatedAt,
      };

      await updateTotalGamesPlayed(TotalGameObject);
      setScore("");
      navigate("/connectionstats");
      toast.success(res.data.message, { position: "top-center" });
    } else {
      toast.error(res.data.message, { position: "top-center" });
    }
  } catch (err) {
    toast.error(
      err.response?.data?.message || "An unexpected error occurred.",
      { position: "top-center" }
    );
  }
};
  const updateTotalGamesPlayed = async (TotalGameObject) => {
    console.log(TotalGameObject);
    try {
      const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/connections/update-statistics.php', TotalGameObject);
      console.log(res);
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
