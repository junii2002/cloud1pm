import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { signup } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const riskLevels = [
  { id: 1, description: "살짝 불편함" },
  { id: 2, description: "기분이 처짐" },
  { id: 3, description: "우울/무기력" },
  { id: 4, description: "많이 지침" },
  { id: 5, description: "전문 도움 필요" },
];

const solutionCandidates = [
  "짧게 산책하기",
  "따뜻한 차 마시기",
  "깊게 호흡하기",
  "좋아하는 음악 듣기",
  "일기 쓰기",
  "가벼운 스트레칭",
  "관심 있는 책 읽기",
  "명상 앱 따라 하기",
  "친구에게 연락하기",
  "화창한 곳 바라보기",
  "기분 전환용 영화 보기",
  "따뜻한 목욕 즐기기",
  "충분한 수면 확보하기",
  "전문 상담 예약하기",
  "감정 일기 정리하기",
  "가족과 대화하기",
  "위기 상담 전화하기",
  "나에게 응원 메시지 보내기",
  "SNS 잠시 끄기",
  "좋아하는 취미 하기",
];

const solutionIcons = {
  "짧게 산책하기": "🚶‍♀️",
  "따뜻한 차 마시기": "🍵",
  "깊게 호흡하기": "🫁",
  "좋아하는 음악 듣기": "🎧",
  "일기 쓰기": "📝",
  "가벼운 스트레칭": "🤸",
  "관심 있는 책 읽기": "📚",
  "명상 앱 따라 하기": "🧘",
  "친구에게 연락하기": "📱",
  "화창한 곳 바라보기": "🌤️",
  "기분 전환용 영화 보기": "🎬",
  "따뜻한 목욕 즐기기": "🛁",
  "충분한 수면 확보하기": "😴",
  "전문 상담 예약하기": "📞",
  "감정 일기 정리하기": "📓",
  "가족과 대화하기": "👪",
  "위기 상담 전화하기": "🆘",
  "나에게 응원 메시지 보내기": "💌",
  "SNS 잠시 끄기": "📴",
  "좋아하는 취미 하기": "🎨",
};

