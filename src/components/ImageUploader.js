// src/components/ImageUploader.js
import React, { useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './ImageUploader.css';

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (image) {
      const storageRef = ref(storage, `images/${image.name}`);
      uploadBytes(storageRef, image).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          console.log('File available at', url);
        });
      });
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="file-input"
        id="imageUpload"
      />
      <label htmlFor="imageUpload" className="upload-label">
        Insert Image
      </label>
      {imageSrc && <img src={imageSrc} alt="Uploaded" className="image-preview" />}
      {image && (
        <button onClick={handleUpload} className="upload-button">
          Upload
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
