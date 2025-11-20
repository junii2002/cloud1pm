import React, { useEffect, useRef, useState } from "react";
import { FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // 👈 1. useNavigate import
import ChatWindow from "../components/chat/ChatWindow";
import MessageInput from "../components/chat/MessageInput";
import ChatSidebar from "../components/chat/ChatSidebar";

import { chatAPI } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";

import "../styles.css";
import "./ChatPage.css";

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollerRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate(); // 👈 2. useNavigate 훅 사용

  const displayName =
    user?.nickname ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "친구";

  /* ----------------------------------------------------
   * 1) 페이지 로드시 세션 목록 가져오기 & 새 세션 생성
   * ---------------------------------------------------- */
  useEffect(() => {
    const initSessions = async () => {
      try {
        setIsLoading(true);
        const sessionList = await chatAPI.getSessions();
        
        if (sessionList.length > 0) {
          // 기존 세션이 있으면 가장 최근 세션 선택
          setSessions(sessionList);
          setCurrentSessionId(sessionList[0].sessionId);
          
          // 해당 세션의 메시지 로드
          const msgs = await chatAPI.getSessionMessages(sessionList[0].sessionId);
          setMessages(msgs);
        } else {
          // 세션이 없으면 새로 생성
          const newSession = await chatAPI.createSession("새로운 대화");
          setSessions([newSession]);
          setCurrentSessionId(newSession.sessionId);
          setMessages([]);
        }
      } catch (err) {
        console.error("세션 초기화 실패:", err);
        setError("채팅을 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    initSessions();
  }, []);

  /* ----------------------------------------------------
   * 2) 세션 전환시 메시지 로드
   * ---------------------------------------------------- */
  useEffect(() => {
    if (!currentSessionId) return;

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const msgs = await chatAPI.getSessionMessages(currentSessionId);
        setMessages(msgs);
      } catch (err) {
        console.error("메시지 로드 실패:", err);
        setError("메시지를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [currentSessionId]);

  /* ----------------------------------------------------
   * 3) 메시지 스크롤 자동 최하단
   * ---------------------------------------------------- */
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages]);

  /* ----------------------------------------------------
   * 4) 새 채팅 생성
   * ---------------------------------------------------- */
  const handleCreateSession = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const title = `${today} 대화`;

      const newSession = await chatAPI.createSession(title);

      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.sessionId);
      setMessages([]);
    } catch (err) {
      console.error("세션 생성 실패:", err);
      setError("새 채팅을 만들 수 없습니다.");
    }
  };

  /* ----------------------------------------------------
   * 5) 세션 선택
   * ---------------------------------------------------- */
  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  /* ----------------------------------------------------
   * 6) 세션 삭제
   * ---------------------------------------------------- */
  const handleDeleteSession = async (sessionId) => {
    try {
      await chatAPI.deleteSession(sessionId);
      
      const remainingSessions = sessions.filter(
        (s) => s.sessionId !== sessionId
      );
      setSessions(remainingSessions);

      // 삭제한 세션이 현재 선택된 세션이면
      if (currentSessionId === sessionId) {
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].sessionId);
        } else {
          // 세션이 하나도 없으면 새로 생성
          handleCreateSession();
        }
      }
    } catch (err) {
      console.error("세션 삭제 실패:", err);
      setError("채팅을 삭제할 수 없습니다.");
    }
  };

  /* ----------------------------------------------------
   * 7) 세션 제목 수정
   * ---------------------------------------------------- */
  const handleUpdateTitle = async (sessionId, newTitle) => {
    try {
      const updated = await chatAPI.updateSessionTitle(sessionId, newTitle);
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === sessionId
            ? { ...s, title: updated.title, updatedAt: updated.updatedAt }
            : s
        )
      );
    } catch (err) {
      console.error("제목 수정 실패:", err);
      setError("제목을 수정할 수 없습니다.");
    }
  };

  /* ----------------------------------------------------
   * 8) 메시지 전송
   * ---------------------------------------------------- */
  const handleSend = async (input) => {
    const trimmed = input.trim();
    if (!trimmed || isSending || !currentSessionId) return;

    setError(null);

    // 사용자 메시지 추가
    const userMsg = {
      message: trimmed,
      isUserMessage: true,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsSending(true);

    try {
      // 세션 기반 메시지 전송 API 사용
      const response = await chatAPI.sendSessionMessage(currentSessionId, trimmed);

      // 봇 메시지 추가
      const botMsg = {
        message: response.message,
        isUserMessage: false,
        sentiment: response.sentiment,
        createdAt: response.createdAt,
      };

      setMessages((prev) => [...prev, botMsg]);

      // 세션 목록에서 현재 세션을 맨 위로 이동 (최근 업데이트 시간 반영)
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.sessionId === currentSessionId
            ? { ...s, updatedAt: new Date().toISOString() }
            : s
        );
        return updated.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      setError("메시지를 전송하는 중 문제가 발생했습니다.");

      setMessages((prev) => [
        ...prev,
        {
          message: "죄송해요, 지금은 답변을 드릴 수 없어요.",
          isUserMessage: false,
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const hasMessages = messages.length > 0;
  const notReady = !currentSessionId || isLoading;

  return (
    <div className="chat-page-container">
      {/* 채팅 사이드바 */}
      <ChatSidebar
      sessions={sessions}
      currentSessionId={currentSessionId}
      onSelectSession={handleSelectSession}
      onCreateSession={handleCreateSession}
      onDeleteSession={handleDeleteSession}
      onUpdateTitle={handleUpdateTitle}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    />

      {/* 메인 채팅 영역 */}
      <div className="layout chat-page">
        <main className="chat-main">
          <header className="chat-header">
            <div className="chat-header-left">
              <FiInfo className="chat-header-icon" />
              <div className="chat-header-text-group">
                <span className="chat-header-greeting">
                  {displayName}님, 안녕하세요!
                </span>
                <span className="chat-header-text">
                  대화 내용을 분석하여 감정 상태를 파악하고, 상황에 맞는 도움을 제공합니다.
                </span>
              </div>
             
            </div>

          </header>

          <div className="chat-center">
            {!hasMessages ? (
              <div className="empty-chat">
                <div className="empty-center">
                  <div className="welcome-message">
                    <h1>오늘 하루 어떤 감정을 느꼈나요?</h1>
                    <p>편안하게 이야기를 시작해보세요</p>
                  </div>
                  <MessageInput 
                    onSend={handleSend} 
                    disabled={isSending || notReady} 
                  />
                  <div className="start-hint">준비되면 얘기해 주세요.</div>
                </div>
              </div>
            ) : (
              <>
                <div className="chat-scroller" ref={scrollerRef}>
                  <ChatWindow messages={messages} />
                </div>

                <div className="chat-input-wrap">
                  <MessageInput 
                    onSend={handleSend} 
                    disabled={isSending || notReady}
                  />
                  <div className="disclaimer">준비되면 얘기해 주세요.</div>
                </div>
              </>
            )}

            {error && <div className="chat-error">{error}</div>}
            {isLoading && <div className="chat-loading">불러오는 중...</div>}
          </div>
        </main>
      </div>
    </div>
  );
}