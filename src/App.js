import React, { useState } from 'react';
import ImageUploaderGrid from './components/ImageUploaderGrid';
import SidePanel from './components/SidePanel';
import ImageModal from './components/ImageModal';
import './App.css'; // Import the CSS file

function App() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff'); // Default to white
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color);
  };

  const handleImageUpload = (newImages) => {
    setImages([...images, ...newImages]);
  };

  const handleDeleteImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
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
            onDeleteImage={handleDeleteImage}
            images={images}
            onImageClick={handleImageClick}
          />
        </div>
      </div>
      {selectedImage && <ImageModal src={selectedImage} onClose={handleCloseModal} />}
    </div>
  );
}

export default App;
