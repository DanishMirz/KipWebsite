// src/components/MediaCarousel.js
import React, { useEffect, useState } from 'react';
import './MediaCarousel.css';

const MediaCarousel = ({ media }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === media.length - 1 ? 0 : prevIndex + 1
      );
    }, 15000); // Change slide every 15 seconds

    return () => clearInterval(interval);
  }, [media]);

  if (media.length === 0) return null;

  return (
    <div className="carousel">
      {media.map((item, index) => (
        <div
          key={index}
          className={`carousel-item ${
            index === currentIndex ? 'active' : ''
          }`}
        >
          {item.type === 'image' ? (
            <img src={item.src} alt={`Carousel ${index}`} />
          ) : (
            <video src={item.src} autoPlay muted loop />
          )}
        </div>
      ))}
    </div>
  );
};

export default MediaCarousel;
