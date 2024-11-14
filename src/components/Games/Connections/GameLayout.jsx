import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import Connectionsgamesection from './Connctiongamesection';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginModal from './Modals/LoginModal';
import ConnectionsModal from './Modals/ConnectionsScoreModal';

function GamesLayout() {
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
  const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;
  
  const [showForm, setShowForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [score, setScore] = useState('');
  const [guessDistribution, setGuessDistribution] = useState([0, 0, 0, 0]);
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

  const handleShow = async (event) => {
    event.preventDefault();
    if (!loginUsername || !loginUserEmail) {
      setShowLoginPrompt(true);
      return;
    }
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
    const removespace = value.replace(/\s+/g, '');
    const connectionsScore = splitIntoRows(removespace, 4);
    let attempts = 0;
  
    // Loop through the rows and check for the specified winning pattern
    for (let i = 0; i < connectionsScore.length; i++) {
      const row = connectionsScore[i].trim();
  
      // Check if the row is one of the predefined complete patterns
      if (row === '🟨🟨🟨🟨' || row === '🟩🟩🟩🟩' || row === '🟪🟪🟪🟪' || row === '🟦🟦🟦🟦') {
        attempts = i + 1; // Set attempts to the row number (starting from 1)
        break; // Stop once a complete group is found
      }
    }
  
    // If no complete row is found, return total number of rows as attempts
    return attempts || connectionsScore.length;
  };
  
    // Function to calculate and update the guess distribution for Connections game
  
    const onSubmit = async (event) => {
      event.preventDefault();
      if (typeof updateStatsChart === 'function') {
        updateStatsChart();
      }
      setShowForm(false);
    
      const attempts = determineAttempts(score); // Calculate the number of attempts to first win
      const isWin = attempts > 0; // If attempts > 0, it means there's at least one winning row
    
      // Update guessDistribution if there's a win
      let updatedDistribution = [...guessDistribution]; // Copy current distribution
      
      if (isWin) {
        console.log('You Win!');
        console.log('Attempts:', attempts);
    
        if (attempts >= 1 && attempts <= 4) { // Ensure attempts is within range (1 to 4)
          updatedDistribution[attempts - 1] += 1; // Increment the count at the correct index
        }
    
        console.log('After update:', updatedDistribution);
        setGuessDistribution(updatedDistribution);
      }
    
      const currentTime = new Date().toISOString();
      const createdAt = new Date().toISOString();
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
      // Use `updatedDistribution` here instead of `guessDistribution`
      const scoreObject = {
        username: loginUsername,
        useremail: loginUserEmail,
        connectionscore: score,
        createdAt,
        currentUserTime: currentTime,
        lastgameisWin: isWin,
        guessDistribution: updatedDistribution, // Updated value
        handleHighlight: attempts,
        timeZone,
      };
    
      try {
        const res = await Axios.post(
          'https://coralwebdesigns.com/college/wordgamle/games/connections/create-score.php',
          scoreObject
        );
        if (res.data.status === 'success') {
          if (typeof updateStatsChart === 'function') {
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
            guessDistribution: updatedDistribution, // Use updated distribution here as well
            handleHighlight:attempts
          };
    
          await updateTotalGamesPlayed(TotalGameObject);
          setScore('');
          navigate('/connectionstats');
          toast.success(res.data.message, { position: "top-center" });
        } else {
          toast.error(res.data.message, { position: "top-center" });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'An unexpected error occurred.', {
          position: "top-center",
        });
      }
    };
    
  const updateTotalGamesPlayed = async (TotalGameObject) => {
    console.log(TotalGameObject);
    try {
      const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/connections/update-statistics.php', TotalGameObject);

    } catch (err) {
      toast.error('Failed to update total games played', { position: "top-center" });
    }
  };

  return (
    <>
      <Container>
        <Row className="justify-content-center align-items-center">
          <Col className="text-center py-3">
            {USER_AUTH_DATA.username ? <h2>{"Welcome " + USER_AUTH_DATA.username + "!"}</h2> : <h2>{"Welcome Guest!"}</h2>}
          </Col>
        </Row>
        <Row className="justify-content-center align-items-center">
          <Connectionsgamesection />
        </Row>
        <Row className="justify-content-center align-items-center">
          <Col md={6} className="py-5">
            <div>
              <p>Click the “Play” button to go to the Connections website and play. Then:</p>
              <ol>
                <li><strong>PLAY:</strong> Play Connections</li>
                <li><strong>COPY:</strong> Click SHARE, then COPY to copy your Connections result</li>
                <li><strong>PASTE:</strong> Navigate back to Connections.com to paste your Connections result</li>
              </ol>
              <Row className="d-flex justify-content-between align-items-center">
                <Col md={8} xs={8}>
                  <p className="bottom-message">*For anyone who has already played and has the result copied, click the “Enter Result” button to enter today’s game result.</p>
                </Col>
                <Col md={4} xs={4}>
                  <Button className="connections-btn bottom-btn" onClick={handleShow}>
                    Enter Result
                  </Button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        <LoginModal
          showLoginPrompt={showLoginPrompt}
          handleLoginPromptClose={handleLoginPromptClose}
        />

        <ConnectionsModal
          showForm={showForm}
          handleFormClose={handleFormClose}
          onSubmit={onSubmit}
          score={score}
          setScore={setScore}
          loginUsername={loginUsername}
        />
      </Container>
      <ToastContainer />
    </>
  );
}

export default GamesLayout;
