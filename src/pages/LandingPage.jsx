import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    // 프론트 로그인 페이지로 이동
    // 이미 /login 라우트가 있으면 그대로 쓰면 되고,
    // 백엔드 OAuth 바로 호출하고 싶으면 window.location.href 변경하면 됨.
    navigate("/login");
    // 또는: window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">Cloud1PM</div>
      </header>

      <main className="landing-main">
        <div className="landing-content">
          <h1 className="landing-title">
            오늘 하루☀️, <br />
            정서 지지 챗봇과 같이 숨 고르기
          </h1>
          <p className="landing-subtitle">
            대화를 통해 감정을 기록하고, <br />
            나에게 맞는 작은 처방을 추천받는 정서 지지 서비스입니다.
          </p>

          <ul className="landing-features">
            <li>하루 대화를 바탕으로 감정 상태를 분석해요.</li>
            <li>미리 설정한 나만의 비밀 처방전을 상황에 맞게 추천해줘요.</li>
            <li>감정 위험도가 높아질 때는 조심스럽게 알림을 줘요.</li>
          </ul>

          <button className="landing-button" onClick={handleLoginClick}>
            로그인하러 가기
          </button>
        </div>

      </main>

      <footer className="landing-footer">
        <span>© 2025 Cloud1PM 정서 지지 챗봇</span>
      </footer>
    </div>
  );
};

export default LandingPage;
