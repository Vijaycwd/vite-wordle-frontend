import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginModal from './Modals/LoginModal';
import WordleModal from './Modals/WordleScoreModal';

function WordlePlayService({ updateStatsChart, groupId, gameName  }) {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
    const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;
    const userId = USER_AUTH_DATA?.id;
    const [showForm, setShowForm] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [score, setScore] = useState('');
    const [guessDistribution, setGuessDistribution] = useState([0, 0, 0, 0, 0, 0]);
    const [gameIsWin, setGameIsWin] = useState(false);
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

    //get latest group intraction
    useEffect(() => {
      const fetchLastGroup = async () => {
        try {
          const response = await Axios.get(
            `${baseURL}/games/wordle/get-last-group.php`,
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
        setShowForm(false);
        if (typeof updateStatsChart === 'function') {
            updateStatsChart();
        }
        setShowForm(false);
        
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
        const localDate = new Date();
    
        // Get time zone offset in minutes
        const offsetMinutes = localDate.getTimezoneOffset();  // Offset in minutes (positive for behind UTC, negative for ahead)

        // Now adjust the time by adding the time zone offset (this does not affect UTC, it gives the correct local time)
        const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000); // Adjust time by the offset in milliseconds
    
        // Get the adjusted time in 24-hour format, e.g., "2024-12-02T15:10:29.476"
        const adjustedCreatedAt = adjustedDate.toISOString().slice(0, -1);  // "2024-12-02T15:10:29.476" (24-hour format)
    
        // console.log(adjustedCreatedAt);  // Output: Local time in 24-hour format (without 'Z')
    
    
    
        const wordleScore = score.replace(/[🟩🟨⬜⬛]/g, "");
        const match = wordleScore.match(/(\d+|X)\/(\d+)/);
        // console.log(match);
    
        if (match) {
            let guessesUsed = match[1] === "X" ? 7 : parseInt(match[1], 10); // Assign 7 for failed attempts ("X")
            const totalGuesses = parseInt(match[2], 10);
            const isWin = match[1] !== "X" && guessesUsed <= totalGuesses;
    
            setGameIsWin(isWin);
            const updatedGuessDistribution = [...guessDistribution];
            if (isWin && guessesUsed <= 6) {
                updatedGuessDistribution[guessesUsed - 1] += 1;
            }
            setGuessDistribution(updatedGuessDistribution);
    
            const wordleObject = {
                username: loginUsername,
                useremail: loginUserEmail,
                wordlescore: score,
                guessDistribution: updatedGuessDistribution,
                isWin,
                gamleScore: guessesUsed,
                createdAt: adjustedCreatedAt,
                currentUserTime: adjustedCreatedAt,
                timeZone,
                groupId,
                gameName,
                userId
            };
            // console.log(wordleObject);
            try {
                const res = await Axios.post(`${baseURL}/games/wordle/create-score.php`, wordleObject);
                // console.log(res.data.status);
                if (res.data.status === 'success') {
                    if (typeof updateStatsChart === 'function') {
                        updateStatsChart();
                    }
                    const currentStats = await Axios.get(`${baseURL}/games/wordle/create-statistics.php/${loginUserEmail}`);
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
                    // console.log(TotalGameObject);
                    await updateTotalGamesPlayed(TotalGameObject);
                    setScore('');
                    const latest_group_id = lastGroup?.group_id;
                    if(latest_group_id){
                    navigate(`/group/${latest_group_id}/stats/wordle`);
                    }
                    else{
                    navigate("/wordlestats");
                    }
                    
                }
                else{
                    toast.error(res.data.message );
                }
            } catch (err) {
                toast.error(err.res?.data?.message || 'An unexpected error occurred.');
            }
        }
    };
    
    const updateTotalGamesPlayed = async (TotalGameObject) => {
        try {
            await Axios.post(`${baseURL}/games/wordle/update-statistics.php`, TotalGameObject);
        } catch (err) {
            toast.error('Failed to update total games played');
        }
    };

    return (
        <>
            <div className="my-3">
                <Button className="wordle-btn px-5" onClick={() => handleShow('https://www.nytimes.com/games/wordle/index.html')}>
                    Play
                </Button>
            </div>

            <LoginModal showLoginPrompt={showLoginPrompt} handleLoginPromptClose={handleLoginPromptClose} />

            <WordleModal
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

export default WordlePlayService;
