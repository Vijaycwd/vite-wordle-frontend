import React, { useRef, useEffect } from "react";
import dayjs from "dayjs";

function GroupChatMessagesByDate({ gameName, messages, userId, baseURL, highlightMsgId }) {
  const chatEndRef = useRef(null);

   // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Highlight specific message by ID
  useEffect(() => {
    if (highlightMsgId && messages.length > 0) {
      const el = document.getElementById(`msg-${highlightMsgId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight");
        setTimeout(() => el.classList.remove("highlight"), 3000);
      }
    }
  }, [highlightMsgId, messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center text-muted my-3">
        <p className="mb-0">No messages yet today.</p>
        <p>Type your message to the group below.</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg) => {
        const isMe = msg.user_id === userId;
        const time = msg.created_at
        ? gameName
          ? dayjs(msg.created_at).format("hh:mm A")
          : dayjs(msg.created_at).format("MMM, D YYYY hh:mm") // 12-hour
        : "";
        
        return (
          <div
            key={msg.id}
            id={`msg-${msg.id}`} // important for highlight
            className={`d-flex flex-column mb-3 ${isMe ? "align-items-end" : "align-items-start"}`}
          >
            {/* Username */}
            <div className={`small fw-bold mb-1 ${isMe ? "text-end me-1" : "ms-1"}`}>
              {msg.username || `User ${msg.user_id}`}
            </div>

            {/* Message row */}
            <div className={`d-flex ${isMe ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <img
                src={msg.avatar ? `${baseURL}/user/uploads/${msg.avatar}` : "https://via.placeholder.com/30"}
                alt="avatar"
                className={`rounded-circle ${isMe ? "ms-2" : "me-2"}`}
                width="30"
                height="30"
                onError={(e) => (e.target.style.display = "none")}
              />

              {/* Message bubble */}
              <div
                className={`p-2 rounded-3 ${isMe ? "bg-primary text-white" : "bg-white border text-dark"}`}
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  position: "relative",
                }}
              >
                <div style={{ paddingRight: "45px", marginBottom:"5px" }}>{msg.message}</div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "3px",
                    right: "5px",
                    fontSize: "0.6rem",
                    color: isMe ? "rgba(255,255,255,0.7)" : "#6c757d",
                  }}
                >
                  {time}
                  
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={chatEndRef} />
    </>
  );
}

export default GroupChatMessagesByDate;
