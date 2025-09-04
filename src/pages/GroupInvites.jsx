import React, { useState, useEffect, useRef } from 'react';
import { Col, Dropdown, Button, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';


const GroupInvites = ({enable_invitation}) => {

  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const userId = USER_AUTH_DATA?.id;
  const [invites, setInvites] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const inviteIntervalRef = useRef(null);
  const messageIntervalRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
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


const fetchGroupMessages = async () => {
  try {
    const response = await axios.get(`${baseURL}/groups/get-group-messages.php?user_id=${userId}`);
    const newMessages = Array.isArray(response.data.messages) ? response.data.messages : [];
    setGroupMessages(newMessages);
  } catch (error) {
    console.error('Error fetching group messages:', error);
  }
};

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

    navigate(`/group/${groupId}`);
    
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
    if (enable_invitation == 1) {
      fetchGroupInvites();
      inviteIntervalRef.current = setInterval(fetchGroupInvites, 8000);
      return () => clearInterval(inviteIntervalRef.current);
    }
  }, [enable_invitation]);

  // Message polling effect
  useEffect(() => {
    fetchGroupMessages();
    messageIntervalRef.current = setInterval(fetchGroupMessages, 8000);
    return () => clearInterval(messageIntervalRef.current);
  }, []);

  const handleClickGroup = async(e, groupId, game, userId) => {
    e.preventDefault(); 
    setGroupMessages([]);
    setShowDropdown(!showDropdown)
    try {
      await axios.post(`${baseURL}/groups/update-seen-ids.php`, {
        group_id: groupId,
        msg_from:'group',
        game_name: game,
        user_id: userId, // current user
      });
      // After updating seen_ids, navigate to the link
     navigate(`/group/${groupId}/`);
    } catch (error) {
      console.error("Axios error:", error);
      
    }
  
  }

  const handleClick = async (e, groupId, game, userId) => {
    e.preventDefault(); // stop immediate navigation
    setGroupMessages(''); // optional: clear messages
    setShowDropdown(!showDropdown)

    try {
      await axios.post(`${baseURL}/groups/update-seen-ids.php`, {
        group_id: groupId,
        msg_from:'game',
        game_name: game,
        user_id: userId, // current user
      });

      // After updating seen_ids, navigate to the link
      navigate(`/group/${groupId}/stats/${game}`);
    } catch (error) {
      console.error("Axios error:", error);
    }
  };
  return (
    <Dropdown show={showDropdown} onToggle={() => setShowDropdown(!showDropdown)}>
      <Dropdown.Toggle variant="light" id="group-invites">
        <i className="fas fa-bell"></i>
        {((Array.isArray(invites) && invites.length > 0) ||
          (Array.isArray(groupMessages) && groupMessages.length > 0)) && (
          <Badge bg="danger" className="notification-count">
            { (invites?.length || 0) + (groupMessages?.length || 0) }
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu ref={dropdownRef} align="end">
        <Dropdown.Header>Group Messages</Dropdown.Header>

          {(Array.isArray(invites) && invites.length > 0) || (Array.isArray(groupMessages) && groupMessages.length > 0) ? (
            <ListGroup variant="flush">
              {/* Invites */}
              {Array.isArray(invites) && invites.length > 0 &&
                invites.map((invite) => (
                  <ListGroup.Item key={`invite-${invite.id}`}>
                    <p>You have received an invitation from "{invite.group_name}"</p>
                    <p><strong>Group Name:</strong> {invite.group_name}</p>
                    <p>
                      <strong>Group Captain:</strong> {`${invite.first_name} ${invite.last_name} (${invite.captain_name})`}
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
                ))
              }

              {/* Group Messages */}
              {Array.isArray(groupMessages) && groupMessages.length > 0 &&
                groupMessages.map((msg) => (
                  <ListGroup.Item key={`msg-${msg.id}`}>
                    {msg.msg_from == 'group' ? (
                      <>
                    
                    <p>
                      
                      {msg.message}{" "}
                      <Link
                        to={`/group/${msg.group_id}`}
                        onClick={(e) => handleClickGroup(e, msg.group_id, msg.game_name, userId)}
                      >
                        View
                      </Link>
                    </p>
                    </>
                  ) : (
                    <>
                    <p>
                      {msg.message}{" "}
                      <Link
                        to={`/group/${msg.group_id}/stats/${msg.game_name}`}
                        onClick={(e) => handleClick(e, msg.group_id, msg.game_name, userId)}
                      >
                        View
                      </Link>
                    </p>
                    </>
                  )}
                  </ListGroup.Item>
                ))
              }
            </ListGroup>
          ) : (
            <Dropdown.Item disabled>No invites or messages</Dropdown.Item>
          )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default GroupInvites;