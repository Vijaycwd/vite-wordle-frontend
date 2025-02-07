import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PhrazleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {
  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState();

  const calculateGameNumber = () => {
    // Corrected Start Date: January 1, 2024, 12:00 PM (Local Time)
    const firstGameDate = new Date(2024, 1, 1, 12, 0, 0); 

    // Get current local time
    const now = new Date();

    // Calculate the difference in milliseconds
    const diffInMs = now - firstGameDate;

    // Convert difference into 12-hour periods
    const diffIn12HourPeriods = Math.floor(diffInMs / (1000 * 60 * 60 * 12));

    // Game number starts at 1
    const currentGameNumber = diffIn12HourPeriods;

    // console.log("Now Local Time:", now.toString());
    // console.log("Next Update At:", now.getHours() < 12 ? "12 PM" : "12 AM");
    // console.log("Calculated Game Number:", currentGameNumber);

    return currentGameNumber;
};

// Set the game number on component mount & ensure updates
useEffect(() => {
    setGameNumber(calculateGameNumber());

    // Check every minute and update at exactly 12 AM & 12 PM (Local Time)
    const interval = setInterval(() => {
        const now = new Date();
        if ((now.getHours() === 0 && now.getMinutes() === 0) || 
            (now.getHours() === 12 && now.getMinutes() === 0)) {
            setGameNumber(calculateGameNumber());
        }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
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
