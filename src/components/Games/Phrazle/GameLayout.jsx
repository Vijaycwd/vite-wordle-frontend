import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import Phrazlesgamesection from './Phrazlegamesection';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginModal from './Modals/LoginModal';
import PhrazlesModal from './Modals/PhrazleScoreModal';

function GamesLayout() {
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

  const currentTime = new Date().toISOString();
  const createdAt = new Date().toISOString();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Process the Wordle score and match it against a valid format
  const phrazleScore = score.replace(/[🟩🟨⬜🟪]/g, "");
  const lettersAndNumbersRemoved = phrazleScore.replace(/[a-zA-Z0-9,#.:/\\]/g, "");
  const match = phrazleScore.match(/(\d+|X)\/(\d+)/);
  

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

    // Process the Wordle score to check how many 🟩 symbols (correct guesses) are there
    const isCorrectWord = (row) => {
      return row.split('').every(char => char === '🟩'); // Check if all symbols in the row are 🟩
    };

    // Example: Split score into rows (adjust according to your format)
    const rows = score.split('⬜').map(row => row.trim()); // Adjust for your row separation
    // const correctWordsCount = rows.filter(row => isCorrectWord(row)).length;
    // const phrasle_score = str_replace(['#phrazle', 'https://solitaired.com/phrazle'], '', score);
    const phrazleObject = {
      username: loginUsername,
      useremail: loginUserEmail,
      phrazlescore: phrasle_score,
      isWin,
      createdAt,
      currentUserTime: currentTime,
      timeZone,
    };

    try {
      const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/phrazle/create-score.php', phrazleObject);
      console.log(res.data.status);
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
        };
        
        await updateTotalGamesPlayed(TotalGameObject);
        setScore('');
        navigate('/wordlestats');
        toast.success(res.data.message, { position: "top-center" });
      } else {
        toast.error(res.data.message, { position: "top-center" });
      }
    } catch (err) {
      toast.error(err.res?.data?.message || 'An unexpected error occurred.', { position: "top-center" });
    }
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
                <li><strong>PLAY:</strong> Play Phrazles</li>
                <li><strong>COPY:</strong> Click SHARE, then COPY to copy your Phrazles result</li>
                <li><strong>PASTE:</strong> Navigate back to Phrazles.com to paste your Phrazles result</li>
              </ol>
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
      <ToastContainer />
    </>
  );
}

export default GamesLayout;
