// src/pages/LoginPage.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const { login, googleLogin, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("🔵 [LoginPage] 상태 변경:", { loading, isAuthenticated, user });
    
    if (!loading && isAuthenticated) {
      console.log("✅ [LoginPage] 인증됨 → /chat 이동");
      navigate("/chat");
    }
  }, [loading, isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login({
        username: form.username,
        password: form.password,
      });
      
      // navigate는 useEffect에서 자동으로 처리됨
      // 하지만 만약을 위해 명시적으로도 추가
      if (res && res.token && res.user) {
        navigate("/chat", { replace: true });
      }
    } catch (err) {

  let backendMsg =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "";

  // 정확한 조건 처리
  let errorMessage = "잘못된 아이디 또는 비밀번호입니다.";

  // 서버 연결 문제일 때만 별도 처리
  if (err.request && !err.response) {
    errorMessage = "서버와 연결할 수 없습니다.";
  }

  setError(errorMessage);
  setForm({ username: "", password: "" })
} finally {
      setIsSubmitting(false);
}
}

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("🔵 [LoginPage] 구글 로그인 시도");
    setError(null);
    
    try {
      const res = await googleLogin(credentialResponse.credential);
      console.log("✅ [LoginPage] 구글 로그인 성공:", res);
      
      if (res && res.token && res.user) {
        navigate("/chat", { replace: true });
      }
    } catch (err) {
      console.error("❌ [LoginPage] 구글 로그인 실패:", err);
      setError("구글 로그인 실패");
    }
  };

  const handleGoogleError = () => {
    console.error("❌ [LoginPage] 구글 로그인 에러");
    setError("구글 로그인 실패");
  };

  return (
    <div className="plain-layout">
      <div className="auth-card">
        <h1 className="auth-title">로그인</h1>

        {error && (
          <div className="auth-error" style={{
            padding: "12px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <input
              type="text"
              name="username"
              className="auth-input"
              value={form.username}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <input
              type="password"
              name="password"
              className="auth-input"
              value={form.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <button 
            className="auth-submit"
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div style={{ marginTop: "16px" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        <div className="auth-footer">
          계정이 없나요? <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;