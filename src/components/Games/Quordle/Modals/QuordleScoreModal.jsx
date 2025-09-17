import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';

const QuordleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {
  
  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState(null);

  const calculateGameNumber = () => {
  const firstGameDate = Date.UTC(2022, 0, 24); // Quordle Day 1
  const now = new Date();

  // Today’s UTC midnight
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  // Difference in days
  const diffInDays = Math.floor((todayUTC - firstGameDate) / (24 * 60 * 60 * 1000));

  return diffInDays; // Game # starts at 1
};

useEffect(() => {
    setGameNumber(calculateGameNumber());

    // Check every minute and update exactly at 12:00 AM (Midnight)
    const interval = setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            setGameNumber(calculateGameNumber());
        }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
}, []);


  // Function to validate Wordle score
  // const validateScore = (data) => {
  //   const wordleExists = data.includes('Wordle'); // Check if 'Wordle' is present
  //   const numberExists = gameNumber.toLocaleString();
  //   return wordleExists && numberExists;
  // };

  // This function is triggered when a paste happens
  const handlePaste = (event) => {
    const pastedData = event.clipboardData.getData('Text');
    const quordleTextExists = pastedData.includes('Quordle');
    const gamenumberExists = pastedData.includes(String(gameNumber)); // FIXED
    const todaysGameNumber = calculateGameNumber(); // Assuming this is used elsewhere

    if (!quordleTextExists) {
      toast.error('This is not a Quordle game score!', { position: 'top-center' });
    } else if (!gamenumberExists) {
      toast.error('This is not today\'s game result!', { position: 'top-center' });
    } else {
      setIsPasted(true);
      setScore(pastedData);
    }

    event.preventDefault();
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

export default QuordleScoreModal;
