import React from 'react';
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  const { title, description, category, image, _id } = blog;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/blog/${_id}`)}
      className="
        relative
        w-full
        rounded-2xl
        overflow-hidden
        shadow-2xl
        hover:shadow-3xl
        hover:scale-105
        transform transition-all duration-500
        cursor-pointer
        bg-white
        group
      "
    >
      {/* Image with a subtle hover effect */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="
            w-full h-full object-cover
            transform transition-transform duration-500
            group-hover:scale-110
          "
        />
        {/* Subtle gradient overlay to make text pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      <div className="p-6">
        {/* Category Badge */}
        <span
          className="
            inline-block
            px-4 py-1
            text-xs font-bold
            text-primary-600
            bg-primary-100
            rounded-full
            uppercase
            tracking-widest
          "
        >
          {category}
        </span>

        {/* Title */}
        <h5
          className="
            mt-4 mb-2
            text-2xl font-extrabold
            text-gray-900
            leading-snug
            line-clamp-2
          "
        >
          {title}
        </h5>

        {/* Description */}
        <p
          className="
            text-sm text-gray-600
            line-clamp-3
          "
          dangerouslySetInnerHTML={{ __html: description }}
        ></p>

        {/* Read More Link */}
        <div className="mt-6">
          <a
            href={`/blog/${_id}`}
            onClick={(e) => e.stopPropagation()}
            className="
              inline-flex items-center
              text-primary-600 font-semibold
              hover:underline
              transition-colors duration-300
            "
          >
            Read More
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              ></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;