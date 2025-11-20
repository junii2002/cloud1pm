// communityApi.js
import axiosInstance from "./axiosInstance";
import { USE_MOCK_API, mockResponse } from "./config";

const POSTS_PER_PAGE = 6;

const formatBackendPost = (post) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  nickname: post.authorName,
  profileImageUrl: post.authorProfileImage,
  likes: post.likeCount,
  comments: post.commentCount,
  isLiked: post.isLiked,
  createdAt: post.createdAt,
  commentList: post.comments || [],
});

const formatBackendComment = (c) => ({
  id: c.commentId,
  content: c.content,
  authorName: c.authorName,
  userId: c.userId,
  createdAt: c.createdAt,
});

// ===== API =====

export const communityAPI = {

  async getPosts({ page = 1, tab = "popular" }) {

  //  내 작성글 모아보기 처리 추가 
  if (tab === "my-posts") {
    const { data } = await axiosInstance.get("/community/posts/my");

    return {
      items: Array.isArray(data.items) ? data.items : data,
      totalPages: data.totalPages || 1,
    };
  }

  // 일반 popular / recent 처리
  const { data } = await axiosInstance.get("/community/posts", {
    params: { page, tab }
  });

  let posts = Array.isArray(data.items) ? data.items : data;

  if (tab === "popular") {
    posts = [...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  }

  return {
    items: posts,
    totalPages: data.totalPages || 1,

  }
},
  async getPostById(id) {
    const { data } = await axiosInstance.get(`/community/posts/${id}`);
    return formatBackendPost(data);
  },
  
  async createPost(post) {
  const { data } = await axiosInstance.post("/community/posts", {
    title: post.title,
    content: post.content,
  });

  return {
    success: true,
    postId: data.id,
  };
},

async updatePost(postId, post) {
  await axiosInstance.put(`/community/posts/${postId}`, {
    title: post.title,
    content: post.content,
  });

  return {
    success: true
  };
},

  async addComment(postId, content) {
    const { data } = await axiosInstance.post(`/community/posts/${postId}/comments`, {
      content,
    });
    return formatBackendComment(data);
  },

  async deleteComment(commentId) {
    await axiosInstance.delete(`/community/comments/${commentId}`);
    return { success: true };
  },

  async likePost(postId) {
    await axiosInstance.post(`/community/posts/${postId}/like`);
  },

  async getComments(postId) {
    const { data } = await axiosInstance.get(`/community/posts/${postId}`);
    return (data.comments || []).map(formatBackendComment);
  },

  async deletePost(postId) {
    await axiosInstance.delete(`/community/posts/${postId}`);
    return { success: true };
  },
};

