import React, { useState } from 'react';
import './ImageUploaderGrid.css'; // Import the CSS file

const ImageUploaderGrid = ({ onBackgroundColorChange, backgroundColor, onImageUpload, onDeleteImage, images, onImageClick }) => {
  const handleImageUpload = (event) => {
    const files = event.target.files;
    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        const timestamp = new Date().toLocaleString();
        newImages.push({ src: reader.result, timestamp });
        if (newImages.length === files.length) {
          onImageUpload(newImages);
        }
      };
      reader.readAsDataURL(file);
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
        onChange={handleImageUpload}
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
        <label htmlFor="backgroundColorPicker" style={{ marginRight: '10px' }}></label>
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
