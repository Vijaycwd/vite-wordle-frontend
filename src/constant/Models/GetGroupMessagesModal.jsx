import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import dayjs from "dayjs";
import GroupChatInput from "../../pages/GroupLeaderboard/GroupChatInput"; // ✅ import input box

const GetGroupMessagesModal = ({ groupId, gameName, periodDate, periodType, userId, archive }) => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const periodDateStr = dayjs(periodDate).format("YYYY-MM-DD");
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [latestCreatedAt,setLatestCreatedAt] = useState(null);
  console.log("GetGroupMessagesModal props -> periodDate:", periodDate, "periodType:", periodType, "archive:", archive);
  useEffect(() => {
    // don't run until these required props are available
    if (!groupId || !gameName || !userId || !periodDate) return;

    let mounted = true;

    const fetchLatestDate = async () => {
      try {
        // small delay to ensure parent props settle (optional)
        await new Promise((r) => setTimeout(r, 1000));

        // compute formatted periodDate inside effect (prevents dayjs(undefined) or stale capture)
        const periodDateStr = dayjs(periodDate).format("YYYY-MM-DD");
        console.log("fetchLatestDate -> periodDateStr:", periodDateStr);

        // normalize archive (handles boolean or 'true'/'false' strings)
        const archiveBool = archive === true || archive === "true";

        const baseParams = {
          group_id: groupId,
          game_name: gameName,
          user_id: userId,
          created_at: periodDateStr,  // use created_at (server commonly expects this)
          archive: archiveBool,
        };

        // only add extra filters for phrazle archive queries
        const params = gameName === "phrazle" && archiveBool
          ? { ...baseParams, period: periodType }
          : baseParams;

        console.log("fetchLatestDate -> params:", params);

        const response = await axios.get(`${baseURL}/groups/get-latest-created-at.php`, { params });

        if (!mounted) return; // avoid state update if unmounted

        if (response?.data?.created_at) {
          console.log("fetchLatestDate -> server returned created_at:", response.data.created_at);
          setLatestCreatedAt(response.data.created_at);
        } else {
          console.log("fetchLatestDate -> server returned no created_at, clearing latestCreatedAt");
          setLatestCreatedAt(null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to fetch latest created_at:", err);
        setLatestCreatedAt(null);
      }
    };

    fetchLatestDate();

    return () => {
      mounted = false;
    };
  }, [groupId, gameName, periodDate, periodType, userId, archive, baseURL]);

console.log('latestCreatedAt',latestCreatedAt);

  // auto scroll when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const baseParams = {
        group_id: groupId,
        game_name: gameName,
        created_at: periodDateStr
      };
      const params =
        gameName === 'phrazle' ? { ...baseParams, period: periodType } : baseParams;

      const response = await axios.get(
        `${baseURL}/groups/get-user-messages.php`,
        { params }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleShow = async () => {
    setShow(true);
    fetchMessages();
  };

  const handleClose = () => setShow(false);

  // ✅ Sending a message
  const handleSend = async (messageText) => {
    if (!messageText.trim()) return;
    await axios.post(`${baseURL}/groups/send-user-message.php`, {
      group_id: groupId,  
      game_name: gameName,
      created_at: archive ? latestCreatedAt : periodDate,
      user_id: userId,
      message: messageText,
      
    });
    fetchMessages(); // refresh after sending
  };

  return (
    <>
    
      <div className='text-center my-4'>
        <Button className={`${gameName}-btn`} onClick={handleShow}>
          Messages {dayjs(periodDate).format("MMM, D YYYY")}
          {gameName === 'phrazle' ? ` - ${periodType}` : ''}
        </Button>
      </div>

      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Group Messages</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {messages.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <ul className="list-unstyled">
                {messages.map((msg, index) => (
                  <li key={index} className="mb-3">
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          msg.avatar
                            ? `${baseURL}/user/uploads/${msg.avatar}`
                            : `${baseURL}/user/uploads/defalut_avatar.png`
                        }
                        width={40}
                        height={40}
                        className="rounded-circle me-2"
                      />
                      <strong>{msg.username}</strong>
                    </div>
                    <div className="ms-5">{msg.message}</div>
                    <small className="ms-5 text-muted">
                      {dayjs(msg.created_at).format("MMM, D YYYY hh:mm A")}
                    </small>
                  </li>
                ))}
                {/* 👇 this ensures scroll to bottom */}
                <div ref={messagesEndRef} />
              </ul>
            </div>
          ) : (
            <p>No messages found for the selected date.</p>
          )}
        </Modal.Body>

        {/* ✅ Added input for sending messages */}
        <Modal.Footer className="w-100 d-block">
          {messages.length > 0 && (
            <GroupChatInput onSend={handleSend} gameName={gameName} />
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GetGroupMessagesModal;
