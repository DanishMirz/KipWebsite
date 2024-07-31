import React, { useState } from 'react';

const ImageUploader = () => {
  const [imageSrc, setImageSrc] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        id="imageUpload"
      />
      <label
        htmlFor="imageUpload"
        style={{
          cursor: 'pointer',
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          borderRadius: '5px',
          textAlign: 'center'
        }}
      >
        Insert Image
      </label>
      {imageSrc && <img src={imageSrc} alt="Uploaded" style={{ maxWidth: '100%', marginTop: '20px' }} />}
    </div>
  );
};

export default ImageUploader;
