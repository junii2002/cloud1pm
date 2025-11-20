import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import "./MessageInput.css";

export default function MessageInput({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="메시지를 입력하세요..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        disabled={disabled}
      />
      <button aria-label="send" onClick={handleSend} disabled={disabled}>
        <FiSend />
      </button>
    </div>
  );
}