// src/components/ImageUploaderGrid.js
import React, { useState } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import './ImageUploaderGrid.css';

const ImageUploaderGrid = ({ onBackgroundColorChange, backgroundColor, onImageUpload, onDeleteImage, images, onImageClick }) => {
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    console.log('Selected files:', files);  // Log the selected files for debugging

    const newImages = [];
    for (const file of files) {
      if (file && file.name) {
        console.log('Uploading file:', file.name);  // Log the file name for debugging
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        const newImage = {
          src: url,
          timestamp: new Date().toLocaleString()
        };

        // Add to Firestore
        await addDoc(collection(db, 'images'), {
          url,
          createdAt: Timestamp.now(),
        });

        newImages.push(newImage);
      } else {
        console.error('Invalid file or file name is undefined');
      }
    }

    if (newImages.length > 0) {
      onImageUpload(newImages); // Notify parent component with the new images
    }
  };

  const handleBackgroundColorChange = (event) => {
    const color = event.target.value;
    onBackgroundColorChange(color); // Notify parent component
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="imageUpload"
      />
      <label
        htmlFor="imageUpload"
        className="upload-button"
      >
        Insert Image
      </label>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="backgroundColorPicker" style={{ marginRight: '10px' }}>Color:</label>
        <input
          type="color"
          id="backgroundColorPicker"
          onChange={handleBackgroundColorChange}
        />
      </div>
      <div className="image-grid" style={{ backgroundColor: backgroundColor }}>
        {images.map((image, index) => (
          <div key={index} className="image-container" onClick={() => onImageClick(image.src)}>
            <img src={image.src} alt={`Uploaded ${index}`} className="uploaded-image" />
            <div className="overlay">
              <div className="timestamp">
                {image.timestamp}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteImage(index);
                }}
                className="delete-button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploaderGrid;
