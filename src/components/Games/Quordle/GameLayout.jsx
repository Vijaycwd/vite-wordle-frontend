import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import Quordlegamesection from './Quordlegamesection';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginModal from './Modals/LoginModal';
import QuordleScoreModal from './Modals/QuordleScoreModal';

function GamesLayout() {
  const baseURL = import.meta.env.VITE_BASE_URL;
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
    // 1. Keep only rows with tiles
    let matrixLines = score
      .split("\n")
      .map(l => l.trim())
      .filter(l => /(⬛|⬜|🟨|🟩)/.test(l) || l === "");
 
    // 2. Split into groups by blank line
    let groups = [];
    let current = [];
    for (let line of matrixLines) {
      if (line === "") {
        if (current.length) {
          groups.push(current);
          current = [];
        }
      } else {
        current.push(line);
      }
    }
    if (current.length) groups.push(current);
 
    // 3. For each group, split into left/right
    let word1 = groups[0]?.map(r => r.split(" ")[0]) || [];
    let word2 = groups[0]?.map(r => r.split(" ")[1]) || [];
    let word3 = groups[1]?.map(r => r.split(" ")[0]) || [];
    let word4 = groups[1]?.map(r => r.split(" ")[1]) || [];
 
    // 4. Build attemptsBlocks (each row = [w1, w2, w3, w4])
    let maxLen = Math.max(word1.length, word2.length, word3.length, word4.length);
    let attemptsBlocks = [];
    for (let i = 0; i < maxLen; i++) {
      attemptsBlocks.push([
        word1[i] || null,
        word2[i] || null,
        word3[i] || null,
        word4[i] || null
      ]);
    }
 
    // 5. Track solvedAt (first row each word = 🟩🟩🟩🟩🟩)
    let solvedAt = {};
    [word1, word2, word3, word4].forEach((w, idx) => {
      for (let i = 0; i < w.length; i++) {
        if (w[i] === "🟩🟩🟩🟩🟩") {
          solvedAt[idx + 1] = i + 1; // 1-based attempt number
          break;
        }
      }
    });
 
    // 6. Stats
    const solvedWords = Object.keys(solvedAt).length;
    const isWin = solvedWords === 4;
    const attempts = attemptsBlocks.length;
    const winAttempt = isWin ? Math.max(...Object.values(solvedAt)) : null;
 
    // 7. Sum solvedAt values
    const sumSolvedAt = Object.values(solvedAt).reduce((a, b) => a + b, 0);
 
    return {
      isWin,
      solvedAt,
      sumSolvedAt,
      winAttempt,
      attempts
      // solvedWords,
      // sumSolvedAt,
      // attemptsBlocks,
      // word1,
      // word2,
      // word3,
      // word4
    };
};


  
  
  const onSubmit = async (event) => {
    event.preventDefault();
    
    if (typeof updateStatsChart === "function") {
      updateStatsChart();
    }
    setShowForm(false);
    
    const { isWin, attempts, sumSolvedAt } = determineAttempts(score);

    let updatedDistribution = [...guessDistribution];
    if (isWin && attempts !== null && attempts <= updatedDistribution.length) {
      updatedDistribution[attempts - 1] += 1; // update the correct bucket
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
  
    // console.log(adjustedCreatedAt);  // Output: Local time in 24-hour format (without 'Z')
  
  
    const scoreObject = {
      username: loginUsername,
      useremail: loginUserEmail,
      quordlescore: score,
      isWin,
      gamleScore: sumSolvedAt,
      createdAt: adjustedCreatedAt,
      currentUserTime: adjustedCreatedAt,
      lastgameisWin: isWin,
      guessDistribution: updatedDistribution,
      handleHighlight: attempts,
      timeZone,
    };
    // console.log(scoreObject);
    try {
      const res = await Axios.post(
        `${baseURL}/games/quordle/create-score.php`,
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
          handleHighlight: attempts,
          updatedDate: adjustedCreatedAt,
        };
  
        await updateTotalGamesPlayed(TotalGameObject);
        setScore("");
        navigate("/quordlestats");
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
    // console.log(TotalGameObject);
    try {
      const res = await Axios.post(`${baseURL}/games/quordle/update-statistics.php`, TotalGameObject);
      // console.log(res);
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
          <Quordlegamesection />
        </Row>
        <Row className="justify-content-center align-items-center">
          <Col md={6} className="py-5">
            <div>
              <p>Click the “Play” button to go to the Quordle website and play. Then:</p>
              <ol>
                <li><strong>PLAY:</strong> Play Quordle</li>
                <li><strong>COPY:</strong> Click SHARE, then COPY to copy your Quordle result</li>
                <li><strong>PASTE:</strong> Navigate back to WordGAMLE.com to paste your Quordle result</li>
              </ol>
              <Row className="d-flex justify-content-between align-items-center">
                <Col md={8} xs={8}>
                  <p className="bottom-message">*For anyone who has already played and has the result copied, click the “Enter Result” button to enter today’s game result.</p>
                </Col>
                <Col md={4} xs={4}>
                  <Button className="Quordle-btn bottom-btn" onClick={handleShow}>
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

        <QuordleScoreModal
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
