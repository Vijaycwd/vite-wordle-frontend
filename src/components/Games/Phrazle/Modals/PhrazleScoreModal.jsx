import React, { useState, useEffect,  useRef } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { DateTime, Duration } from 'luxon';

const PhrazleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {
  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState();
  
  const calculateGameNumber = () => {
    // Start date: Feb 2, 2024 at 12:00 AM LOCAL TIME
    const firstGameDate = new Date(2024, 1, 2, 0, 0, 0); // Month is 0-indexed
  
    const now = new Date();
    console.log(now);
    const diffMs = now.getTime() - firstGameDate.getTime();
    const halfDayMs = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  
    return Math.floor(diffMs / halfDayMs) + 1;
  };
  
  useEffect(() => {
    const updateGame = () => {
      setGameNumber(calculateGameNumber());
  
      const now = new Date();
      const nextReset = new Date(now);
  
      if (now.getHours() < 12) {
        nextReset.setHours(12, 0, 0, 0); // Today at 12 PM
      } else {
        nextReset.setDate(now.getDate() + 1);
        nextReset.setHours(0, 0, 0, 0); // Tomorrow at 12 AM
      }
  
      const timeout = nextReset.getTime() - now.getTime();
      setTimeout(updateGame, timeout);
    };
  
    updateGame();
  }, []);
  
    console.log(gameNumber);
    const handlePaste = (event) => {
        const pastedData = event.clipboardData.getData('Text');
        const phrazleTextExists = pastedData.includes('Phrazle');
        const gamenumberExists = pastedData.includes(gameNumber.toLocaleString());
    
        if (!phrazleTextExists) {
          toast.error('This is not a Phrazle game!', { position: 'top-center' });
        } else if (!gamenumberExists) {
          toast.error('This is not today\'s game result!', { position: 'top-center' });
        } else {
          setIsPasted(true); // Mark that the data has been pasted
          setScore(pastedData); // Set the pasted value to the score
        }
    
        event.preventDefault(); // Prevent the default paste action
      };

  // Prevent changes to the pasted data
  const handleChange = (event) => {
    if (isPasted) {
      event.preventDefault(); // If data is already pasted, prevent any changes
    } else {
      setScore(event.target.value); // Allow normal changes until paste
    }
  };

  return (
    <Modal show={showForm} onHide={handleFormClose}>
      <Modal.Header closeButton>
      <p>Game No: {gameNumber}</p>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Enter Name" value={loginUsername} readOnly />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicScore">
            <Form.Label>Paste Result</Form.Label>
            <FloatingLabel controlId="floatingTextarea2" label="">
              <Form.Control
                as="textarea"
                value={score}
                onChange={handleChange} // Handle change to prevent editing
                onPaste={handlePaste} // Handle paste
                style={{ height: '100px' }}
              />
            </FloatingLabel>
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleFormClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PhrazleScoreModal;
