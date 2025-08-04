import React, { useState, useEffect } from "react";
import axios from "axios";

function GroupGameMessages({ groupId, gameName, periodType, periodDate, userId }) {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, [groupId, gameName, periodType, periodDate]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${baseURL}/groups/get-user-messages.php`, {
        params: {
          group_id: groupId,
          game_name: gameName,
          period_type: periodType,
          period_date: periodDate
        }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  return (
    <div style={{ height: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
      {messages.map((msg) => (
        <div key={msg.id} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <img
            src={
              msg.avatar
                ? `${baseURL}/user/uploads/${msg.avatar}`
                : `${baseURL}/user/uploads/default_avatar.png`
            }
            alt="Profile"
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              objectFit: "cover",
              marginRight: "8px"
            }}
          />
          <div>
            <strong>{msg.username}</strong>
            <br />
            <span>{msg.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GroupGameMessages;
