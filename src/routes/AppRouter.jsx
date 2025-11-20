import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "../styles.css";

// Common Components
import SideNav from "../components/common/SideNav";
import LandingPage from "../pages/LandingPage";

// Pages
import ChatPage from "../pages/ChatPage";
import EmotionReportPage from "../pages/EmotionReportPage";
import OnboardingPage from "../pages/OnboardingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage"; // 사용할지 말지 결정
import CommunityPage from "../pages/CommunityPage";
import PostEditorPage from "../pages/PostEditorPage";
import CommunityPostPage from "../pages/CommunityPostPage";
import CharacterPage from "../pages/CharacterPage";
import EncouragementPage from "../pages/EncouragementPage"; // 👈 1. import 추가
import { useAuth } from "../context/AuthContext";

import "../pages/AuthPage.css";

// 로그인 필수
const RequireAuth = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// 온보딩 끝나야 접근 가능
const RequireOnboarded = ({ children }) => {
  const { user } = useAuth();
  if (!user?.isOnboarded) return <Navigate to="/onboarding" replace />;
  return children;
};

/* ----------------------------------------------
   메인 레이아웃 (SideNav 숨김 처리)
---------------------------------------------- */

//  2. /encouragement 도 사이드바 숨김 처리
const NO_SIDENAV_ROUTES = ["/", "/login", "/signup", "/onboarding", "/encouragement"];

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const hideSideNav = NO_SIDENAV_ROUTES.includes(location.pathname);

  return (
    <div className="app-layout">
      {!hideSideNav && <SideNav user={user} onLogout={logout} />}
      <div className="main-content">{children}</div>
    </div>
  );
};

/* ----------------------------------------------
   실제 Route 설정
---------------------------------------------- */

const AppRoutes = () => (
  <Routes>
   <Route path="/" element={<LandingPage />} />
    {/* 로그인 페이지 */}
    <Route path="/login" element={<LoginPage />} />

    {/* 회원가입 페이지 (구글 로그인만 쓸 거면 나중에 지워도 됨) */}
    <Route path="/signup" element={<SignupPage />} />

    {/* 온보딩 */}
    <Route path="/onboarding" element={<OnboardingPage />} />


    {/* 채팅 */}
    <Route
      path="/chat"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <ChatPage />
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    {/* 감정 리포트 */}
    <Route
      path="/report"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <EmotionReportPage />
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    {/* 커뮤니티 (향후용) */}
    <Route
      path="/community"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <CommunityPage />
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    <Route
      path="/community/write"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <PostEditorPage />
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    <Route
      path="/community/post/:postId"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <CommunityPostPage />
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    {/* 캐릭터 페이지 */}
    <Route
      path="/character"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <CharacterPage />
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    {/* 👇 3. [추가] 오늘의 응원 페이지 라우트 */}
    <Route
      path="/encouragement"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <EncouragementPage />
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    {/* 기본 라우팅 */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const AppRouter = () => {
  return (
    <Router>
      <LayoutWrapper>
        <AppRoutes />
      </LayoutWrapper>
    </Router>
  );
};

export default AppRouter;