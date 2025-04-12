/**
 * API Client for Smart Study Planner
 * Handles all communication with the backend
 */

class ApiClient {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
    this.token = localStorage.getItem('token');
  }

  // Set auth token for API calls
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear auth token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Get auth headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options = {
      method,
      headers: this.getHeaders()
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }

      return result;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    const result = await this.request('/auth/register', 'POST', userData);
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async login(email, password) {
    const result = await this.request('/auth/login', 'POST', { email, password });
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async logout() {
    await this.request('/auth/logout');
    this.clearToken();
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // Course methods
  async getCourses() {
    return await this.request('/courses');
  }

  async getCourse(id) {
    return await this.request(`/courses/${id}`);
  }

  async createCourse(courseData) {
    return await this.request('/courses', 'POST', courseData);
  }

  async updateCourse(id, courseData) {
    return await this.request(`/courses/${id}`, 'PUT', courseData);
  }

  async deleteCourse(id) {
    return await this.request(`/courses/${id}`, 'DELETE');
  }

  async updateCourseProgress(id, progressData) {
    return await this.request(`/courses/${id}/progress`, 'PUT', progressData);
  }

  // Schedule methods
  async getSchedules() {
    return await this.request('/schedules');
  }

  async getCourseSchedules(courseId) {
    return await this.request(`/courses/${courseId}/schedules`);
  }

  async getSchedule(id) {
    return await this.request(`/schedules/${id}`);
  }

  async createSchedule(scheduleData) {
    return await this.request('/schedules', 'POST', scheduleData);
  }

  async updateSchedule(id, scheduleData) {
    return await this.request(`/schedules/${id}`, 'PUT', scheduleData);
  }

  async deleteSchedule(id) {
    return await this.request(`/schedules/${id}`, 'DELETE');
  }

  async updateScheduleItem(scheduleId, itemId, completed, updateCourseProgress = false) {
    return await this.request(`/schedules/${scheduleId}/items/${itemId}`, 'PUT', { 
      completed, 
      updateCourseProgress 
    });
  }

  async generateSchedule(courseId, scheduleParams) {
    return await this.request(`/courses/${courseId}/generate-schedule`, 'POST', scheduleParams);
  }

  // Helper method to check if user is logged in
  isLoggedIn() {
    return !!this.token;
  }
}

// Export singleton instance
const api = new ApiClient();
export default api; 