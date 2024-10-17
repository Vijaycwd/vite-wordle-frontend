import React, { useState } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginModal from './Modals/LoginModal';
import ConnectionModal from './Modals/ConnectionsScoreModal';
import Connctiongamesection from './Connctiongamesection';
function GameLayout() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
    const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;
    const [showForm, setShowForm] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [score, setScore] = useState('');

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
    <Container>
      <Row className="justify-content-center align-items-center">
        <Col className="text-center py-3">
          {USER_AUTH_DATA.username ? <h2>{"Welcome " + USER_AUTH_DATA.username + "!"}</h2> : <h2>{"Welcome Guest!"}</h2>}
        </Col>
      </Row>
      <Row className="justify-content-center align-items-center">
        <Connctiongamesection/>
      </Row>
      <Row className="justify-content-center align-items-center">
        <Col md={6} className="py-5">
          <div>
            <p>Click the “Play” button to go to the Connections website and play. Then:</p>
            <ol>
              <li><strong>PLAY:</strong> Play Connections</li>
              <li><strong>COPY:</strong> Click SHARE, then COPY to copy your Connections result</li>
              <li><strong>PASTE:</strong> Navigate back to CONNECTIONS.com to paste your Connections result</li>
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
      <ConnectionModal
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
  )
}

export default GameLayout