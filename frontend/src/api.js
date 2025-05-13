// fetch wrappers for /api/*
import axios from 'axios';

export async function health() {
  return axios.get('/api/health');
}

export async function commentOthers(profileIds) {
  return axios.post('/api/comment', { profileIds });
}

export async function replyOwn(postId) {
  return axios.post('/api/reply', { postId });
}

export async function reciprocate(commenterIds) {
  return axios.post('/api/reciprocate', { commenterIds });
}

export async function connectPeople(peopleIds) {
  return axios.post('/api/connect', { peopleIds });
}

export async function getCost() {
  return axios.get('/api/cost');
}
