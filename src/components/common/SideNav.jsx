import React from "react";
import { NavLink } from "react-router-dom";
import "./SideNav.css";

export default function SideNav({ user, onLogout }) {
  const navLinkClass = ({ isActive }) => (isActive ? "active" : "");

  const displayName = user?.nickname || "사용자";

  const profileImage =
    user?.profileImageUrl ||
    user?.profileImage ||
    user?.avatarUrl ||
    null;

  return (
    <aside className="side-nav">
      <div className="profile">
        <div className="profile-pic">
          {profileImage ? (
            <img src={profileImage} alt={displayName} />
          ) : (
            <div className="profile-pic-placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="username">{displayName}</span>
      </div>

      <nav>
        <ul>
          <li>
            <NavLink to="/chat" className={navLinkClass}>
              채팅
            </NavLink>
          </li>
          <li>
            <NavLink to="/report" className={navLinkClass}>
              감정 리포트
            </NavLink>
          </li>
          <li>
            <NavLink to="/community" className={navLinkClass}>
              커뮤니티
            </NavLink>
          </li>
          <li>
            <NavLink to="/character" className={navLinkClass}>
              캐릭터
            </NavLink>
          </li>
        </ul>
      </nav>

      {onLogout && (
        <button className="side-nav-logout" onClick={onLogout}>
          로그아웃
        </button>
      )}
    </aside>
  );
}
