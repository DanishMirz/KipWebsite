import React, { useState, useEffect } from 'react';
import ImageUploaderGrid from './components/ImageUploaderGrid';
import SidePanel from './components/SidePanel';
import ImageModal from './components/ImageModal';
import './App.css';
import { db, storage } from './firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

function App() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'images'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imagesData = [];
      snapshot.forEach((doc) => {
        imagesData.push({ id: doc.id, src: doc.data().url, timestamp: new Date(doc.data().createdAt.toDate()).toLocaleString() });
      });
      setImages(imagesData);
    });

    return () => unsubscribe();
  }, []);

  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color);
  };

  const handleImageUpload = async (newImages) => {
    setImages([...images, ...newImages]);
  };

  const handleDeleteImage = async (index) => {
    const image = images[index];
    const imageRef = ref(storage, image.src);
    const docRef = doc(db, 'images', image.id);

    try {
      await deleteObject(imageRef); // Delete image from Firebase Storage
      await deleteDoc(docRef); // Delete image metadata from Firestore
      setImages(images.filter((_, i) => i !== index)); // Update state to remove the image from the UI
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleImageClick = (src) => {
    setSelectedImage(src);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="App" style={{ backgroundColor: backgroundColor, minHeight: '100vh', padding: '20px', position: 'relative', transition: 'background-color 1s ease' }}>
      <header className="app-header">
        KIEON WEBSITE
      </header>
      <div className="main-content-wrapper" style={{ display: 'flex' }}>
        <SidePanel images={images} onDeleteImage={handleDeleteImage} onImageClick={handleImageClick} />
        <div className="main-content" style={{ flex: 1, marginLeft: '50px' }}>
          <ImageUploaderGrid
            onBackgroundColorChange={handleBackgroundColorChange}
            backgroundColor={backgroundColor}
            onImageUpload={handleImageUpload}
            images={images}
            onImageClick={handleImageClick}
            onDeleteImage={handleDeleteImage}
          />
        </div>
      </div>
      {selectedImage && <ImageModal src={selectedImage} onClose={handleCloseModal} />}
    </div>
  );
}

export default App;
