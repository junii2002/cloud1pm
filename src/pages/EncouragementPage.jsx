// src/pages/EncouragementPage.jsx
import React, { useState } from "react";
import { userAPI } from "../api/userApi";
import "./EncouragementPage.css";
import { useNavigate } from "react-router-dom";

export default function EncouragementPage() {
  const [input, setInput] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState(""); // 👈 감정 상태 추가
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const recommended = [
    "힘든 시간도 지나갈거야",
    "천천히 해도 괜찮아",
    "오늘도 잘 해낼 수 있어",
    "너는 충분히 잘하고 있어",
  ];

  // 👇 감정 옵션 정의
  const emotions = [
    { id: "기쁨", emoji: "😊", label: "기쁨" },
    { id: "슬픔", emoji: "😢", label: "슬픔" },
    { id: "분노", emoji: "😠", label: "분노" },
    { id: "불안", emoji: "😰", label: "불안" },
    { id: "무감정", emoji: "😐", label: "무감정" },
  ];

  const handleSubmit = async () => {
    if (!input.trim()) {
      alert("응원 메시지를 입력해주세요.");
      return;
    }

    if (!selectedEmotion) {
      alert("지금 느끼는 감정을 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 1) 응원 메시지 저장 (emotion 포함)
      await userAPI.saveEncouragement({
        message: input.trim(),
        emotion: selectedEmotion, // 👈 [수정] 감정 데이터 전송
      });

      // 2) 사용자 상태 갱신(밥 + 1을 백엔드가 처리)
      // userAPI.getUserStatus()가 따로 정의되어 있지 않으므로, 
      // 현재는 getCharacterInfo가 동일한 역할을 한다고 가정하고 그대로 사용합니다.
      const newStatus = await userAPI.getCharacterInfo();

      console.log("새 상태:", newStatus);

      setSuccess(true);
      setInput("");
      setSelectedEmotion("");
      
      // 밥 획득 성공 후 알림 추가
      alert("응원 메시지가 저장되었고, 밥 1개를 획득했어요! 🍚");

    } catch (err) {
      // 서버 에러 메시지 확인 및 출력
      console.error("메시지 전송 실패 오류:", err.response?.data || err.message);
      alert("메시지 전송 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="encouragement-page">
      <h1>오늘의 응원 메시지</h1>
      <p className="sub">
        오늘 하루를 시작하는 나에게<br />
        응원의 메시지를 보내주세요.
      </p>

      <div className="emotion-section">
        <div className="recommend-title">지금 느끼는 감정</div>
        <div className="emotion-buttons">
          {emotions.map((emotion) => (
            <button
              key={emotion.id}
              className={`emotion-btn ${selectedEmotion === emotion.id ? "selected" : ""}`}
              onClick={() => setSelectedEmotion(emotion.id)}
            >
              <span className="emotion-emoji">{emotion.emoji}</span>
              <span className="emotion-label">{emotion.label}</span>
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="encouragement-input"
        placeholder="예) 오늘도 최선을 다한 내가 자랑스러워"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="recommend-title">추천 메시지:</div>
      <div className="recommend-box">
        {recommended.map((msg, i) => (
          <button
            key={i}
            className="recommend-chip"
            onClick={() => setInput(msg)}
          >
            {msg}
          </button>
        ))}
      </div>
    
      <div className="btn-row">
        <button
          className="sub-btn"
          onClick={() => navigate("/chat")}
        >
          나중에 할게요
        </button>

        <button
          className="main-btn"
          onClick={handleSubmit}
          disabled={loading || !selectedEmotion || !input.trim()}
        >
          {loading ? "전송 중..." : "확인 (밥 +1 🍚)"}
        </button>
      </div>


      {success && (
        <div className="success-text">응원 메시지가 저장되었어요!</div>
      )}
    </div>
  );
}