import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

function FeedbackButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button className="game-btn m-2" onClick={() => setShow(true)}>
        Feedback
      </Button>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <a href="mailto:contact@pysis.com">Click here</a> to send your valuable feedback to <a href="mailto:contact@pysis.com">contact@pysis.com</a>.
            <br />
            Please include your phone number if you're open to being contacted for further discussion.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default FeedbackButton;