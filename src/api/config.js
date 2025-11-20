// src/api/config.js

// ⭐ true: Mock API 사용 (백엔드 없이 테스트)
// ⭐ false: 실제 백엔드 API 호출
export const USE_MOCK_API = false; // ⭐ 포트 3000으로 변경 후 false로!

export const mockResponse = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockError = (error, delay = 500) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(error), delay);
  });
};