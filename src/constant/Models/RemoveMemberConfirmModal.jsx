import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const RemoveMemberConfirmModal = ({ show, onHide, onConfirm }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Remove Member</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to remove this member from the group?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Remove</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveMemberConfirmModal;
