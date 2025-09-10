import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col } from "react-bootstrap";
import dayjs from "dayjs";
import GroupChatMessagesByDate from "./GroupChatMessagesByDate";
import GroupChatInput from "./GroupChatInput";

function GroupGameChat({ groupId, gameName, createdAt, periodType, userId, highlightMsgId }) {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [messages, setMessages] = useState([]);
  
  // Fetch messages
  const fetchMessages = async () => {
   const created_at = dayjs(createdAt, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD");
    try {
      const baseParams = { group_id: groupId, game_name: gameName, created_at };
      const params = gameName === "phrazle" ? { ...baseParams, period: periodType } : baseParams;

      const response = await axios.get(
        `${baseURL}/groups/get-user-messages.php`,
        { params }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    if (groupId && gameName) {
      fetchMessages();
    }
  }, [groupId, gameName]);

  // Send message
  const handleSend = async (messageText) => {
    await axios.post(`${baseURL}/groups/send-user-message.php`, {
      group_id: groupId,
      game_name: gameName,
      created_at: createdAt,
      user_id: userId,
      message: messageText,
    });
    fetchMessages();
  };

  return (
    <Row className="justify-content-center">
      <Col md={6}>
        {/* Chat window */}
        <div
          className="chat-box border rounded p-3 mb-3"
          style={{ height: "350px", overflowY: "auto", background: "#e8f3fb" }}
        >
          <GroupChatMessagesByDate
            messages={messages}
            userId={userId}
            baseURL={baseURL}
            highlightMsgId={highlightMsgId}
          />
        </div>

        {/* Input box */}
        <GroupChatInput onSend={handleSend} gameName={gameName} />
      </Col>
    </Row>
  );
}

export default GroupGameChat;
