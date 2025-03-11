import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const GroupModal = ({ showForm, handleFormClose, onSubmit, groupname, setGroupname, selectedGames, editMode, setSelectedGames }) => {
  
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedGames([...selectedGames, value]);
    } else {
      setSelectedGames(selectedGames.filter((game) => game !== value));
    }
  };

  return (
    <Modal show={showForm} onHide={handleFormClose}>
      <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Update Group" : "Create Group"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <Form onSubmit={onSubmit}>
              <Form.Group>
                  <Form.Label>Group Name</Form.Label>
                  <Form.Control 
                      type="text" 
                      value={groupname} 
                      onChange={(e) => setGroupname(e.target.value)} 
                  />
              </Form.Group>
              <Modal.Footer>
                  <Button variant="secondary" onClick={handleFormClose}>Close</Button>
                  <Button variant="primary" type="submit">
                      {editMode ? "Update" : "Create"}
                  </Button>
              </Modal.Footer>
          </Form>
      </Modal.Body>
  </Modal>
  );
};

export default GroupModal;
