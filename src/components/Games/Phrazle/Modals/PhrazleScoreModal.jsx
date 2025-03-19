import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PhrazleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {
  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState();

  const isDST = (date = new Date()) => {
    const janOffset = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const julOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return date.getTimezoneOffset() < Math.max(janOffset, julOffset);
};

const calculateGameNumber = () => {
    // Start Date: January 1, 2024, 12:00 PM Local Time
    const firstGameDate = new Date(2024, 0, 1, 12, 0, 0); // Month is 0-based (Jan = 0)

    const now = new Date();

    // Adjust for DST shifts
    const dstAdjustment = isDST(now) !== isDST(firstGameDate) ? 1 : 0;

    // Difference in 12-hour periods
    const diffInMs = now.getTime() - firstGameDate.getTime();
    const diffIn12HourPeriods = Math.floor(diffInMs / (1000 * 60 * 60 * 12)) + dstAdjustment;

    return diffIn12HourPeriods;
};

useEffect(() => {
    setGameNumber(calculateGameNumber());

    const interval = setInterval(() => {
        const now = new Date();
        if ((now.getHours() === 0 && now.getMinutes() === 0) || 
            (now.getHours() === 12 && now.getMinutes() === 0)) {
            setGameNumber(calculateGameNumber());
        }
    }, 60 * 1000);

    return () => clearInterval(interval);
}, []);

const getTimeZoneInfo = () => {
    const date = new Date();
    return {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offsetMinutes: date.getTimezoneOffset(),
        dstActive: isDST(date),
    };
};

console.log(getTimeZoneInfo());
console.log("Today's Game Number:", calculateGameNumber());

// const isDST = (date = new Date()) => {
//   const janOffset = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
//   const julOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
//   return date.getTimezoneOffset() < Math.max(janOffset, julOffset);
// };

// const getTimeZoneInfo = () => {
//   const date = new Date();
//   return {
//       timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       offsetMinutes: date.getTimezoneOffset(),
//       dstActive: isDST(date),
//   };
// };
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
