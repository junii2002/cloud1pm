// SignupPage.jsx

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import "./AuthPage.css";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    username: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // 입력 시 해당 필드의 에러 제거
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 이메일 검증
    if (!form.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    // 유저네임 검증
    if (!form.username) {
      newErrors.username = "유저네임을 입력해주세요.";
    } else if (form.username.length < 3) {
      newErrors.username = "유저네임은 3자 이상이어야 합니다.";
    }

    // 닉네임 검증
    if (!form.nickname) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    }

    // 비밀번호 검증
    if (!form.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (form.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다.";
    }

    // 비밀번호 확인 검증
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "비밀번호를 다시 입력해주세요.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("🔵 [SignupPage] 회원가입 폼 제출:", form);

    // 유효성 검사
    if (!validateForm()) {
      console.log("❌ [SignupPage] 유효성 검사 실패:", errors);
      return;
    }

    console.log("✅ [SignupPage] 유효성 검사 통과 → 온보딩 페이지로 이동");

    // 온보딩 페이지로 이동
    navigate("/onboarding", {
      state: {
        signupInfo: form,
      },
    });
  };

  return (
    <div className="plain-layout">
      <div className="auth-card">
        <h1 className="auth-title">회원가입</h1>
        <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "24px" }}>
          기본 정보를 입력한 후 온보딩을 진행합니다
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">이메일</label>
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginTop: "4px" }}>
                {errors.email}
              </div>
            )}
          </div>

          <div className="auth-field">
            
            <label className="auth-label">아이디</label>
            <input
              type="text"
              name="username"
              className="auth-input"
              placeholder="로그인할 아이디를 입력해주세요."
              value={form.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginTop: "4px" }}>
                {errors.username}
              </div>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label">닉네임</label>
            <input
              type="text"
              name="nickname"
              className="auth-input"
              placeholder="앱에서 사용할 닉네임을 입력해주세요."
              value={form.nickname}
              onChange={handleChange}
              required
            />
            {errors.nickname && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginTop: "4px" }}>
                {errors.nickname}
              </div>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <input
              type="password"
              name="password"
              className="auth-input"
              placeholder="6자 이상"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginTop: "4px" }}>
                {errors.password}
              </div>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label">비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              className="auth-input"
              placeholder="비밀번호 재입력"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginTop: "4px" }}>
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <button type="submit" className="auth-submit">
            다음 단계 → 온보딩
          </button>
        </form>

        <div className="auth-footer">
          이미 계정이 있나요? <a href="/login">로그인</a>
        </div>
      </div>
    </div>
  );
}