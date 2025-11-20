// src/pages/CommunityPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { communityAPI } from "../api/communityApi";
import "./CommunityPage.css";

const ITEMS_PER_PAGE = 7; // 🟢 [추가] 페이지당 보여줄 개수 설정

const COMMUNITY_TABS = [
  { id: "recent", label: "최신글" },
  { id: "popular", label: "인기글" },
  { id: "my-posts", label: "내 작성글" },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const buildPagination = (currentPage, totalPages) => {
  if (totalPages <= 1) return [1];
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = [1];
  if (currentPage > 3) pages.push("prev-ellipsis");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let p = start; p <= end; p++) pages.push(p);
  if (currentPage < totalPages - 2) pages.push("next-ellipsis");
  pages.push(totalPages);
  return pages;
};

export default function CommunityPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🟢 [변경] 변수명을 명확하게 'allPosts'로 생각하고 쓰되, 코드는 posts 유지
  // 백엔드에서 받아온 '모든' 데이터를 저장합니다.
  const [posts, setPosts] = useState([]); 
  
  const [activeTab, setActiveTab] = useState(COMMUNITY_TABS[0].id);
  const [currentPage, setCurrentPage] = useState(1);
  
  // totalPages는 이제 state가 아니라 posts 길이에 따라 자동 계산됨 (아래 useMemo 참고)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 🟢 [추가] 전체 데이터(posts)를 기반으로 총 페이지 수 계산
  const totalPages = useMemo(() => {
    if (posts.length === 0) return 1;
    return Math.ceil(posts.length / ITEMS_PER_PAGE);
  }, [posts]);

  // 🟢 [추가] 현재 페이지에 보여줄 데이터만 '똑' 떼어내기 (Client-side Slicing)
  const visiblePosts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return posts.slice(startIndex, endIndex);
  }, [currentPage, posts]);

  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey((prev) => prev + 1);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  /* -----------------------------------------------------------
   * 데이터 불러오기 (한 번 로드하면 끝)
   * ----------------------------------------------------------- */
  useEffect(() => {
    let ignore = false;

    const loadPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        // 🟢 [변경] currentPage는 백엔드에 안 보냅니다 (어차피 다 주니까). tab 정보만 전송.
        const response = await communityAPI.getPosts({ tab: activeTab });

        if (!ignore) {
          let fetchedData = [];
          
          // 응답 형태가 배열인지 객체인지 체크해서 통일
          if (Array.isArray(response?.items)) {
            fetchedData = response.items;
          } else if (Array.isArray(response)) {
            fetchedData = response;
          } else {
            fetchedData = [];
          }

          setPosts(fetchedData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setPosts([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadPosts();
    return () => { ignore = true; };
    
    // 🟢 [중요] currentPage가 의존성 배열에서 빠졌습니다! 
    // 페이지를 넘길 때마다 API를 다시 부르지 않기 위해서입니다.
  }, [activeTab, refreshKey]); 

  useEffect(() => {
    const refreshOnVisible = () => {
      if (!document.hidden) setRefreshKey((prev) => prev + 1);
    };
    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => document.removeEventListener("visibilitychange", refreshOnVisible);
  }, []);

  const pagination = useMemo(
    () => buildPagination(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const handlePageChange = (page) => {
    if (page === "prev-ellipsis") return setCurrentPage((p) => Math.max(1, p - 3));
    if (page === "next-ellipsis") return setCurrentPage((p) => Math.min(totalPages, p + 3));
    if (typeof page === "number" && page !== currentPage) {
        setCurrentPage(page);
        // 페이지 이동 시 스크롤 맨 위로 (선택사항)
        window.scrollTo(0, 0);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // 탭 바뀌면 1페이지로 초기화
  };

  return (
    <section className="community-page">
      <div className="community-page__container">

        {/* 헤더 */}
        <header className="community-page__header">
          <div className="community-page__title-group">
            <h2>커뮤니티</h2>
            <p>서로의 마음을 나누고 응원해요.</p>
          </div>

          <button
            className="community-page__write-button"
            onClick={() => navigate("/community/write")}
          >
            게시글 작성하기
          </button>
        </header>

        {/* 탭 */}
        <nav className="community-page__tabs">
          {COMMUNITY_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`community-page__tab ${tab.id === activeTab ? "community-page__tab--active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="community-page__body">

          {loading && (
            <div className="community-page__loading">게시글을 불러오는 중입니다...</div>
          )}

          {!loading && error && (
            <div className="community-page__error">커뮤니티 정보를 불러오지 못했어요.</div>
          )}

          {!loading && !error && (
            <>
              {posts.length === 0 ? (
                <div className="community-page__empty">아직 게시글이 없어요.</div>
              ) : (
                <>
                  <h3 className="community-page__section-title">
                    {/* (선택) 전체 갯수를 보여주면 좋습니다 */}
                    전체 {posts.length}개의 이야기
                  </h3>

                  <div className="community-page__posts">
                    {/* 🟢 [변경] posts.map 대신 visiblePosts.map을 사용합니다 */}
                    {visiblePosts.map((post) => (
                      <article
                        key={post.id}
                        className="community-post-card"
                        onClick={() => navigate(`/community/post/${post.id}`)}
                      >
                        <div className="community-post-card__header">
                          <div className="community-post-card__author">
                            <div className="community-post-card__avatar" />
                            <span>{post.authorName}</span>
                          </div>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>

                        <h3 className="community-post-card__title">{post.title}</h3>

                        <p className="community-post-card__content"><span>{post.content}</span></p>

                        <div className="community-post-card__footer">
                          <span>❤️ {post.likeCount}</span>
                          <span>💬 {post.commentCount}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        {!loading && !error && totalPages > 1 && (
          <div className="community-page__pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              ← 이전
            </button>

            {pagination.map((p) =>
              typeof p === "string" ? (
                <span key={p} className="community-page__page-number">...</span>
              ) : (
                <button
                  key={p}
                  className={`community-page__page-number ${p === currentPage ? "community-page__page-number--active" : ""}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              )
            )}

            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              다음 →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}