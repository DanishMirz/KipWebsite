import React from 'react';
import './SidePanel.css'; // Import the CSS file

const SidePanel = ({ images, onDeleteImage, onImageClick }) => {
  return (
    <div className="side-panel">
      <h2>IMAGES</h2>
      <div className="side-panel-images">
        {images.map((image, index) => (
          <div key={index} className="side-image-container" onClick={() => onImageClick(image.src)}>
            <img src={image.src} alt={`Uploaded ${index}`} className="side-uploaded-image" />
            <div className="side-overlay">
              <div className="side-timestamp">
                {image.timestamp}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteImage(index);
                }}
                className="side-delete-button"
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

export default SidePanel;
