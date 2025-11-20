// src/api/chatApi.js
import axiosInstance from "./axiosInstance";
import { USE_MOCK_API, mockResponse } from "./config";
import { getStoredSession } from "./authApi";

/* ===========================
 *  Mock용 유틸
 * =========================== */
const getUserKey = (base) => {
  const session = getStoredSession();
  const userId = session?.user?.id || "guest";
  return `${base}_${userId}`;
};

const CHAT_SESSIONS_KEY = getUserKey("mockChatSessions");
const CHAT_MESSAGES_KEY = getUserKey("mockChatMessages");

const readMock = (key, fallback) =>
  JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));

const writeMock = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

const nowIso = () => new Date().toISOString();

/* ===========================
 *  1. 단일 메시지 분석
 * =========================== */
export const sendQuickMessage = async (message) => {
  if (USE_MOCK_API) {
    const lower = message.toLowerCase();
    let sentiment = "neutral";
    let riskLevel = 1;

    if (lower.includes("힘들") || lower.includes("우울") || lower.includes("죽고")) {
      sentiment = "negative";
      riskLevel = 3;
    } else if (lower.includes("행복") || lower.includes("좋아") || lower.includes("기뻐")) {
      sentiment = "positive";
      riskLevel = 1;
    }

    return mockResponse({
      message: "안녕하세요, 오늘도 수고 많으셨어요. 무슨 일이 있었나요?",
      sentiment,
      riskLevel,
    });
  }

  // ⭐ 백엔드 경로 확인 필요 (예: /chat/message)
  const { data } = await axiosInstance.post("/chat/message", { message });
  return data;
};

/* ===========================
 *  2. 감정 트렌드
 * =========================== */
export const getEmotionTrend = async (days = 7) => {
  if (USE_MOCK_API) {
    const sentiments = ["negative", "neutral", "positive"];
    const trends = Array.from({ length: days }, (_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - idx));
      return {
        date: d.toISOString().slice(0, 10),
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        averageScore: Number((Math.random() * 2 - 1).toFixed(2)),
      };
    });

    return mockResponse({ trends });
  }

  // ⭐ 백엔드 경로 확인 필요 (예: /chat/emotion-trend)
  const { data } = await axiosInstance.get("/chat/emotion-trend", {
    params: { days },
  });
  return data;
};

/* ===========================
 *  3. 채팅 세션 관리
 * =========================== */
const createSession = async (title) => {
  if (USE_MOCK_API) {
    const sessions = readMock(CHAT_SESSIONS_KEY, []);
    const newId = Date.now();
    const updatedAt = nowIso();

    const session = { sessionId: newId, title, updatedAt };
    const next = [session, ...sessions];
    writeMock(CHAT_SESSIONS_KEY, next);

    return mockResponse(session);
  }

  // ⭐ 백엔드 경로 확인 필요 (예: /chat/sessions)
  const { data } = await axiosInstance.post("/chat/sessions", { title });
  return data;
};

const getSessions = async () => {
  if (USE_MOCK_API) {
    const sessions = readMock(CHAT_SESSIONS_KEY, []);
    sessions.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return mockResponse(sessions);
  }

  // ⭐ 백엔드 경로 확인 필요 (예: /chat/sessions)
  const { data } = await axiosInstance.get("/chat/sessions");
  return data;
};

const updateSessionTitle = async (sessionId, title) => {
  if (USE_MOCK_API) {
    const sessions = readMock(CHAT_SESSIONS_KEY, []);
    const updatedAt = nowIso();
    const next = sessions.map((s) =>
      String(s.sessionId) === String(sessionId)
        ? { ...s, title, updatedAt }
        : s
    );
    writeMock(CHAT_SESSIONS_KEY, next);

    return mockResponse({
      sessionId,
      title,
      updatedAt,
    });
  }

  // ⭐ 백엔드 경로 확인 필요
  const { data } = await axiosInstance.put(
    `/chat/sessions/${sessionId}/title`,
    { title }
  );
  return data;
};

const deleteSession = async (sessionId) => {
  if (USE_MOCK_API) {
    const sessions = readMock(CHAT_SESSIONS_KEY, []);
    const messagesDb = readMock(CHAT_MESSAGES_KEY, {});

    const nextSessions = sessions.filter(
      (s) => String(s.sessionId) !== String(sessionId)
    );
    delete messagesDb[sessionId];

    writeMock(CHAT_SESSIONS_KEY, nextSessions);
    writeMock(CHAT_MESSAGES_KEY, messagesDb);

    return mockResponse({ success: true });
  }

  // ⭐ 백엔드 경로 확인 필요
  await axiosInstance.delete(`/chat/sessions/${sessionId}`);
  return { success: true };
};

/* ===========================
 *  4. 세션별 메시지
 * =========================== */
const getSessionMessages = async (sessionId) => {
  if (USE_MOCK_API) {
    const messagesDb = readMock(CHAT_MESSAGES_KEY, {});
    const list = messagesDb[sessionId] ?? [];
    return mockResponse(list);
  }

  // ⭐ 백엔드 경로 확인 필요
  const { data } = await axiosInstance.get(
    `/chat/sessions/${sessionId}/messages`
  );
  return data;
};

const sendSessionMessage = async (sessionId, message) => {
  if (USE_MOCK_API) {
    const messagesDb = readMock(CHAT_MESSAGES_KEY, {});
    const existing = messagesDb[sessionId] ?? [];

    const createdAt = nowIso();

    const userMsg = {
      messageId: Date.now(),
      message,
      isUserMessage: true,
      sentiment: "neutral",
      createdAt,
    };

    const botMsg = {
      messageId: Date.now() + 1,
      message: "정말 고생 많으셨어요. 조금 더 이야기해 주실 수 있을까요?",
      isUserMessage: false,
      sentiment: null,
      createdAt,
    };

    const nextList = [...existing, userMsg, botMsg];
    messagesDb[sessionId] = nextList;
    writeMock(CHAT_MESSAGES_KEY, messagesDb);

    return mockResponse(botMsg);
  }

  // ⭐ 백엔드 경로 확인 필요
  const { data } = await axiosInstance.post(
    `/chat/message/${sessionId}`,
    { message }
  );

  return data;
};

/* ===========================
 *  통합 export
 * =========================== */
export const chatAPI = {
  sendQuickMessage,
  getEmotionTrend,
  createSession,
  getSessions,
  updateSessionTitle,
  deleteSession,
  getSessionMessages,
  sendSessionMessage,
};