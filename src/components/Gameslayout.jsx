import React, { useState, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Wordlegamesection from './Games/Wordle/Wordlegamesection';

function Gameslayout() {
  // Create a state variable for userAuthData
  const [userData, setUserData] = useState(() => {
    // Initialize the state from localStorage (to prevent undefined on initial load)
    const userAuthData = JSON.parse(localStorage.getItem('auth'));
    return userAuthData || {};
  });

  // Use useEffect to listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const userAuthData = JSON.parse(localStorage.getItem('auth'));
      setUserData(userAuthData);
    };

    // Listen for the 'storage' event which is triggered when localStorage is updated
    window.addEventListener('storage', handleStorageChange);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // If userData is not available, prevent rendering null or undefined values
  if (!userData || !userData.username) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Row className="justify-content-center align-items-center">
        <Col className="text-center py-3">
          <h2>{"Welcome " + userData.username + "!"}</h2>
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
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Gameslayout;
