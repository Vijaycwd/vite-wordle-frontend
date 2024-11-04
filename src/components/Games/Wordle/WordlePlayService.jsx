import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginModal from './Modals/LoginModal';
import WordleModal from './Modals/WordleScoreModal';

function WordlePlayService({ updateStatsChart }) {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
    const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;

    const [showForm, setShowForm] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [score, setScore] = useState('');
    const [guessDistribution, setGuessDistribution] = useState([0, 0, 0, 0, 0, 0]);
    const [gameIsWin, setGameIsWin] = useState(false);

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
        if (typeof updateStatsChart === 'function') {
            updateStatsChart();
        }
        setShowForm(false);
  
        const currentTime = new Date().toISOString();
        const createdAt = new Date().toISOString();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
        const wordleScore = score.replace(/[🟩🟨⬜]/g, "");
        const match = wordleScore.match(/(\d+|X)\/(\d+)/);
  
        if (match) {
            const guessesUsed = parseInt(match[1], 10);
            const totalGuesses = parseInt(match[2], 10);
            const isWin = guessesUsed <= totalGuesses;
  
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
                createdAt,
                currentUserTime: currentTime,
                timeZone
            };
  
            try {
                const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/wordle/create-score.php', wordleObject);
                console.log(res.data.status);
                if (res.data.status === 'success') {
                    if (typeof updateStatsChart === 'function') {
                        updateStatsChart();
                    }
                    const currentStats = await Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/wordle/create-statistics.php/${loginUserEmail}`);
                    const currentStreak = currentStats.data.currentStreak || 0;
                    const streak = isWin ? currentStreak + 1 : 0;
                    console.log(wordleScore);
                    console.log(updatedGuessDistribution);
                    const TotalGameObject = {
                        username: loginUsername,
                        useremail: loginUserEmail,
                        totalWinGames: isWin ? (currentStats.data.totalWinGames || 0) + 1 : currentStats.data.totalWinGames || 0,
                        lastgameisWin: isWin,
                        currentStreak: streak,
                        guessDistribution: updatedGuessDistribution,
                    };
                    
                    await updateTotalGamesPlayed(TotalGameObject);
                    setScore('');
                    navigate('/wordlestats');
                }
            } catch (err) {
                toast.error(err.response?.data?.message || 'An unexpected error occurred.', { position: "top-center" });
            }
        }
    };
   
  
    const updateTotalGamesPlayed = async (TotalGameObject) => {
      console.log(TotalGameObject);
        try {
            await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/wordle/update-statistics.php', TotalGameObject);
        } catch (err) {
            toast.error('Failed to update total games played', { position: "top-center" });
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

            <ToastContainer />
        </>
    );
}

export default WordlePlayService;
