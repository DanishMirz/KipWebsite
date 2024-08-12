import React from 'react';
import './ImageModal.css';

const ImageModal = ({ src, type, onClose }) => {
  return (
    <div className="media-modal">
      <button onClick={onClose} className="close-button">X</button>
      {type === 'video' ? (
        <video src={src} controls autoPlay style={{ width: '100%', height: 'auto' }} />
      ) : (
        <img src={src} alt="Enlarged view" style={{ width: '100%', height: 'auto' }} />
      )}
    </div>
  );
};

export default ImageModal;
