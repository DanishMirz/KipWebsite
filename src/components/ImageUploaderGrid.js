// src/components/ImageUploaderGrid.js
import React from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import './ImageUploaderGrid.css';

const ImageUploaderGrid = ({ onBackgroundColorChange, backgroundColor, onMediaUpload, onDeleteMedia, media, onMediaClick }) => {
  
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    console.log('Selected files:', files);  // Log the selected files for debugging

    const newMedia = [];
    for (const file of files) {
      if (file && file.name) {
        console.log('Uploading file:', file.name);
        const storageRef = ref(storage, `media/${file.name}`);

        try {
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);

          const newMediaItem = {
            src: url,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            timestamp: new Date().toLocaleString(),
          };

          // Add to Firestore
          await addDoc(collection(db, 'media'), {
            url,
            type: newMediaItem.type,
            createdAt: Timestamp.now(),
          });

          newMedia.push(newMediaItem);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      } else {
        console.error('Invalid file or file name is undefined');
      }
    }

    if (newMedia.length > 0) {
      onMediaUpload(newMedia); // Notify parent component with the new media items
    }
  };

  const handleBackgroundColorChange = (event) => {
    const color = event.target.value;
    onBackgroundColorChange(color); // Notify parent component
  };

  const handleMediaClickWrapper = (item) => {
    onMediaClick(item.src, item.type);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="mediaUpload"
      />
      <label htmlFor="mediaUpload" className="upload-button">
        Insert Media
      </label>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="backgroundColorPicker" style={{ marginRight: '10px' }}>
          Color:
        </label>
        <input
          type="color"
          id="backgroundColorPicker"
          onChange={handleBackgroundColorChange}
        />
      </div>
      <div className="media-grid" style={{ backgroundColor: backgroundColor }}>
        {media.map((item, index) => (
          <div key={index} className="media-container" onClick={() => handleMediaClickWrapper(item)}>
            {item.type === 'image' ? (
              <img src={item.src} alt={`Uploaded ${index}`} className="uploaded-media" />
            ) : (
              <video src={item.src} controls className="uploaded-media" />
            )}
            <div className="overlay">
              <div className="timestamp">{item.timestamp}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMedia(index);
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
