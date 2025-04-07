import React, { useState, useEffect,  useRef } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { DateTime, Duration } from 'luxon';

const PhrazleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {
  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState();
  

  const calculateGameNumber = () => {
    // First game: Jan 1, 2024 at 12 PM local time
    const firstGame = DateTime.local(2024, 2, 1, 12, 0, 0); // 12:00 PM local
    const now = DateTime.local();
    console.log(now);
    const intervalMs = Duration.fromObject({ hours: 12 }).as('milliseconds');
    const diffInMs = now.toMillis() - firstGame.toMillis();
  
    return Math.floor(diffInMs / intervalMs);
  };
  useEffect(() => {
    const updateGameNumber = () => {
      setGameNumber(calculateGameNumber());
  
      const now = DateTime.local();
      let next;
  
      if (now.hour < 12) {
        // Next 12:00 PM today
        next = now.set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
      } else {
        // Next 12:00 AM tomorrow
        next = now.plus({ days: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      }
  
      const timeout = next.toMillis() - now.toMillis();
      setTimeout(updateGameNumber, timeout);
    };
  
    updateGameNumber();
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
