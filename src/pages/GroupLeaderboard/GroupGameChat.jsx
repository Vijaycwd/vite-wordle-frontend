import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { InputGroup, Form, Button, Row, Col } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import dayjs from "dayjs";

function GroupGameChat({ groupId, gameName, createdAt, periodType, userId }) {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  // Fetch messages
  const fetchMessages = async () => {
    const created_at = dayjs(createdAt, "YYYY-MM-DD HH:mm:ss").format(
      "YYYY-MM-DD"
    );
    try {
      const baseParams = {
        group_id: groupId,
        game_name: gameName,
        created_at: created_at,
      };
      const params =
        gameName === "phrazle"
          ? { ...baseParams, period: periodType }
          : baseParams;

      const response = await axios.get(
        `${baseURL}/groups/get-user-messages.php`,
        { params }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  // Auto-scroll
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (groupId && gameName) {
      fetchMessages();
    }
  }, [groupId, gameName]);

  useEffect(scrollToBottom, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim()) return;
    await axios.post(`${baseURL}/groups/send-user-message.php`, {
      group_id: groupId,
      game_name: gameName,
      created_at: createdAt,
      user_id: userId,
      message: text,
    });
    setText("");
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
          {messages.length === 0 ? (
            <div className="text-center text-muted my-3">
              <p className="mb-0">No messages yet today.</p>
              <p>Type your message to the group below.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.user_id === userId;
              return (
                <div
                  key={index}
                  className={`d-flex flex-column mb-3 ${
                    isMe ? "align-items-end" : "align-items-start"
                  }`}
                >
                  {/* Username */}
                  <div
                    className={`small fw-bold mb-1 ${
                      isMe ? "text-end me-1" : "ms-1"
                    }`}
                  >
                    {msg.username || `User ${msg.user_id}`}
                  </div>

                  {/* Message row with avatar + bubble */}
                  <div className={`d-flex ${isMe ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <img
                      src={
                        msg.avatar
                          ? `${baseURL}/user/uploads/${msg.avatar}`
                          : "https://via.placeholder.com/30"
                      }
                      alt="avatar"
                      className={`rounded-circle ${
                        isMe ? "ms-2" : "me-2"
                      }`}
                      width="30"
                      height="30"
                      onError={(e) => (e.target.style.display = "none")}
                    />

                    {/* Message bubble */}
                    <div
                      className={`p-2 rounded-3 ${
                        isMe ? "bg-primary text-white" : "bg-white border text-dark"
                      }`}
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "pre-wrap",
                        position: "relative"
                      }}
                    >
                      {/* Message text */}
                      <div style={{ paddingRight: "45px" }}>{msg.message}</div>

                      {/* Time in bottom-right */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          right: "10px",
                          fontSize: "0.7rem",
                          color: isMe ? "rgba(255,255,255,0.7)" : "#6c757d"
                        }}
                      >
                        {dayjs(msg.created_at).format("HH:mm")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <InputGroup>
            <TextareaAutosize
              minRows={1}
              maxRows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="form-control"
            />
            <Button className={`${gameName}-btn`} onClick={sendMessage}>
              <FaPaperPlane />
            </Button>
          </InputGroup>
        </Form>
      </Col>
    </Row>
  );
}

export default GroupGameChat;
