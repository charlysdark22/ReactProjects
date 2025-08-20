import API from './api';

class ReviewService {
  async getReviews(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/reviews?${queryString}` : '/reviews';
    const response = await API.get(url);
    return response.data;
  }

  async getReview(id) {
    const response = await API.get(`/reviews/${id}`);
    return response.data;
  }

  async createReview(reviewData) {
    const response = await API.post('/reviews', reviewData);
    return response.data;
  }

  async updateReview(id, reviewData) {
    const response = await API.put(`/reviews/${id}`, reviewData);
    return response.data;
  }

  async deleteReview(id) {
    const response = await API.delete(`/reviews/${id}`);
    return response;
  }

  async markHelpful(id) {
    const response = await API.put(`/reviews/${id}/helpful`);
    return response.data;
  }

  async unmarkHelpful(id) {
    const response = await API.delete(`/reviews/${id}/helpful`);
    return response.data;
  }

  async reportReview(id) {
    const response = await API.put(`/reviews/${id}/report`);
    return response;
  }

  async getReviewStats(productId) {
    const response = await API.get(`/reviews/stats/${productId}`);
    return response.data;
  }

  // Admin functions
  async getReviewsForModeration() {
    const response = await API.get('/reviews/moderation/pending');
    return response.data;
  }

  async moderateReview(id, moderationData) {
    const response = await API.put(`/reviews/${id}/moderate`, moderationData);
    return response.data;
  }
}

export const reviewService = new ReviewService();