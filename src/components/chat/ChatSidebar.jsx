// src/components/chat/ChatSidebar.jsx
import React, { useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "./ChatSidebar.css";
import { useNavigate } from "react-router-dom";

export default function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onUpdateTitle,
  sidebarOpen,
  onToggleSidebar,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const navigate = useNavigate();

  /* -------------------------
   *  사이드바 닫힌 상태 (열기 버튼만)
   * ------------------------- */
  if (!sidebarOpen) {
    return (
      <div className="chat-sidebar-collapsed" onClick={onToggleSidebar}>
        <FiChevronRight size={22} />
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  return (
    <div className="chat-sidebar">
      {/* 🔥 채팅 라인 = 열기/닫기 버튼이 위치하는 핵심 라인 */}
      <div className="chat-sidebar-header">
        <button className="chat-sidebar-new-btn" onClick={onCreateSession}>
          <FiPlus size={18} />
        </button>

        {/* ◀ 닫기 버튼 */}
        <button className="chat-sidebar-collapse-btn" onClick={onToggleSidebar}>
          <FiChevronLeft size={20} />
        </button>
      </div>

      {/* 응원하러가기 버튼 */}
      <button
        className="chat-sidebar-encourage-btn"
        onClick={() => navigate("/encouragement")}
      >
        오늘의 응원하러가기 (밥 +1 🍚)
      </button>

      {/* 목록 */}
      <div className="chat-sidebar-list">
        {sessions.length === 0 ? (
          <div className="chat-sidebar-empty">
            <p>저장된 채팅이 없습니다</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              className={`chat-sidebar-item ${
                currentSessionId === session.sessionId ? "active" : ""
              }`}
            >
              {/* 제목 수정 모드 */}
              {editingId === session.sessionId ? (
                <div className="chat-sidebar-edit-form">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onUpdateTitle(session.sessionId, editTitle);
                        setEditingId(null);
                      }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="chat-sidebar-edit-input"
                    autoFocus
                  />
                  <button
                    className="chat-sidebar-edit-save"
                    onClick={() => {
                      onUpdateTitle(session.sessionId, editTitle);
                      setEditingId(null);
                    }}
                  >
                    <FiCheck />
                  </button>

                  <button
                    className="chat-sidebar-edit-cancel"
                    onClick={() => setEditingId(null)}
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <>
                  {/* 기본 제목 표시 */}
                  <div
                    className="chat-sidebar-item-content"
                    onClick={() => onSelectSession(session.sessionId)}
                  >
                    <div className="chat-sidebar-item-title">{session.title}</div>
                    <div className="chat-sidebar-item-date">
                      {formatDate(session.updatedAt)}
                    </div>
                  </div>

                  <div className="chat-sidebar-item-actions">
                    <button
                      className="chat-sidebar-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(session.sessionId);
                        setEditTitle(session.title);
                      }}
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      className="chat-sidebar-action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("이 채팅을 삭제하시겠습니까?")) {
                          onDeleteSession(session.sessionId);
                        }
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
