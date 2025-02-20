import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';

const WordleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {
  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState(null);

  // Function to calculate today's Wordle game number
  // const calculateGameNumber = () => {
  //   const wordleStartDate = new Date('2021-06-20'); // Wordle's start date
  //   const today = new Date();
  //   console.log(today);
  //   // Calculate the difference in milliseconds
  //   const diffInMs = today - wordleStartDate;

  //   // Convert milliseconds to days (1 day = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
  //   const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  //   // Today's Wordle number is the difference in days + 1 (since the first game is number 1)
  //   return diffInDays + 1;
  // };

  const calculateGameNumber = () => {
    // Corrected Start Date: June 19, 2021, 11:59:59 PM (Local Time)
    const firstGameDate = new Date(2021, 5, 19, 0, 0, 0);

    // Get current local time
    const now = new Date();

    // Calculate the difference in full days
    const diffInDays = Math.floor((now - firstGameDate) / (24 * 60 * 60 * 1000));

    // Game number starts at 1
    const currentGameNumber = diffInDays; // +1 to start from 1 instead of 0

    // console.log("Now Local Time:", now.toString());
    // console.log("Calculated Game Number:", currentGameNumber);

    return currentGameNumber;
};

useEffect(() => {
    setGameNumber(calculateGameNumber());

    // Set an interval to check every minute and update at exactly 12 AM (midnight)
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
    const wordleTextExists = pastedData.includes('Wordle');
    const gamenumberExists = pastedData.includes(gameNumber.toLocaleString());
    console.log(gameNumber.toLocaleString());
    const todaysGameNumber = calculateGameNumber();

    if (!wordleTextExists) {
      toast.error('This is not a Wordle game!', { position: 'top-center' });
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

export default WordleScoreModal;
