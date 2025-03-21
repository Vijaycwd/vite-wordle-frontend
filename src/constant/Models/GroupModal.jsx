import React from "react";
import { Modal, Button, Form, Spinner  } from "react-bootstrap";

const GroupModal = ({ showForm, handleFormClose, onSubmit, groupname, setGroupname, editMode, loading }) => {
  return (
    <Modal show={showForm} onHide={handleFormClose} backdrop="static" keyboard={false}>
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
              autoFocus
            />
          </Form.Group>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFormClose}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Updating...
                </>
              ) : (
                editMode ? "Update" : "Create"
              )}
            </Button>

          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default GroupModal;
