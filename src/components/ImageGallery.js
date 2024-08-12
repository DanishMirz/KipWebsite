// src/components/ImageGallery.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './ImageGallery.css';

const ImageGallery = () => {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaData = [];
      snapshot.forEach((doc) => {
        mediaData.push(doc.data());
      });
      setMedia(mediaData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="media-gallery">
      {media.map((item, index) => (
        <div key={index} className="gallery-item">
          {item.type === 'image' ? (
            <img src={item.url} alt="Gallery" className="gallery-image" />
          ) : (
            <video src={item.url} controls className="gallery-video" />
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
