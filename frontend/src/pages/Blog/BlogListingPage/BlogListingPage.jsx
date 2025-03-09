import { useEffect, useState } from "react";

import styles from "./BlogListingPage.module.css";
import { getAllBlogs } from "../../../config/api/Blogs/BlogsAPI";
import BlogCard from "../../../entities/components/BlogCard/BlogCard";
import { Link } from "react-router-dom";

const BlogListingPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(blogs);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getAllBlogs();
        setBlogs(data);
      } catch (error) {
        setError("Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.blogListing}>
      <h1>Blog Posts</h1>
      {blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <ul className={styles.blogList}>
          {blogs.map((blog) => (
            <Link key={blog.id} to={`/blog/${blog.id}`} className={styles.blogLink}>
              <BlogCard  image={blog.image} title={blog.title} />
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BlogListingPage;