const levelEmojis = {
  1: "😊",
  2: "😀",
  3: "🙂",
  4: "🥲",
  5: "💜",
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const signupInfo = location.state?.signupInfo;

  const [step, setStep] = useState(1);
  const [solutions, setSolutions] = useState({ 1: [], 2: [], 3: [], 4: [], 5: [] });
  const [customInput, setCustomInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔵 [OnboardingPage] signupInfo:", signupInfo);
    
    if (!signupInfo) {
      console.warn("⚠️ [OnboardingPage] signupInfo 없음 → /signup 리다이렉트");
      alert("회원가입 정보가 없습니다. 다시 시도해주세요.");
      navigate("/signup");
    }
  }, [signupInfo, navigate]);

  const handleSelect = (activity) => {
    setSolutions((prev) => {
      const updated = prev[step].includes(activity)
        ? prev[step].filter((v) => v !== activity)
        : [...prev[step], activity];
      return { ...prev, [step]: updated };
    });
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || solutions[step].includes(trimmed)) return;
    setSolutions((prev) => ({
      ...prev,
      [step]: [...prev[step], trimmed],
    }));
    setCustomInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleAddCustom();
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    console.log("🔵 [OnboardingPage] 제출 시작");
    setIsSubmitting(true);
    setError(null);

    try {
      // 1) riskSolutions 포맷팅
      const formattedSolutions = Object.entries(solutions).flatMap(([level, items]) =>
        items.map((solution) => ({
          riskLevel: Number(level),
          solution,
        }))
      );

      console.log("🔵 [OnboardingPage] formattedSolutions:", formattedSolutions);

      // 2) 회원가입 요청 페이로드
      const signupPayload = {
        email: signupInfo.email,
        username: signupInfo.username,
        nickname: signupInfo.nickname || signupInfo.username,
        password: signupInfo.password,
        confirmPassword: signupInfo.confirmPassword,
        profileImageUrl: "/default/user_profile.png",
        riskSolutions: formattedSolutions,
      };

      console.log("🔵 [OnboardingPage] 회원가입 요청:", signupPayload);

      // 3) 회원가입 API 호출
      const signupResult = await signup(signupPayload);
      // 성공 메시지 
      alert("회원가입이 완료되었습니다! 환영합니다 😊");
      navigate("/login", { replace: true });
      
    } catch (err) {
      
      let errorMessage = "회원가입 중 오류가 발생했습니다.";
      
      if (err.response) {
        console.error("❌ 백엔드 에러 응답:", err.response.data);
        errorMessage = err.response.data?.message || 
                      err.response.data?.error || 
                      `서버 오류 (${err.response.status})`;
      } else if (err.request) {
        console.error("❌ 응답 없음:", err.request);
        errorMessage = "서버와 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.";
      } else {
        console.error("❌ 요청 설정 오류:", err.message);
        errorMessage = err.message || "알 수 없는 오류";
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const current = riskLevels.find((r) => r.id === step);
  const currentEmoji = levelEmojis[step];

  const candidates = useMemo(() => [...solutionCandidates].sort(), []);

  if (!signupInfo) {
    return <div>로딩 중...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.stepInfo}>
          <span style={styles.stepText}>Step {step} of 5</span>
        </div>
        <div style={styles.progressBar}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                ...styles.progressSegment,
                backgroundColor: i <= step ? "#7c3aed" : "#e5e7eb",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {error && (
          <div style={{
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

        <div style={styles.iconContainer}>
          <span style={styles.icon}>{currentEmoji}</span>
        </div>

        <h2 style={styles.title}>나만의 마음 돌봄 방법</h2>
        <p style={styles.subtitle}>감정 상태에 따라 도움이 되는 해결책을 저장해보세요</p>

        <div style={styles.card}>
          <div style={styles.levelHeader}>
            <h3 style={styles.levelTitle}>LEVEL {step}/5</h3>
            <div style={styles.levelDots}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  style={{
                    ...styles.dot,
                    backgroundColor: i <= step ? "#7c3aed" : "#d1d5db",
                  }}
                />
              ))}
            </div>
          </div>

          <p style={styles.levelDescription}>{current.description}</p>

          <div style={styles.activityGrid}>
            {candidates.map((activity) => (
              <button
                key={activity}
                onClick={() => handleSelect(activity)}
                disabled={isSubmitting}
                style={{
                  ...styles.activityButton,
                  ...(solutions[step].includes(activity)
                    ? styles.activityButtonSelected
                    : {}),
                  ...(isSubmitting ? { opacity: 0.6, cursor: "not-allowed" } : {})
                }}
              >
                <span style={styles.activityIcon}>{solutionIcons[activity] || "✨"}</span>
                <span style={styles.activityText}>{activity}</span>
              </button>
            ))}
          </div>

          <div style={styles.customInputContainer}>
            <input
              type="text"
              placeholder="기타 활동 입력"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              style={styles.customInput}
            />
          </div>

          <div style={styles.navRow}>
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1 || isSubmitting}
              style={{
                ...styles.navButton,
                ...(step === 1 || isSubmitting ? styles.navButtonDisabled : {}),
              }}
            >
              이전 단계
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              style={{
                ...styles.navButton,
                ...(isSubmitting ? styles.navButtonDisabled : {})
              }}
            >
              {isSubmitting ? "처리 중..." : (step < 5 ? "다음 단계 →" : "회원가입 완료")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  header: {
    padding: "24px 24px 16px",
    backgroundColor: "white",
  },
  stepInfo: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "10px",
  },
  stepText: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
  },
  progressBar: {
    display: "flex",
    gap: "8px",
    height: "4px",
  },
  progressSegment: {
    flex: 1,
    borderRadius: "2px",
    transition: "background-color 0.3s",
  },
  content: {
    flex: 1,
    padding: "32px 24px",
    maxWidth: "640px",
    width: "100%",
    margin: "0 auto",
  },
  iconContainer: {
    textAlign: "center",
    marginBottom: "16px",
  },
  icon: { fontSize: "48px" },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: "8px",
    color: "#111827",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "32px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  levelHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  levelTitle: { fontSize: "16px", fontWeight: "600", color: "#111827" },
  levelDots: { display: "flex", gap: "6px" },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  levelDescription: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "20px",
  },
  activityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  },
  activityButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "14px",
  },
  activityButtonSelected: {
    backgroundColor: "#ede9fe",
    border: "1px solid #7c3aed",
  },
  activityIcon: { fontSize: "16px" },
  activityText: { flex: 1 },
  customInputContainer: { marginBottom: "20px" },
  customInput: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  navRow: {
    marginTop: "24px",
    display: "flex",
    gap: "12px",
  },
  navButton: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    backgroundColor: "#7c3aed",
    color: "white",
  },
  navButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};

export default OnboardingPage;