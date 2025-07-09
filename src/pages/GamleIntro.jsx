import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';

function GamleIntro() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [gameintroText, setGameIntroText] = useState({ gameintro: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Axios.get(`${baseURL}/user/get-homepage-text.php`)
      .then((res) => {
        if (res.status === 200) {
          setGameIntroText(res.data);
        } else {
          console.warn('No homepage text found');
        }
      })
      .catch((err) => {
        console.error('Error fetching homepage text:', err);
      });
  }, [baseURL]);

  // Replace [FEEDBACK] with clickable span/button that triggers modal
  const processedText = gameintroText.gameintro.replace(
    '[FEEDBACK]',
    `<span style="color:#0d6efd; cursor:pointer;" onclick="window.triggerFeedbackModal()">FEEDBACK</span>`
  );

  // Attach modal trigger to window to be used inside raw HTML onclick
  useEffect(() => {
    window.triggerFeedbackModal = () => setShowModal(true);
    return () => delete window.triggerFeedbackModal; // Cleanup
  }, []);

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <div dangerouslySetInnerHTML={{ __html: processedText }} />
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <a href="mailto:contact@pysis.com">Click here</a> to send your valuable feedback to <a href="mailto:contact@pysis.com">contact@pysis.com</a>.<br />
            Please include your phone number if you're open to being contacted for further discussion.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default GamleIntro;
