import React, { useState, useEffect } from "react";
import axios from "axios";
import { InputGroup, Form, Button, Row, Col } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa"; // for send icon
import TextareaAutosize from "react-textarea-autosize";

function GroupGameChat({ groupId, gameName, periodType, periodDate, userId }) {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!text.trim()) return;
    await axios.post(`${baseURL}/groups/send-user-message.php`, {
      group_id: groupId,
      game_name: gameName,
      period_type: periodType,
      period_date: periodDate,
      user_id: userId,
      message: text
    });
    setText("");
    fetchMessages();
  };

  return (
    <Row className="justify-content-center">
      <Col md={4}>
        <div className="my-3">
          <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
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
        </div>
      </Col>
    </Row>
    
  );
}

export default GroupGameChat