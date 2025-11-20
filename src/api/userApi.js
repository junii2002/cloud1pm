import axiosInstance from "./axiosInstance";

/**
 * User API 래퍼
 */

/**
 * 초기 설정 저장
 * POST /api/user/initial-setup
 */
export const saveInitialSetup = async ({ riskSolutions }) => {
  const { data } = await axiosInstance.post("/user/initial-setup", {
    riskSolutions,
  });
  return data;
};

/**
 * 위험도별 해결방안 조회
 * GET /api/user/risk-solutions?riskLevel={n}
 */
export const getRiskSolutions = async ({ riskLevel } = {}) => {
  const params = riskLevel !== undefined ? { riskLevel } : {};
  const { data } = await axiosInstance.get("/user/risk-solutions", {
    params,
  });
  return data;
};

/**
 * 응원 메시지 저장
 * POST /api/user/encouragement
 * * [수정] emotion 필드를 추가로 받아서 전송
 */
export const saveEncouragement = async ({ message, emotion }) => {
  const { data } = await axiosInstance.post("/user/encouragement", { 
    message, 
    emotion 
  });
  return data;
};

/**
 * 최근 응원 메시지 조회
 * GET /api/user/encouragement
 */
export const getEncouragement = async () => {
  const { data } = await axiosInstance.get("/user/encouragement");
  return data;
};

/**
 * 사용자 상태 조회
 * GET /api/user/status
 * 
 * API 반환값: 
 * {
 *   rice: number,              // 보유 밥 개수
 *   characterLevel: number,    // 캐릭터 레벨 (1~8)
 *   feedCount: number,         // 총 먹인 횟수
 *   consecutiveDays: number,   // 연속 출석 일수
 *   hasCompletedInitialSetup: boolean
 * }
 */
export const getCharacterInfo = async () => {
  const { data } = await axiosInstance.get("/user/status");
  
  // API 응답을 그대로 반환
  // CharacterPage 컴포넌트에서 필요한 형태로 변환
  return data;
};

/**
 * 캐릭터에게 밥 주기
 * POST /api/user/feed-character
 * 
 * 요청 본문: 없음 (빈 객체)
 * 
 * 동작:
 * - rice 1 감소
 * - feedCount 1 증가
 * - 경험치 증가 및 레벨 업 처리 
 * 
 * 응답: 없음 (성공 시 200 OK)
 */
export const feedCharacter = async () => {
  const { data } = await axiosInstance.post("/user/feed-character", {});
  return data;
};

export const userAPI = {
  saveInitialSetup,
  getRiskSolutions,
  saveEncouragement,
  getEncouragement,
  getCharacterInfo,
  feedCharacter,
};