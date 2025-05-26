import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import Phrazlesgamesection from './Phrazlegamesection';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginModal from './Modals/LoginModal';
import PhrazlesModal from './Modals/PhrazleScoreModal';

function GamesLayout() {
  const baseURL = import.meta.env.VITE_BASE_URL;
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

  const handleShow = async (event) => {
    event.preventDefault();
    if (!loginUsername || !loginUserEmail) {
      setShowLoginPrompt(true);
      return;
    }
    setShowForm(true);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setShowForm(false);
  
    if (typeof updateStatsChart === 'function') {
      updateStatsChart();
    }
  
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = new Date();

    // Get current time in ISO format (without 'Z' for UTC)
    const createdAt = localDate.toISOString().slice(0, -1);  // "2024-12-02T10:10:29.476"

    // Get time zone offset in minutes
    const offsetMinutes = localDate.getTimezoneOffset();  // Offset in minutes (positive for behind UTC, negative for ahead)
    const offsetSign = offsetMinutes > 0 ? '-' : '+';  // Determine if it's ahead or behind UTC
    const offsetHours = String(Math.abs(offsetMinutes) / 60).padStart(2, '0');  // Convert minutes to hours and format
    const offsetMinutesStr = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');  // Get the remaining minutes and format

    // Format the offset in +05:30 or -05:30 format
    const offsetFormatted = `${offsetSign}${offsetHours}:${offsetMinutesStr}`;

    // Now adjust the time by adding the time zone offset (this does not affect UTC, it gives the correct local time)
    const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000); // Adjust time by the offset in milliseconds

    // Get the adjusted time in 24-hour format, e.g., "2024-12-02T15:10:29.476"
    const adjustedCreatedAt = adjustedDate.toISOString().slice(0, -1);  // "2024-12-02T15:10:29.476" (24-hour format)

    // console.log(adjustedCreatedAt);  // Output: Local time in 24-hour format (without 'Z')
  
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
      try {
        const res = await Axios.post(`${baseURL}/games/phrazle/create-score.php`, phrazleObject);
        // console.log(res.data.status);
        if (res.data.status === 'success') {
          if (typeof updateStatsChart === 'function') {
            updateStatsChart();
          }
          // Fetch current statistics and update
          const currentStats = await Axios.get(`${baseURL}/games/phrazle/create-statistics.php/${loginUserEmail}`);
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
          navigate('/phrazlestats');
         
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        toast.error(err.res?.data?.message || 'An unexpected error occurred.');
      }
    }
  };
  const updateTotalGamesPlayed = async (TotalGameObject) => {
    // console.log(TotalGameObject);
      try {
          await Axios.post(`${baseURL}/games/phrazle/update-statistics.php`, TotalGameObject);
      } catch (err) {
          toast.error('Failed to update total games played');
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
          <Phrazlesgamesection />
        </Row>
        <Row className="justify-content-center align-items-center">
          <Col md={6} className="py-5">
            <div>
              <p>Click the “Play” button to go to the Phrazles website and play. Then:</p>
              <ol>
                <li><strong>PLAY:</strong> Play Phrazle</li>
                <li><strong>COPY:</strong> Click SHARE, then COPY to copy your Phrazles result</li>
                <li><strong>PASTE:</strong> Navigate back to WordGAMLE.com to paste your Phrazle result</li>
              </ol>
              <p>Note that Phrazle resets twice / day – at Noon and Midnight.</p>
              <Row className="d-flex justify-content-between align-items-center">
                <Col md={8} xs={8}>
                  <p className="bottom-message">*For anyone who has already played and has the result copied, click the “Enter Result” button to enter today’s game result.</p>
                </Col>
                <Col md={4} xs={4}>
                  <Button className="phrazle-btn bottom-btn" onClick={handleShow}>
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

        <PhrazlesModal
          showForm={showForm}
          handleFormClose={handleFormClose}
          onSubmit={onSubmit}
          score={score}
          setScore={setScore}
          loginUsername={loginUsername}
        />
      </Container>
    </>
  );
}

export default GamesLayout;
