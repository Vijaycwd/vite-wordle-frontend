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
  
        const scoreObject = {
            username: loginUsername,
            useremail: loginUserEmail,
            connectionscore: score,
            createdAt,
            currentUserTime: currentTime,
            timeZone
        };
        console.log(scoreObject);
        try {
          const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/connections/create-score.php', scoreObject);
          if (res.data.status === "success") {
            setScore('');
            console.log(res.data.message);
            toast.success(res.data.message, { position: "top-center" });
          }
          else{
            setScore('');
            toast.error(res.data.message, { position: "top-center" });
          }
        }
        catch (err) {
          toast.error(err.response?.data?.message || 'An unexpected error occurred.', { position: "top-center" });
        }
    };

    const updateTotalGamesPlayed = async (TotalGameObject) => {
        try {
            await Axios.post('https://wordle-server-nta6.onrender.com/wordle-game-stats/update', TotalGameObject);
        } catch (err) {
            toast.error('Failed to update total games played', { position: "top-center" });
        }
    };

    return (
        <>
            <div className="my-3">
                <Button className="wordle-btn px-5" onClick={() => handleShow('https://www.nytimes.com/games/connections')}>
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
