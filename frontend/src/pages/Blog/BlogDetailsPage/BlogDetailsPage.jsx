import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./BlogDetailsPage.module.css";
import { getBlogById } from "../../../config/api/Blogs/BlogsAPI";

const BlogDetailsPage = () => {
  const { id } = useParams(); // Get the blog ID from the URL params
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await getBlogById(id);
        setBlog(data);
        console.log(data);
      } catch (error) {
        setError("Failed to load blog details");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]); // Re-fetch when the blogId changes (e.g., when navigating to a different blog)

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!blog) return <div>Blog not found.</div>;

  return (
    <div className={styles.blogDetails}>
      <h1>{blog.title}</h1>
      <p>Reading Time: {blog.reading_time} minutes</p>
      <div className={styles.blogContent}>
        <img
          src="/assets/Blog/blog.png"
          alt={blog.title}
          style={{ width: "100%" }}
        />

        <div>
          <h2>{blog.title}</h2>
          <p>{blog.content}</p>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailsPage;
