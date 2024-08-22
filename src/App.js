import React, { useState, useEffect } from 'react';
import ImageUploaderGrid from './components/ImageUploaderGrid';
import SidePanel from './components/SidePanel';
import MediaCarousel from './components/MediaCarousel';
import './App.css';
import { db, storage } from './firebase';
import { getDocs, collection, query, orderBy, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import discordLogo from './Discord.png';
import twitterLogo from './twitter.png';
import instagramLogo from './Instagram.png';
import facebookLogo from './facebook.png';
import youtubeLogo from './youtube.png';
import steamLogo from './steam.png';
import profile from './Me.png';
import ProgrammingIcon from './Programmer.ico';
import DesigningIcon from './Designing.ico';
import VideoEditingIcon from './Video editing.ico';
import DrawingIcon from './2D Art Drawing.ico';

function AppHeader({ setActiveTab, backgroundColor, setBackgroundColor }) {
  const [isOverlayVisible] = useState(true); // Set to true by default
  const [logoVisible, setLogoVisible] = useState([false, false, false, false, false, false]);
  const [isHovered, setIsHovered] = useState(false); // Track hover state

  useEffect(() => {
    if (isOverlayVisible && logoVisible.every(visible => !visible)) {
      setTimeout(() => setLogoVisible([true, false, false, false, false, false]), 500);
      setTimeout(() => setLogoVisible([true, true, false, false, false, false]), 1000);
      setTimeout(() => setLogoVisible([true, true, true, false, false, false]), 1500);
      setTimeout(() => setLogoVisible([true, true, true, true, false, false]), 2000);
      setTimeout(() => setLogoVisible([true, true, true, true, true, false]), 2500);
      setTimeout(() => setLogoVisible([true, true, true, true, true, true]), 3000);
    }
  }, [isOverlayVisible, logoVisible]);

  return (
    <header className="app-header">
      <h1>DANISH WEBSITE</h1>
      <nav className="nav-bar">
        <button onClick={() => setActiveTab('home')} className="nav-link">Home</button>
        <button onClick={() => setActiveTab('about')} className="nav-link">About</button>
        <button onClick={() => setActiveTab('projects')} className="nav-link">Projects</button>
      </nav>

      <div className="color-picker-container">
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="color-picker"
        />
      </div>

      <div 
        className={`about-overlay ${isHovered ? 'hovered' : ''}`} // Conditional class for hover
        onMouseEnter={() => setIsHovered(true)} // Show on hover
        onMouseLeave={() => setIsHovered(false)} // Hide on leave
      >
        <div className="socials-text">Socials</div> {/* Text that stays visible */}
        <div className="about-content">
          <div className="social-icons-container">
            {[
              { logo: discordLogo, url: "https://discord.gg/nEYdbY6zAV" },
              { logo: twitterLogo, url: "https://x.com/kieon_kip" },
              { logo: instagramLogo, url: "https://www.instagram.com/peaeanutz/" },
              { logo: facebookLogo, url: "" },
              { logo: youtubeLogo, url: "https://www.youtube.com/" },
              { logo: steamLogo, url: "https://steamcommunity.com/profiles/76561198991066994/" }
            ].map((icon, index) => (
              <div className="social-icon" key={index}>
                <img
                  src={icon.logo}
                  alt={`${icon.logo.split('/').pop()} Logo`}
                  className={`social-logo ${logoVisible[index] ? 'pop-in' : ''}`}
                  onClick={() => window.open(icon.url, "_blank")}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [backgroundColor, setBackgroundColor] = useState('#EAD4DD');
  const [textColor, setTextColor] = useState('#ffffff');
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [mediaType, setMediaType] = useState('both');
  const [activeTab, setActiveTab] = useState('home');
  const [projectFiles, setProjectFiles] = useState([]);

  useEffect(() => {

        // Calculate brightness and set text color
        const getBrightness = (hexColor) => {
          const r = parseInt(hexColor.slice(1, 3), 16);
          const g = parseInt(hexColor.slice(3, 5), 16);
          const b = parseInt(hexColor.slice(5, 7), 16);
          return (r * 299 + g * 587 + b * 114) / 1000;
        };

        const brightness = getBrightness(backgroundColor);
        setTextColor(brightness > 128 ? '#000000' : '#ffffff');

    // Fetch both media and project files in the same effect
    const fetchData = async () => {
      try {
        // Fetch media (images, videos)
        const mediaQuery = query(collection(db, 'media'), orderBy('createdAt', sortOrder));
        const mediaSnapshot = await getDocs(mediaQuery);
        const mediaData = mediaSnapshot.docs.map(doc => ({
          id: doc.id,
          src: doc.data().url,
          type: doc.data().type,
          timestamp: new Date(doc.data().createdAt.toDate()).toLocaleString(),
        }));
        
        setMedia(mediaData);
  
        // Fetch project files
        console.log("Fetching project files...");
        const projectFilesSnapshot = await getDocs(collection(db, 'projectFiles'));
        const projectFilesData = projectFilesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          url: doc.data().url,
        }));

        console.log("Project files fetched: ", projectFilesData);

        setProjectFiles(projectFilesData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [sortOrder, backgroundColor]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      console.log("Uploading file: ", file.name);
      const fileRef = ref(storage, `projects/${file.name}`);
      await uploadBytes(fileRef, file);
  
      const url = await getDownloadURL(fileRef);
      console.log("File uploaded successfully. URL: ", url);
      
      // Save file metadata in Firestore
      const fileDocRef = await addDoc(collection(db, 'projectFiles'), {
        name: file.name,
        url,
        createdAt: new Date(),
      });
  
      // Retrieve the new file with its ID and update the state
      const newFile = {
        id: fileDocRef.id,
        name: file.name,
        url,
      };
  
      setProjectFiles([...projectFiles, newFile]);
      console.log("New file added to state: ", newFile);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  

  const handleDeleteFile = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this file?");
    
    if (!confirmDelete) {
      return;
    }
  
    const fileToDelete = projectFiles[index];
    const fileRef = ref(storage, `projects/${fileToDelete.name}`);
    const docRef = doc(db, 'projectFiles', fileToDelete.id); // Reference to the document in Firestore
  
    try {
      // Delete the file from Firebase Storage
      await deleteObject(fileRef);
  
      // Delete the metadata document from Firestore
      await deleteDoc(docRef);
  
      // Remove the file from the state
      const updatedFiles = [...projectFiles];
      updatedFiles.splice(index, 1);
      setProjectFiles(updatedFiles);
  
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleMediaUpload = async (newMedia) => {
    setMedia([...media, ...newMedia]);
  };

  const handleDeleteMedia = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this media?");
    
    if (!confirmDelete) {
      return;
    }

    const mediaItem = media[index];

    if (!mediaItem) {
      console.error("Media item is undefined");
      return;
    }

    const mediaRef = ref(storage, mediaItem.src);

    if (!mediaItem.src) {
      console.error("Media source is undefined");
      return;
    }

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
    setSelectedMedia({ src, type });
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  const imageCount = media.filter((item) => item.type === 'image').length;
  const videoCount = media.filter((item) => item.type === 'video').length;

  const filteredMedia = media.filter((item) => {
    if (mediaType === 'images') return item.type === 'image';
    if (mediaType === 'videos') return item.type === 'video';
    return true;
  });

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <>
          <MediaCarousel media={media} />
          <div className="counter-container"style={{ color: textColor }}>
            <div className="counter">
              <p>Images: {imageCount}</p>
              <p>Videos: {videoCount}</p>
            </div>
          </div>
          <div className="main-content-wrapper" style={{ display: 'flex' }}>
            <SidePanel media={media} onDeleteMedia={handleDeleteMedia} onMediaClick={handleMediaClick} backgroundColor={backgroundColor} />
            <div className="main-content" style={{ flex: 1, marginLeft: '50px' }}>
              <div className="media-options-container"style={{ color: textColor }}>
                <div className="media-type-dropdown"style={{ color: textColor }}>
                  <label htmlFor="mediaType">Show:</label>
                  <select
                    id="mediaType"
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                  >
                    <option value="both">All Media</option>
                    <option value="images">Images</option>
                    <option value="videos">Videos</option>
                  </select>
                </div>
              </div>
              <div className="sort-dropdown-container"style={{ color: textColor }}>
                <label htmlFor="sortOrder">Sort By:</label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="desc">Newest - Oldest</option>
                  <option value="asc">Oldest - Newest</option>
                </select>
              </div>
              <ImageUploaderGrid
                onBackgroundColorChange={setBackgroundColor}
                backgroundColor={backgroundColor}
                media={filteredMedia}
                onMediaClick={handleMediaClick}
                onDeleteMedia={handleDeleteMedia}
                onMediaUpload={handleMediaUpload}
              />
            </div>
          </div>
        </>
      );
    } else if (activeTab === 'about') {
      return (
        <div className="about-page"style={{ color: textColor }}>
          {/* Introduction Section */}
          <section className="introduction-section">
          <div className="profile-image-wrapper">
            <img src={profile} alt="Profile" className="profile-image" />
            </div>
            <div className="introduction-text">
              <h1>About Me</h1>
              <p>
              Hello! I'm Danish, an enthusiastic IT Programmer with a deep passion for creating intuitive websites and innovative system UIs. My journey in programming has equipped me with the skills to transform ideas into impactful digital experiences that truly make a difference. I believe in the power of technology to solve problems and improve lives, and I constantly strive to push the boundaries of what's possible in the digital world. Whether it's designing sleek interfaces or writing clean, efficient code, I'm driven by the challenge of bringing concepts to life in a way that leaves a lasting impression.
              </p>
            </div>
          </section>
    
              {/* Skills Section */}
              <section className="skills-section">
                <h2>Skills</h2>
                <div className="skills-list">
                  <div className="skill">
                    <a href="https://www.w3schools.com/html/html_examples.asp" target="_blank" rel="noopener noreferrer">
                      <img src={ProgrammingIcon} alt="Programming Icon" className="skill-icon" />
                    </a>
                    <p>Programming</p>
                  </div>
                  <div className="skill">
                    <a href="https://smitiv.co/?gad_source=1&gclid=Cj0KCQjww5u2BhDeARIsALBuLnPpwRhpl8gnNwuUQ0r8ekx4ECzy8J6F06YY9GmvstM1XZfT4OFiEWwaAjAkEALw_wcB" target="_blank" rel="noopener noreferrer">
                      <img src={DesigningIcon} alt="Designing Icon" className="skill-icon" />
                    </a>
                    <p>Designing</p>
                  </div>
                  <div className="skill">
                    <a href="https://webflow.com/made-in-webflow/video-editing" target="_blank" rel="noopener noreferrer">
                      <img src={VideoEditingIcon} alt="Video Editing Icon" className="skill-icon" />
                    </a>
                    <p>Video Editing</p>
                  </div>
                  <div className="skill">
                    <a href="https://apcentral.collegeboard.org/courses/ap-drawing/portfolio/past-exam-questions" target="_blank" rel="noopener noreferrer">
                      <img src={DrawingIcon} alt="2D Art Drawing Icon" className="skill-icon" />
                    </a>
                    <p>2D Art Drawing</p>
                  </div>
                </div>
              </section>
    
          {/* Experience Section */}
          <section className="experience-section">
            <h2>Experience</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-date">2008 - 2014</div>
                <p>UPSR - SK Cyberjaya</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">2015 - 2017</div>
                <p>PT3 - SMK Bandar Puncak Jalil</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">2017 - 2020</div>
                <p>SPM - SMK Bandar Puncak Jalil</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">2021 - 2024</div>
                <p>Diploma in IT - Multimedia University Cyberjaya</p>
              </div>
            </div>
          </section>
    
          {/* Contact Section */}
          <section className="contact-section"style={{ color: textColor }}>
          <h2>Contact</h2>
          <div className="contact-details">
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <a href="mailto:slightthunder@gmail.com">slightthunder@gmail.com</a>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <a href="tel:+601155013220">+6011-55013220</a>
            </div>
          </div>
        </section>
        </div>
      );
    } else if (activeTab === 'projects') {
      return (
        <div className="projects-section"style={{ color: textColor }}>
          <h2>My Projects</h2>
          <p>Here are some of my recent projects...</p>
          
          <div className="center-button">
            <input
              type="file"
              id="fileUpload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.word"
            />
            <label htmlFor="fileUpload" className="file-upload-button">
              Insert File
            </label>
          </div>
          
          <ul className="file-list">
            {projectFiles.map((file, index) => (
              <li key={index} className="file-item">
                <div className="file-preview">📄</div>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteFile(index)}
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return (
    <div className="App" style={{ backgroundColor, color: textColor, minHeight: '100vh', padding: '20px', transition: 'background-color 1s ease' }}>
      <AppHeader
        setActiveTab={setActiveTab}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />
      {renderContent()}
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
