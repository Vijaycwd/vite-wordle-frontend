import React, { useState, useEffect,  useRef } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { DateTime, Duration } from 'luxon';

const PhrazleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {
  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState();
  
  const calculateGameNumber = () => {
    const firstGame = DateTime.utc(2024, 2, 1, 12, 0);
    const now = DateTime.utc();
    const intervalMs = Duration.fromObject({ hours: 12 }).as('milliseconds');
    return Math.floor((now.toMillis() - firstGame.toMillis()) / intervalMs);
  };
  
  useEffect(() => {
    const updateGameNumber = () => {
      const gameNumber = calculateGameNumber();
      console.log("Game #", gameNumber);
      setGameNumber(gameNumber);
  
      const now = DateTime.utc(); // 🔁 Use UTC here
      console.log(now);
      const nextReset = now.hour < 12
        ? now.set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
        : now.plus({ hours: 12 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  
      const timeout = nextReset.toMillis() - now.toMillis();
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
