// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";

import {
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
  handleGoogleCallback as googleLoginApi,
  completeOnboarding as completeOnboardingApi,
  getStoredSession,
  clearStoredSession,
  persistSession,
} from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------------------
   *  user 정규화: 백엔드 스키마와 100% 맞추기
   * ---------------------------------------------------- */

  const normalizeUser = (u) => {
    if (!u) return null;

    // 백엔드 snake_case → camelCase 변환
    return {
      id: u.id ?? null,
      email: u.email ?? null,
      username: u.username ?? null,
      nickname: u.nickname ?? null, 
      profileImageUrl: u.profileImageUrl ?? u.profile_image_url ?? null,

      provider: u.provider ?? null,
      providerId: u.providerId ?? u.provider_id ?? null,

      rice: u.rice ?? 0,
      characterLevel: u.characterLevel ?? u.character_level ?? 1,
      feedCount: u.feedCount ?? u.feed_count ?? 0,
      consecutiveDays: u.consecutiveDays ?? u.consecutive_days ?? 0,

      lastLoginDate: u.lastLoginDate ?? u.last_login_date ?? null,
      isOnboarded:
        u.isOnboarded ??
        u.hasCompletedInitialSetup ??
        u.has_completed_initial_setup ??
        false,
    };
  };

  /* ----------------------------------------------------
   * 세션 저장 + axios 토큰 설정
   * ---------------------------------------------------- */
  const setSession = ({ token: newToken, user: rawUser }) => {
    const normalized = normalizeUser(rawUser);

    if (newToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }

    setToken(newToken || null);
    setUser(normalized);
  };

  /* ----------------------------------------------------
   * LocalStorage에서 세션 복원
   * ---------------------------------------------------- */
  useEffect(() => {
    const saved = getStoredSession();

    if (saved?.token && saved?.user) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${saved.token}`;
      setSession(saved);
    }

    setLoading(false);
  }, []);

  /* ----------------------------------------------------
   * 로그인
   * ---------------------------------------------------- */
  const handleLogin = async (credentials) => {
    // 1) login API 호출
    const raw = await loginApi(credentials);

    const token = raw.token;
    if (!token) throw new Error("로그인 토큰 없음");

    // 임시 user (userId만 있는 상태)
    const tempUser = raw.user;

    // 2) 토큰 먼저 저장
    persistSession({ token, user: tempUser });
    setSession({ token, user: tempUser });

    // 3) 토큰 기반으로 실제 유저 데이터 조회
    const profileResponse = await axiosInstance.get("/user");

    const fullUser = profileResponse.data;

    // 4) 진짜 user 정보로 세션 갱신
    const sessionData = { token, user: fullUser };
    persistSession(sessionData);
    setSession(sessionData);

    return sessionData;
  };

  /* ----------------------------------------------------
   * 구글 로그인
   * ---------------------------------------------------- */
  const handleGoogleLogin = async (credential) => {
    const raw = await googleLoginApi(credential);

    const response = {
      token: raw.token || raw.accessToken || raw.data?.token,
      user: raw.user || raw.data?.user,
    };

    persistSession(response);
    setSession(response);
    return response;
  };

  /* ----------------------------------------------------
   * 회원가입 (세션 변화 없음)
   * ---------------------------------------------------- */
  const handleSignup = async (payload) => {
    return await signupApi(payload);
  };

  /* ----------------------------------------------------
   * 로그아웃
   * ---------------------------------------------------- */
  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    setSession({ token: null, user: null });
    clearStoredSession();
  };

  /* ----------------------------------------------------
   * 온보딩 완료
   * ---------------------------------------------------- */
  const handleCompleteOnboarding = async (payload) => {
    await completeOnboardingApi(payload);

    const updatedUser = {
      ...user,
      isOnboarded: true,
    };

    const response = { token, user: updatedUser };
    persistSession(response);
    setSession(response);
    return response;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login: handleLogin,
      googleLogin: handleGoogleLogin,
      signup: handleSignup,
      logout: handleLogout,
      completeOnboarding: handleCompleteOnboarding,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용해야 합니다.");
  return ctx;
};