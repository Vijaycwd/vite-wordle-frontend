import React, { useState, useEffect, useRef } from 'react';
import { Col, Dropdown, Button, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';

const GroupInvites = () => {
  
 const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};
  const userId = userAuthData.id;
  const [invites, setInvites] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    fetchGroupInvites();
  }, []);

  
  const fetchGroupInvites = async () => {
    try {
      const response = await axios.get('https://coralwebdesigns.com/college/wordgamle/groups/get-invites.php',{
        params: {
            user_id: userId
        }
    });
    //console.log(response.data);
      setInvites(response.data.invitations);
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await axios.post('https://coralwebdesigns.com/college/wordgamle/groups/accept-invite.php', { inviteId });
      setInvites(invites.filter(invite => invite.id !== inviteId));
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    try {
      await axios.post('https://coralwebdesigns.com/college/wordgamle/groups/decline-invite.php', { inviteId });
      setInvites(invites.filter(invite => invite.id !== inviteId));
    } catch (error) {
      console.error('Error declining invite:', error);
    }
  };
  return (
    <Dropdown show={showDropdown} onToggle={() => setShowDropdown(!showDropdown)}>
      <Dropdown.Toggle variant="light" id="group-invites">
        <i className="fas fa-bell"></i>
        {invites.length > 0 && <Badge bg="danger" className="notification-count">{invites.length}</Badge>}
      </Dropdown.Toggle>

      <Dropdown.Menu ref={dropdownRef} align="end">
        <Dropdown.Header>Group Invitations</Dropdown.Header>
        {invites.length > 0 ? (
            <>
        
        {/* <ListGroup variant="flush">
            <ListGroup.Item>Cras justo odio</ListGroup.Item>
            <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
            <ListGroup.Item>Morbi leo risus</ListGroup.Item>
            <ListGroup.Item>Porta ac consectetur acPorta ac consectetur ac</ListGroup.Item>
        </ListGroup> */}
          <ListGroup variant="flush">
            {invites.map(invite => (
              <ListGroup.Item key={invite.id} className="   ">
                <p>The {invite.group_name} group invited you. </p>
                <Button size="sm" variant="success" onClick={() => handleAcceptInvite(invite.id)}>Accept</Button>{' '}
                <Button size="sm" variant="danger" onClick={() => handleDeclineInvite(invite.id)}>Decline</Button>
              </ListGroup.Item>
              
            ))}
          </ListGroup>
          </>
        ) : (
          <Dropdown.Item disabled>No new invites</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default GroupInvites;
