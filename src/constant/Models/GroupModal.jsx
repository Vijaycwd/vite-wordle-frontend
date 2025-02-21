import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const GroupModal = ({ showForm, handleFormClose, onSubmit, groupname, setGroupname, selectedGames, setSelectedGames }) => {
  
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
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Group Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter Name" 
              value={groupname} 
              onChange={(e) => setGroupname(e.target.value)} 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Select Game(s)</Form.Label>
            <Form.Check 
              type="checkbox" 
              label="Wordle" 
              value="Wordle" 
              onChange={handleCheckboxChange}
              checked={selectedGames.includes("Wordle")}
            />
            <Form.Check 
              type="checkbox" 
              label="Connections" 
              value="Connections" 
              onChange={handleCheckboxChange}
              checked={selectedGames.includes("Connections")}
            />
            <Form.Check 
              type="checkbox" 
              label="Phrazle" 
              value="Phrazle" 
              onChange={handleCheckboxChange}
              checked={selectedGames.includes("Phrazle")}
            />
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
