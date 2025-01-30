import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const GroupModal = ({ showForm, handleFormClose, onSubmit, groupname, setGroupname }) => {
  const handleChange = (event) => {
    const groupName = event.target.value;
    setGroupname(groupName);
  };
  return (
    <Modal show={showForm} onHide={handleFormClose}>
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Group Name</Form.Label>
            <Form.Control type="text" placeholder="Enter Name" value={groupname} onChange={handleChange} />
          </Form.Group>
          <Button variant="primary" type="submit">
            Create
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

export default GroupModal;
