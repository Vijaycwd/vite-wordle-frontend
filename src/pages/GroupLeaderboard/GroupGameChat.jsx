import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col } from "react-bootstrap";
import dayjs from "dayjs";
import GroupChatMessagesByDate from "./GroupChatMessagesByDate";
import GroupChatInput from "./GroupChatInput";

function GroupGameChat({ groupId, gameName, createdAt, periodType, userId, highlightMsgId, generalChat }) {
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

  // Fetch messages
  const fetchGeneralMessages = async () => {
   const created_at = dayjs().format("YYYY-MM-DD");
    try {
      const baseParams = { group_id: groupId, game_name: gameName, created_at, general_chat: generalChat };
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
    if (groupId && generalChat) {
      fetchGeneralMessages();
    }
  }, [groupId, generalChat]);

  // Send message
  const handleSend = async (messageText) => {
    // Decide timestamp
    const created_at = generalChat
      ? dayjs().format("YYYY-MM-DD HH:mm:ss")   // system local timestamp
      : createdAt;                              // fallback

    await axios.post(`${baseURL}/groups/send-user-message.php`, {
      group_id: groupId,
      game_name: gameName,
      created_at: created_at,
      user_id: userId,
      message: messageText,
      general_chat: generalChat
    });

    if (generalChat) {
      fetchGeneralMessages();
    } else {
      fetchMessages();
    }
  };
console.log(generalChat)

  return (
        <>
        <div
          className="chat-box border rounded p-3 mb-3"
          style={{ height: "350px", overflowY: "auto", background: "#e8f3fb" }}
        >
          <GroupChatMessagesByDate
            gameName={gameName}
            messages={messages}
            userId={userId}
            baseURL={baseURL}
            highlightMsgId={highlightMsgId}
            generalChat
          />
        </div>

        {/* Input box */}
        <GroupChatInput onSend={handleSend} gameName={gameName} />
        </>
  );
}

export default GroupGameChat;
