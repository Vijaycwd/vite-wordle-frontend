import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginModal from './Modals/LoginModal';
import ConnectionsModal from './Modals/ConnectionsScoreModal';

function ConnectionPlayService({ updateStatsChart, groupId, gameName }) {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
  const userId = USER_AUTH_DATA?.id;
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
  const [lastGroup, setLastGroup] = useState(null);

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

//get latest group intraction
useEffect(() => {
  const fetchLastGroup = async () => {
    try {
      const response = await Axios.get(
        `${baseURL}/games/connections/get-last-group.php`,
        { params: { user_id: userId } }
      );
      setLastGroup(response.data);
    } catch (error) {
      console.error("Error fetching last group:", error);
    }
  };

  if (userId) {
    fetchLastGroup();
  }
}, [userId]);

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
    groupId:lastGroup?.group_id,
    gameName:"connections",
    userId
  };

  try {
    const res = await Axios.post(
      `${baseURL}/games/connections/create-score.php`,
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
      const latest_group_id = lastGroup?.group_id;
      if(latest_group_id){
        navigate(`/group/${latest_group_id}/stats/connections`);
      }
      else{
        navigate("/connectionstats");
      }
      
    } else {
      toast.error(res.data.message);
    }
  } catch (err) {
    toast.error(
      err.response?.data?.message || "An unexpected error occurred.",
      { position: "top-center" }
    );
  }
};
  const updateTotalGamesPlayed = async (TotalGameObject) => {
    
    try {
      const res = await Axios.post(`${baseURL}/games/connections/update-statistics.php`, TotalGameObject);
     
    } catch (err) {
      toast.error('Failed to update total games played');
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
        </>
    );
}

export default ConnectionPlayService;
