import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', 
  timeout: 30000, //timeout 30초 ( 길게 설정 )
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    const sessionData = localStorage.getItem('mockAuthToken');
    
    if (sessionData) {
      try {
        const { token } = JSON.parse(sessionData);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('토큰 파싱 실패:', e);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401/403 에러 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('인증 실패:', error.response.status);
      
      // 로그아웃 처리
      localStorage.removeItem('mockAuthToken');
      
      // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인/회원가입이 아닌 경우에만)
      if (!['/login', '/signup'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;