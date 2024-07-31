import React from 'react';
import './ImageModal.css'; // Import the CSS file

const ImageModal = ({ src, onClose }) => {
  return (
    <div className="image-modal" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="image-modal-close" onClick={onClose}>&times;</span>
        <img src={src} alt="Enlarged view" className="image-modal-image" />
      </div>
    </div>
  );
};

export default ImageModal;
