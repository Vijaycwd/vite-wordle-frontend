import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function MemberProfile({ show, onHide, selectedMember, baseURL }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Member Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {selectedMember ? (
          <>
            <img
              src={
                selectedMember.avatar
                  ? `${baseURL}/user/uploads/${selectedMember.avatar}`
                  : `${baseURL}/user/uploads/defalut_avatar.png`
              }
              alt="Avatar"
              className="rounded-circle mb-3"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
           
            <p className="text-muted">@{selectedMember.username}</p>
            <h5>{selectedMember.first_name} {selectedMember.last_name}</h5>
          </>
        ) : (
          <p>No member selected</p>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default MemberProfile;
