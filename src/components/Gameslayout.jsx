import React, { useState } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import Wordlegamesection from './Games/Wordle/Wordlegamesection';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoginModal from './Games/Wordle/Modals/LoginModal';
import WordleModal from './Games/Wordle/Modals/WordleScoreModal';

function Gameslayout() {
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {}; // Fallback if auth is missing
    const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;
  // const { username: loginUsername, email: loginUserEmail } = userData;

  const [showForm, setShowForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [score, setScore] = useState('');


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
      setShowLoginPrompt(true); // Show login prompt if user is not logged in
      return; // Prevent opening the URL if not logged in
    }
    window.open(url, '_blank');
    setShowForm(true);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    // Your form submission logic
  };
  console.log(USER_AUTH_DATA);
  return (
    <Container>
      <Row className="justify-content-center align-items-center">
        <Col className="text-center py-3">
          {USER_AUTH_DATA.length > 0 ? <h2>{"Welcome " + USER_AUTH_DATA.username + "!"}</h2> : <h2>{"Welcome Guest!"}</h2>}
        </Col>
      </Row>
      <Row className="justify-content-center align-items-center">
        <Wordlegamesection />
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
            <Row className="d-flex justify-content-center">
              <Col md={8}>
                <p className="message">*For anyone who has already played and has the result copied, click the “Enter Result” button to enter today’s game result.</p>
              </Col>
              <Col md={4}>
                <Button className="wordle-btn px-5" onClick={() => handleShow('https://www.nytimes.com/games/wordle/index.html')}>
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
  );
}

export default Gameslayout;
