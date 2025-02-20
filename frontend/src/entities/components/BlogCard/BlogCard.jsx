import styles from "./BlogCard.module.css";

const BlogCard = ({image, title}) => {
  return (
    <div className={`${styles.blogCard} position-relative`}>
      <img src={image} alt="Blog Image" />
      <div>
        <h2>{title}</h2>
      </div>
    </div>
  );
};

export default BlogCard;
