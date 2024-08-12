import React, { useState } from 'react';
import { storage, db } from '../firebase'; // Make sure db is imported
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore'; // Import Firestore functions
import './ImageUploader.css';

const ImageUploader = () => {
  const [media, setMedia] = useState(null);
  const [mediaSrc, setMediaSrc] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    setMedia(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaSrc(reader.result);
    };
    if (file) {
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (media) {
      const storageRef = ref(storage, `media/${media.name}`);
      await uploadBytes(storageRef, media);
      const url = await getDownloadURL(storageRef);
      
      // Save the media URL and type to Firestore
      await addDoc(collection(db, 'media'), {
        url,
        type: mediaType,
        createdAt: Timestamp.now(),
      });
      console.log('File available at', url);
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleMediaUpload}
        className="file-input"
        id="mediaUpload"
      />
      <label htmlFor="mediaUpload" className="upload-label">
        Insert Media
      </label>
      {mediaSrc && (
        mediaType === 'image' ? (
          <img src={mediaSrc} alt="Uploaded" className="media-preview" />
        ) : (
          <video src={mediaSrc} controls className="media-preview" />
        )
      )}
      {media && (
        <button onClick={handleUpload} className="upload-button">
          Upload
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
