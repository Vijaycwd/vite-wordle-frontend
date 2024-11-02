import React, { useState } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import Connectionsgamesection from './Connctiongamesection';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginModal from './Modals/LoginModal';
import WordleModal from './Modals/ConnectionsScoreModal';

function GamesLayout() {
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
  const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;
  console.log(USER_AUTH_DATA);
  

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
          toast.error(res.data.message, { position: "top-center" });
        }
      }
      catch (err) {
        toast.error(err.response?.data?.message || 'An unexpected error occurred.', { position: "top-center" });
      }
  };

  const updateTotalGamesPlayed = async (TotalGameObject) => {
      try {
          await Axios.post('http://localhost:5001/wordle-game-stats/update', TotalGameObject);
      } catch (err) {
          toast.error('Failed to update total games played', { position: "top-center" });
      }
  };
  console.log(USER_AUTH_DATA.username);
  return (
    <>
    <Container>
      <Row className="justify-content-center align-items-center">
        <Col className="text-center py-3">
          {USER_AUTH_DATA.username ? <h2>{"Welcome " + USER_AUTH_DATA.username + "!"}</h2> : <h2>{"Welcome Guest!"}</h2>}
        </Col>
      </Row>
      <Row className="justify-content-center align-items-center">
        <Connectionsgamesection/>
      </Row>
      <Row className="justify-content-center align-items-center">
        <Col md={6} className="py-5">
          <div>
            <p>Click the “Play” button to go to the Wordle website and play. Then:</p>
            <ol>
              <li><strong>PLAY:</strong> Play Wordle</li>
              <li><strong>COPY:</strong> Click SHARE, then COPY to copy your Wordle result</li>
              <li><strong>PASTE:</strong> Navigate back to WordGAMLE.com to paste your Wordle result</li>
            </ol>
            <Row className="d-flex justify-content-between align-items-center">
              <Col md={8} xs={8}>
                <p className="bottom-message">*For anyone who has already played and has the result copied, click the “Enter Result” button to enter today’s game result.</p>
              </Col>
              <Col md={4} xs={4}>
                <Button className="wordle-btn bottom-btn" onClick={handleShow}>
                  Enter Result
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Login Prompt Modal */}
      <LoginModal
        showLoginPrompt={showLoginPrompt}
        handleLoginPromptClose={handleLoginPromptClose}
      />

      {/* Score Submission Modal */}
      <WordleModal
        showForm={showForm}
        handleFormClose={handleFormClose}
        onSubmit={onSubmit}
        score={score}
        setScore={setScore}
        loginUsername={loginUsername}
      />
    </Container>
    <ToastContainer/>
    </>
  );
}

export default GamesLayout;
