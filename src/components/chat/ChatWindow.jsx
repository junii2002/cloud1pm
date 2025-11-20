import React from 'react';
import './ChatWindow.css';

export default function ChatWindow({ messages }) {
  return (
    <div className="chat-window">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`chat-bubble ${msg.isUserMessage ? "user" : "bot"}`}
        >
          {msg.message}
        </div>
      ))}
    </div>
  );
}
