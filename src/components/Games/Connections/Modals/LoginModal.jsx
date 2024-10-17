import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ showLoginPrompt, handleLoginPromptClose }) => {
  const navigate = useNavigate();

  return (
    <Modal show={showLoginPrompt} onHide={handleLoginPromptClose}>
      <Modal.Header closeButton>
        <Modal.Title>Login Required</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Please log in or create an account to play Connections and track your scores.</p>
        <div className="d-flex justify-content-between">
          <Button variant="primary" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button variant="secondary" onClick={() => navigate('/register')}>
            Create Profile
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
export default LoginModal;
