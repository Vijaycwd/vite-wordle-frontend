import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PhrazleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {
  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState();
    
  const calculateGameNumber = () => {
    // Corrected First Game Date: August 1, 2022, 12 PM UTC
    const firstGameDate = new Date(Date.UTC(2022, 12, 27, 12, 0, 0)); // Aug 1, 2022, 12:00 PM UTC

    // Get current UTC time
    const nowUTC = new Date();

    // Calculate difference in full days from the first game date
    const diffInDays = Math.floor((nowUTC - firstGameDate) / (1000 * 60 * 60 * 24));

    // Get the current UTC hour
    const currentUTCHour = nowUTC.getUTCHours();
    console.log("Now UTC Time:", nowUTC);
    console.log("Current UTC Hour:", currentUTCHour);
    
    // Game number logic: If before 12 PM UTC, it uses `diffInDays`. If after 12 PM UTC, add 1.
    const currentGameNumber = currentUTCHour < 12 ? diffInDays : diffInDays + 1;

    console.log("Calculated Game Number:", currentGameNumber);

    return currentGameNumber;
};

// Set the game number on component mount
useEffect(() => {
    setGameNumber(calculateGameNumber());
}, []);

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
      <Modal.Header closeButton></Modal.Header>
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
