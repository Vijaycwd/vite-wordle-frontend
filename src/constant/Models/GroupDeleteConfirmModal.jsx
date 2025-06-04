import React from 'react';
import { Modal, Button } from 'react-bootstrap'; // assuming you're using react-bootstrap

function GroupDeleteConfirmModal({ show, onHide, onConfirm }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Detete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete your group?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Yes, Detete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GroupDeleteConfirmModal;
