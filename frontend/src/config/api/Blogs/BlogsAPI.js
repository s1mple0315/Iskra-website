import axios from "axios";

const API_URL = "http://localhost:8003/api/v1/blogs";

export const getAllBlogs = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

export const getBlogById = async (blogId) => {
  try {
    const response = await axios.get(`${API_URL}/${blogId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog with id ${blogId}:`, error);
    throw error;
  }
};

export const createBlog = async (blogData) => {
  try {
    const response = await axios.post(API_URL, blogData);
    return response.data;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
};

export const uploadImage = async (blogId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      `${API_URL}/${blogId}/upload-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
