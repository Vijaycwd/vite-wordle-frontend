import React, { useState, useEffect, useRef } from 'react';
import { Col, Dropdown, Button, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';


const GroupInvites = () => {

  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const userId = USER_AUTH_DATA?.id;
  const [invites, setInvites] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const inviteIntervalRef = useRef(null);
  const messageIntervalRef = useRef(null);
  const messageCountRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [unreadcount, setunReadCount]= useState(0);
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


// const fetchGroupCount = async () => {
//   try {
//     const response = await axios.get(`${baseURL}/groups/get-unseen-count.php?user_id=${userId}`);
//     console.log('read-count',response.data.unread_count);
//     setunReadCount(response.data.unread_count);
//   } catch (error) {
//     console.error('Error fetching group messages:', error);
//   }
// };

const fetchGroupMessages = async () => {
  try {
    const response = await axios.get(`${baseURL}/groups/get-group-messages.php?user_id=${userId}`);
    const newMessages = Array.isArray(response.data.messages) ? response.data.messages : [];
    setGroupMessages(newMessages);
    setunReadCount(response.data.total_unread);
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
      fetchGroupInvites();
      inviteIntervalRef.current = setInterval(fetchGroupInvites, 8000);
      return () => clearInterval(inviteIntervalRef.current);
    
  }, []);

  useEffect(() => {
    fetchGroupMessages();
    messageIntervalRef.current = setInterval(fetchGroupMessages, 8000);
    return () => clearInterval(messageIntervalRef.current);
  }, []);


  const handleClickGroup = async (e, groupId, game, userId, msgId) => {
    e.preventDefault();
    setGroupMessages([]);
    setShowDropdown(false);

    try {
      await axios.post(`${baseURL}/groups/update-seen-ids.php`, {
        group_id: groupId,
        msg_from: 'group',
        game_name: game,
        user_id: userId,
      });
      
      navigate(`/group/${groupId}?msg_id=${msgId}`);
    } catch (error) {
      console.error("Axios error:", error);
    }
  };

  const handleClick = async (e, groupId, game, userId, msgId) => {
    e.preventDefault();
    setGroupMessages([]);
    setShowDropdown(false);

    try {
      await axios.post(`${baseURL}/groups/update-seen-ids.php`, {
        group_id: groupId,
        msg_from: 'game',
        game_name: game,
        user_id: userId,
      });

      navigate(`/group/${groupId}/stats/${game}?msg_id=${msgId}`);
    } catch (error) {
      console.error("Axios error:", error);
    }
  };
  return (
    <Dropdown show={showDropdown} onToggle={async (isOpen) => {
        setShowDropdown(isOpen);
        // if (isOpen) {
        //   // setunReadCount(0);
        //   await axios.post(`${baseURL}/groups/mark-all-seen.php`, { user_id: userId });
        // }
      }}
    >
      <Dropdown.Toggle variant="light" id="group-invites">
        <i className="fas fa-bell"></i>
        {unreadcount > 0 && (
          <Badge bg="danger" className="notification-count">
            {unreadcount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu ref={dropdownRef} align="end">
        <Dropdown.Header>Group Messages</Dropdown.Header>

          {(Array.isArray(invites) && invites.length > 0) || (Array.isArray(groupMessages) && groupMessages.length > 0) ? (
  <div
    style={{
      maxHeight: "300px",        // adjust height as needed
      overflowY: "auto",
      overflowX: "hidden",
      scrollbarWidth: "thin",
      scrollbarColor: "#ccc #f9f9f9",
    }}
  >
    <ListGroup variant="flush" style={{ minWidth: "300px" }}>
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
            </Button>{" "}
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
         <ListGroup.Item
            key={`msg-${msg.id}`}
            className={
              msg.seen_ids && msg.seen_ids.split(",").includes(String(userId))
                ? "read-msg"
                : "unread-msg"
            }
          >
            {msg.msg_from === "group" ? (
              <p>
                {msg.message}{" "}
                <Link
                  to={
                    msg.msg_id
                      ? `/group/${msg.group_id}?msg_id=${msg.msg_id}`
                      : `/group/${msg.group_id}`
                  }
                  onClick={(e) =>
                    handleClickGroup(e, msg.group_id, msg.game_name, userId, msg.msg_id)
                  }
                >
                  View
                </Link>
              </p>
            ) : (
              <p className='cwd-group-message'>
                <div
                dangerouslySetInnerHTML={{ __html: msg.message }}
                />{" "}
                <Link
                  to={
                    msg.msg_id
                      ? `/group/${msg.group_id}/stats/${msg.game_name}?msg_id=${msg.msg_id}`
                      : `/group/${msg.group_id}/stats/${msg.game_name}`
                  }
                  onClick={(e) =>
                    handleClick(e, msg.group_id, msg.game_name, userId, msg.msg_id)
                  }
                >
                  View
                </Link>
              </p>
            )}
          </ListGroup.Item>
        ))
      }
    </ListGroup>
  </div>
) : (
  <Dropdown.Item disabled>No invites or messages</Dropdown.Item>
)}

      </Dropdown.Menu>
    </Dropdown>
  );
};

export default GroupInvites;