import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Axios 인스턴스
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 모임 목록 조회
export const getMeetings = async (params?: {
  search?: string;
  category?: string;
  page?: number;
}) => {
  const response = await api.get('/meetings', { params });
  return response.data;
};

// 모임 참여
export const joinMeeting = async (meetingId: number) => {
  const response = await api.post(`/meetings/${meetingId}/join`);
  return response.data;
};