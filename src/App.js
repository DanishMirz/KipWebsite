import React, { useState, useEffect } from 'react';
import ImageUploaderGrid from './components/ImageUploaderGrid';
import SidePanel from './components/SidePanel';
import './App.css';
import { db, storage } from './firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

function App() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaData = [];
      snapshot.forEach((doc) => {
        mediaData.push({
          id: doc.id,
          src: doc.data().url,
          type: doc.data().type,
          timestamp: new Date(doc.data().createdAt.toDate()).toLocaleString(),
        });
      });
      setMedia(mediaData);
    });

    return () => unsubscribe();
  }, []);

  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color);
  };

  const handleMediaUpload = async (newMedia) => {
    setMedia([...media, ...newMedia]);
  };

  const handleDeleteMedia = async (index) => {
    const mediaItem = media[index];
    const mediaRef = ref(storage, mediaItem.src);
    const docRef = doc(db, 'media', mediaItem.id);

    try {
      await deleteObject(mediaRef); // Delete media from Firebase Storage
      await deleteDoc(docRef); // Delete media metadata from Firestore
      setMedia(media.filter((_, i) => i !== index)); // Update state to remove the media from the UI
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleMediaClick = (src, type) => {
    if (type === 'image') {
      setSelectedMedia({ src, type: 'image' });
    } else if (type === 'video') {
      setSelectedMedia({ src, type: 'video' });
    } else {
      console.error('Unsupported media type:', type);
    }
  };
  

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  return (
    <div className="App" style={{ backgroundColor: backgroundColor, minHeight: '100vh', padding: '20px', position: 'relative', transition: 'background-color 1s ease' }}>
      <header className="app-header">
        KIEON WEBSITE
      </header>
      <div className="main-content-wrapper" style={{ display: 'flex' }}>
      <SidePanel 
  media={media} 
  onDeleteMedia={handleDeleteMedia} 
  onMediaClick={handleMediaClick} 
  backgroundColor={backgroundColor} 
/>
        <div className="main-content" style={{ flex: 1, marginLeft: '50px' }}>
          <ImageUploaderGrid
            onBackgroundColorChange={handleBackgroundColorChange}
            backgroundColor={backgroundColor}
            onMediaUpload={handleMediaUpload}
            media={media}
            onMediaClick={handleMediaClick}
            onDeleteMedia={handleDeleteMedia}
          />
        </div>
      </div>
      {selectedMedia && (
        <div className="media-modal">
          {selectedMedia.type === 'image' ? (
            <img src={selectedMedia.src} alt="Enlarged view" onClick={handleCloseModal} />
          ) : (
            <video src={selectedMedia.src} controls autoPlay onClick={handleCloseModal} />
          )}
          <button className="close-button" onClick={handleCloseModal}>✖</button>
        </div>
      )}
    </div>
  );
}

export default App;
