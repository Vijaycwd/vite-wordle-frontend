import React, { useRef, useEffect, useState  } from "react";
import dayjs from "dayjs";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";

function GroupChatMessagesByDate({ gameName, messages, userId, baseURL, highlightMsgId, generalChat }) {
  const chatEndRef = useRef(null);
  const [showPickerFor, setShowPickerFor] = useState(null);
  const [msgReactions, setMsgReactions] = useState({});
  
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

  // ✅ Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = dayjs(msg.created_at).format("YYYY-MM-DD");
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  // ✅ Helper to display human-friendly date (Today, Yesterday, etc.)
  const getDateLabel = (dateKey) => {
    const date = dayjs(dateKey);
    if (date.isSame(dayjs(), "day")) return "Today";
    if (date.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
    return date.format("MMM D, YYYY");
  };

  // ✅ Handle emoji reaction
  const handleEmojiSelect = async (emojiData, messageId) => {
    try {
      const response = await axios.post(`${baseURL}/groups/react-message.php`, {
        message_id: messageId,
        user_id: userId,
        emoji: emojiData.emoji,
        generalChat
      });
      setMsgReactions(prev => ({
        ...prev,
        [messageId]: emojiData.emoji
      }));
      

      // 👇 Optionally show popup or inline confirmation
      if (response.data.success) {
        //alert(`Reaction ${response.data.action}: ${emojiData.emoji}`);
      } else {
        alert("Something went wrong while reacting!");
      }
      setShowPickerFor(null);

      // 🔄 Optional: refresh messages to show updated counts
      // fetchMessages();
    } catch (error) {
      alert("Failed to send reaction. Please try again.");
    }
  };

  return (
    <>
      {Object.keys(groupedMessages).map((dateKey) => (
        <div key={dateKey}>

          {!gameName && (
            <div className="d-flex align-items-center my-3">
              <div style={{ flex: 1, height: "1px", backgroundColor: "#ccc" }}></div>
              <span
                style={{
                  background: "#e5e5e5",
                  padding: "3px 10px",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  color: "#555",
                  margin: "0 10px",
                  whiteSpace: "nowrap",
                }}
              >
                {getDateLabel(dateKey)}
              </span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#ccc" }}></div>
            </div>
          )}

          {/* Messages for this date */}
          {groupedMessages[dateKey].map((msg) => {
            const isMe = msg.user_id === userId;
            const time = msg.created_at
              ? gameName
                ? dayjs(msg.created_at).format("HH:mm A") // 24hr
                : dayjs(msg.created_at).format("hh:mm A") // 12hr
              : "";
            return (
              <div
                key={msg.id}
                id={`msg-${msg.id}`} // for highlight
                className={`d-flex flex-column mb-3 ${isMe ? "align-items-end" : "align-items-start"}`}
              >
                {/* Username */}
                <div className={`small fw-bold mb-1 ${isMe ? "text-start me-1" : "ms-1"}`}>
                  {msg.username || `User ${msg.user_id}`}
                </div>

                {/* Message row */}
                
                <div className={`d-flex align-items-end`} style={{ position: "relative" }}>
                  {/* Avatar + Reactions */}
                  <div style={{ position: "relative" }}>  
                    <img
                      src={msg.avatar ? `${baseURL}/user/uploads/${msg.avatar}` : "https://via.placeholder.com/30"}
                      alt="avatar"
                      className={`rounded-circle ${isMe ? "ms-2" : "me-2"}`}
                      width="30"
                      height="30"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`p-2 rounded-3 ${isMe ? "bg-primary text-white" : "bg-white border text-dark"}`}
                    style={{
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-wrap",
                      position: "relative",
                      maxWidth: "75%",
                    }}
                  >
                    <div style={{ paddingRight: "40px", marginBottom: "5px"}}>{msg.message}</div>
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
                    {/* 💖 Reaction (bottom-left corner like WhatsApp) */}
                    
                    {(msgReactions[msg.id] || msg.emoji) && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-12px",
                          left: "0px",
                          background: isMe ? "#ffffff" : "#ffffff",
                          border: isMe ? "1px solid rgba(255,255,255,0.3)" : "1px solid #ddd",
                          borderRadius: "50%",
                          padding: "1px 5px",
                          fontSize: "0.8rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      >
                        {msgReactions[msg.id] || msg.emoji}
                      </div>
                    )}

                    
                  </div>
                  {/* Add Reaction button and Emoji Picker — only show for others' messages */}
                  {!isMe && (
                    <div>
                      <button
                        className="btn btn-sm text-muted p-0 mt-1"
                        onClick={() =>
                          setShowPickerFor(showPickerFor === msg.id ? null : msg.id)
                        }
                      >
                        😊
                      </button>
                      {showPickerFor === msg.id && (
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0,0,0,0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 9999,
                          }}
                          onClick={() => setShowPickerFor(null)} // Close on background tap
                        >
                          <div
                            onClick={(e) => e.stopPropagation()} // Prevent background close
                            style={{
                              background: "#fff",
                              borderRadius: "12px",
                              padding: "15px",
                              width: "90%",
                              maxWidth: "350px",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                            }}
                          >
                            <EmojiPicker
                              onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, msg.id)}
                              autoFocusSearch={false}
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={chatEndRef} />
    </>
  );
}

export default GroupChatMessagesByDate;
