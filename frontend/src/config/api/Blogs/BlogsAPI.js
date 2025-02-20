import axios from 'axios';

const API_URL = 'http://localhost:8003/api/v1/blogs';

// Fetch all blog posts
export const getAllBlogs = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

// Fetch a single blog by ID
export const getBlogById = async (blogId) => {
  try {
    const response = await axios.get(`${API_URL}/${blogId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog with id ${blogId}:`, error);
    throw error;
  }
};

// Create a new blog
export const createBlog = async (blogData) => {
  try {
    const response = await axios.post(API_URL, blogData);
    return response.data;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
};

// Upload an image to a specific blog
export const uploadImage = async (blogId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_URL}/${blogId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
