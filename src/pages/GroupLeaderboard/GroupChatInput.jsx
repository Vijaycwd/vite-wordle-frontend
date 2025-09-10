import React, { useState } from "react";
import { InputGroup, Form, Button } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";

function GroupChatInput({ onSend, gameName }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text); // send message back to parent
    setText("");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <TextareaAutosize
          minRows={1}
          maxRows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="form-control"
        />
        <Button className={`${gameName}-btn`} type="submit">
          <FaPaperPlane />
        </Button>
      </InputGroup>
    </Form>
  );
}

export default GroupChatInput;
