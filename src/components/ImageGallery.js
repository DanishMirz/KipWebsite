// src/components/ImageGallery.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './ImageGallery.css';

const ImageGallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'images'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imagesData = [];
      snapshot.forEach((doc) => {
        imagesData.push(doc.data());
      });
      setImages(imagesData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="image-gallery">
      {images.map((image, index) => (
        <img key={index} src={image.url} alt="Gallery" className="gallery-image" />
      ))}
    </div>
  );
};

export default ImageGallery;
