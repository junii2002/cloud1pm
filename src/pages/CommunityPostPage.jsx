// src/pages/CommunityPostPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { communityAPI } from "../api/communityApi";
import { useAuth } from "../context/AuthContext";   // 🔥 AuthContext로 현재 사용자 불러오기
import "./CommunityPostPage.css";

const timeFormat = (t) => {
  if (!t) return "";
  return new Date(t).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CommunityPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  const { user: currentUser } = useAuth(); // 현재 로그인 사용자 정보

  const fetchPost = async () => {
    setLoading(true);
    try {
      const postData = await communityAPI.getPostById(postId);
      const commentsData = await communityAPI.getComments(postId);

      setPost(postData);
      setIsLiked(postData.isLiked);
      setCommentList(commentsData || []);
    } catch (err) {
      console.error(err);
      alert("게시글을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    try {
      await communityAPI.likePost(postId);
      fetchPost();
    } catch (err) {
      alert("좋아요 처리 실패!");
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      await communityAPI.addComment(postId, commentText.trim());
      setCommentText("");
      fetchPost();
    } catch (err) {
      alert("댓글 등록 실패");
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠어요?")) return;

    try {
      await communityAPI.deleteComment(commentId);
      fetchPost();
    } catch (err) {
      alert("댓글 삭제 실패");
    }
  };

  const handlePostDelete = async () => {
    if (!window.confirm("정말 삭제할까요?")) return;

    try {
      await communityAPI.deletePost(postId);
      alert("게시글이 삭제되었습니다");
      navigate("/community");
    } catch (err) {
      alert("게시글 삭제 실패");
    }
  };

  return (
    <section className="community-post-page">
      <div className="community-post-page__container">

        <button
          className="community-post-page__back"
          onClick={() => navigate("/community")}
        >
          ← 목록으로 돌아가기
        </button>

        {loading && <div>불러오는 중...</div>}

        {!loading && post && (
          <>
            {/* 게시글 정보 */}
            <article className="community-post-page__meta">
              <h1 className="community-post-page__title">{post.title}</h1>

              <div className="community-post-page__info">
                <strong>{post.nickname || post.authorName}</strong>
                <span>{timeFormat(post.createdAt)}</span>
              </div>

              <div className="community-post-page__content">
                {post.fullContent || post.content}
              </div>

              <div className="community-post-page__footer">
                <button
                  className="community-post-page__like-button"
                  onClick={handleLike}
                >
                  {isLiked ? "❤️" : "🤍"} {post.likes}
                </button>
                <span>💬 {commentList.length}</span>
              </div>

              {/* 게시글 작성자 본인이면 글 수정/삭제 버튼 표시 */}
              {currentUser?.nickname === post.nickname && (
                <div className="community-post-page__actions">
                  <button
                    className="community-post-page__edit-button"
                    onClick={() =>
                      navigate(`/community/edit/${postId}`, { state: { post } })
                    }
                  >
                    수정
                  </button>

                  <button
                    className="community-post-page__delete-button"
                    onClick={handlePostDelete}
                  >
                    삭제
                  </button>
                </div>
              )}
            </article>

            <div className="community-post-page__divider" />

            {/* 댓글 영역 */}
            <section className="community-post-page__comments-section">
              <h2 className="community-post-page__comments-header">
                댓글 {commentList.length}개
              </h2>

              <div className="community-post-page__comments-list">
                {commentList.map((c) => (
                  <div key={c.id} className="community-comment">

                    {/* 댓글 헤더 */}
                    <div className="community-comment__header">
                      <span className="community-comment__author">
                        {c.authorName}
                      </span>

                      <div className="community-comment__meta">
                        <span>{timeFormat(c.createdAt)}</span>

                        {/* 🔥 내 댓글일 때만 삭제 버튼 표시 */}
                        {currentUser?.nickname === c.authorName && (
                          <button
                            className="community-comment__delete"
                            onClick={() => handleCommentDelete(c.id)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 댓글 내용 */}
                    <p className="community-comment__content">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* 댓글 입력 */}
              <div className="community-post-page__comment-form">
                <label>댓글 작성하기</label>
                <textarea
                  className="community-post-page__comment-textarea"
                  placeholder="따뜻한 말 한마디를 남겨주세요."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  className="community-post-page__comment-submit"
                  onClick={handleCommentSubmit}
                >
                  댓글 작성하기
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </section>
  );
}
