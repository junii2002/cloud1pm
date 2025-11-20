// cloud1pm/frontend/frontend-929b8301344f7e5ea9f6dbfadb172fb99bfdfec4/src/pages/CharacterPage.jsx

import React, { useEffect, useState } from "react";
import "./CharacterPage.css";
import { userAPI } from "../api/userApi"; 

// 이미지 Import (경로 확인 필요)
import waterImg from "../assets/character/water.png";
import snowImg from "../assets/character/snow.png";
import babyImg from "../assets/character/baby.png";
import noonsongImg from "../assets/character/noonsong.png";

// 캐릭터 성장 단계 정의
const CHARACTER_STAGES = [
  { minLevel: 1, maxLevel: 2, name: "물", img: waterImg, gradient: "gradient-blue" },
  { minLevel: 3, maxLevel: 4, name: "얼음결정", img: snowImg, gradient: "gradient-cyan" },
  { minLevel: 5, maxLevel: 6, name: "아기 눈송이", img: babyImg, gradient: "gradient-indigo" },
  { minLevel: 7, maxLevel: 8, name: "눈송이", img: noonsongImg, gradient: "gradient-purple" },
];

const CharacterPage = () => {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feeding, setFeeding] = useState(false);
  const [feedSuccess, setFeedSuccess] = useState(false);

  // 현재 캐릭터 단계 계산
  const currentStage = CHARACTER_STAGES.find(
    (s) => character && character.level >= s.minLevel && character.level <= s.maxLevel
  ) || CHARACTER_STAGES[0];

  // 서버에서 캐릭터 정보 가져오기
  const fetchCharacterData = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getCharacterInfo();
      setCharacter({
        name: "눈송이", // 이름은 고정이라고 가정
        level: data.characterLevel,
        totalPoints: data.rice,
        totalFed: data.feedCount, // 현재 레벨에서 먹인 횟수
        daysStreak: data.consecutiveDays,
      });
    } catch (error) {
      console.error("❌ 캐릭터 로드 실패:", error);
      // 에러 시 character = null 상태 유지
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacterData();
  }, []);

  // 밥 주기 핸들러
  const handleFeed = async () => {
    if (!character || feeding) return;

    // 💡 [수정] 밥이 0개 이하면 버튼 비활성화로 처리하고 추가 알림은 띄우지 않습니다.
    if (character.totalPoints <= 0) {
      return; 
    }

    setFeeding(true);
    setFeedSuccess(false);

    try {
      // 서버에 밥 주기 요청 (FeedCharacterResponse DTO 반환)
      const updatedData = await userAPI.feedCharacter();
      console.log("✅ Feed response:", updatedData);
      
      setFeedSuccess(true);
      
      // 💡 [핵심 수정] 받은 데이터(newRiceCount, newLevel)를 기반으로 상태를 즉시 업데이트
      const isLevelUp = updatedData.newLevel > character.level;
      
      setCharacter(prev => ({
        ...prev,
        level: updatedData.newLevel,
        totalPoints: updatedData.newRiceCount, // 보유 밥 업데이트 (백엔드에서 요구량만큼 차감)
        // 레벨업 시 0으로 리셋, 아니면 +1 (백엔드 로직과 일치)
        totalFed: isLevelUp ? 0 : (prev.totalFed + 1), 
      }));
      
      // 백엔드 메시지를 사용자에게 알림 (레벨업 축하 메시지 등)
      alert(updatedData.message);

      // 1초 후 버튼 상태 초기화
      setTimeout(() => setFeedSuccess(false), 1000);
      
    } catch (error) {
      console.error("🔥 밥 주기 실패:", error);
      
      const axiosError = error;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message;

        // 밥 부족으로 인해 400 Bad Request가 발생해도 알림을 띄우지 않음 (요구사항 반영)
        // 다만, 다른 종류의 서버 오류는 알림
        if (status !== 400) { 
            alert(`오류가 발생했습니다: ${message || status}`);
        }
      } else if (axiosError.request) {
        alert("서버로부터 응답이 없습니다. 네트워크 연결을 확인하세요.");
      } else {
        alert("요청 설정 중 오류가 발생했습니다.");
      }
    } finally {
      setFeeding(false);
    }
  };

  // 로딩 및 에러 처리
  if (loading) return <div className="loading-container"><div className="loading-spinner">❄️</div></div>;
  if (!character) return <div className="error-container">캐릭터 정보를 불러올 수 없습니다.</div>;

  // 밥 주기 횟수 (level-up은 5번당 한 번)
  const feedCountToLevelUp = 5; 
  const currentFed = character.totalFed % feedCountToLevelUp;
  const progressPercent = (currentFed / feedCountToLevelUp) * 100;
  const remainingFeeds = feedCountToLevelUp - currentFed;

  return (
    <div className="character-page">
      <div className="character-container">
        <div className="page-header">
          <h1 className="page-title">나의 캐릭터</h1>
        </div>

        <div className="character-main-card">
          <div className={`card-background ${currentStage.gradient}`}></div>
          
          <div className="character-info-section">
            <div className="character-avatar-wrapper">
              <div className="character-avatar">
                <img src={currentStage.img} alt={currentStage.name} style={{width:"100%", height:"100%", objectFit:"contain"}}/>
              </div>
              <div className="character-level-badge">Lv.{character.level}</div>
            </div>
            <div className="character-details">
              <h2 className="character-name">{character.name}</h2>
              <p className="character-message">오늘도 행복한 하루!</p>
              
              {/* 성장 진행도 섹션 - 상태 기반으로 즉시 업데이트 */}
              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">성장 진행도</span>
                  <span className="progress-value">{currentFed}/{feedCountToLevelUp}</span>
                </div>
                <div className="progress-bar-wrapper">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="progress-description">
                  다음 레벨업까지 <strong>{remainingFeeds}번</strong> 남았어요!
                </p>
              </div>

            </div>
          </div>

          <div className="button-container">
            <button
              onClick={handleFeed}
              disabled={feeding || character.totalPoints <= 0}
              className={`feed-button ${feeding ? 'feed-button-disabled' : ''} ${feedSuccess ? 'feed-button-success' : ''}`}
            >
              {feeding
                ? "⏳ 밥 주는 중..."
                : feedSuccess
                ? "냠냠! 맛있어요 😋"
                : character.totalPoints <= 0
                ? "밥 부족 (게시글 쓰기)"
                : `🍚 밥 주기 (${character.totalPoints}개 보유)`}
            </button>
          </div>
        </div>

        {/* 연속 출석 및 현재 레벨 정보 카드 */}
        <div className="content-grid">
            <div className="content-card stat-amber">
              <h3 className="card-title">연속 출석</h3>
              <p className="stat-value">{character.daysStreak}일째 ⭐</p>
              <p className="stat-label">연속 출석하면 매일 밥 1개를 받아요!</p>
            </div>
            <div className="content-card stat-purple">
              <h3 className="card-title">현재 레벨</h3>
              <p className="stat-value">Lv.{character.level}</p>
              <p className="stat-label">총 {character.totalFed}번 밥을 먹었어요!</p>
            </div>
        </div>

        {/* 하단 성장 과정 리스트 */}
        <div className="content-grid">
          <div className="content-card">
            <h3 className="card-title">성장 과정</h3>
            <div className="stages-list">
              {CHARACTER_STAGES.map(s => (
                <div
                  key={s.name}
                  className={`stage-item ${character.level >= s.minLevel && character.level <= s.maxLevel ? 'stage-item-active' : ''}`}
                >
                  <img src={s.img} alt="" style={{width:24, height:24, marginRight:8}}/>
                  <span>{s.name} (Lv.{s.minLevel}~{s.maxLevel})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 밥 획득 방법 */}
          <div className="content-card">
              <h3 className="card-title">밥 획득 방법</h3>
              <div className="stages-list">
                  <div className="stage-item"><span>게시글 작성하기</span><span>+1 🍚</span></div>
                  <div className="stage-item"><span>댓글 작성</span><span>+1 🍚</span></div>
                  <div className="stage-item"><span>좋아요 누르기</span><span>+1 🍚</span></div>
                  <div className="stage-item"><span>응원 메시지 남기기</span><span>+1 🍚</span></div>
                  <div className="stage-item"><span>연속 출석</span><span>+1 🍚</span></div>
                  <div className="stage-item"><span>7일 연속 출석 보너스</span><span>+5 🍚</span></div>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CharacterPage;