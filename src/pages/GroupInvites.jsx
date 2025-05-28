import React, { useState, useEffect, useRef } from 'react';
import { Col, Dropdown, Button, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';

const GroupInvites = () => {

  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const userId = USER_AUTH_DATA?.id;

  const [invites, setInvites] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const inviteIntervalRef = useRef(null);
  const messageIntervalRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch group invites
  const fetchGroupInvites = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/groups/get-invites.php?user_id=${userId}`
      );

      const newInvites = Array.isArray(response.data.invitations)
        ? response.data.invitations
        : [];

      if (JSON.stringify(newInvites) !== JSON.stringify(invites)) {
        setInvites(newInvites);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  // Fetch group messages
  const fetchGroupMessages = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/groups/get-group-messages.php?user_id=${userId}`
      );
      // console.log(response.data);
    } catch (error) {
      console.error('Error fetching group messages:', error);
    }
  };

  // Accept invite
  // Accept invite
const handleAcceptInvite = async (inviteId, groupId) => {
  setShowDropdown(false);
  
  const date = new Date(); // current date/time

  // Get components in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Format as desired
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  try {
    await axios.post(
      `${baseURL}/groups/accept-invite.php`,
      {
        user_id: userId,
        invite_id: inviteId,
        group_id: groupId,
        formattedDate
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    setInvites((prevInvites) =>
      prevInvites.filter((invite) => invite.id !== inviteId)
    );

    if (invites.length === 1) {
      clearInterval(inviteIntervalRef.current);
    }
  } catch (error) {
    console.error('Error accepting invite:', error);
  }
};


// Decline invite
const handleDeclineInvite = async (inviteId) => {
  setShowDropdown(false);
  try {
    await axios.post(
      `${baseURL}/groups/decline-invite.php`,
      {
        user_id: userId,
        invite_id: inviteId
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    setInvites((prevInvites) =>
      prevInvites.filter((invite) => invite.id !== inviteId)
    );

    if (invites.length === 1) {
      clearInterval(inviteIntervalRef.current);
    }

    setShowDropdown(false); // Close dropdown
  } catch (error) {
    console.error('Error declining invite:', error);
  }
};

  // Invite polling effect
  useEffect(() => {
    fetchGroupInvites();
    inviteIntervalRef.current = setInterval(fetchGroupInvites, 3000);
    return () => clearInterval(inviteIntervalRef.current);
  }, []);

  // Message polling effect
  useEffect(() => {
    fetchGroupMessages();
    messageIntervalRef.current = setInterval(fetchGroupMessages, 5000);
    return () => clearInterval(messageIntervalRef.current);
  }, []);

  return (
    <Dropdown show={showDropdown} onToggle={() => setShowDropdown(!showDropdown)}>
      <Dropdown.Toggle variant="light" id="group-invites">
        <i className="fas fa-bell"></i>
        {Array.isArray(invites) && invites.length > 0 && (
          <Badge bg="danger" className="notification-count">
            {invites.length}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu ref={dropdownRef} align="end">
        <Dropdown.Header>Group Messages</Dropdown.Header>
        {Array.isArray(invites) && invites.length > 0 ? (
          <ListGroup variant="flush">
            {invites.map((invite) => (
              <ListGroup.Item key={invite.id}>
                <p>You have received an invitation from "{invite.group_name}"</p>
                <p>
                  <strong>Group Name:</strong> {invite.group_name}
                </p>
                <p>
                  <strong>Group Captain:</strong> {invite.captain_name || `${invite.first_name} ${invite.last_name}`}
                </p>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleAcceptInvite(invite.id, invite.group_id)}
                >
                  Accept
                </Button>{' '}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeclineInvite(invite.id)}
                >
                  Decline
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Dropdown.Item disabled>No new invites</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default GroupInvites;