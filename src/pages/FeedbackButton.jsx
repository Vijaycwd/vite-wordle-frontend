import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

function FeedbackButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button className="btn-lg" onClick={() => setShow(true)}>
        Feedback
      </Button>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          CLICK HERE to send an email to <a href="mailto:contact@pysis.com">contact@pysis.com</a>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default FeedbackButton;