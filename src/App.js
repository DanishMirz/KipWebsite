import React, { useState, useEffect } from 'react';
import ImageUploaderGrid from './components/ImageUploaderGrid';
import SidePanel from './components/SidePanel';
import MediaCarousel from './components/MediaCarousel';
import './components/LoginSignupForm.css'; // Import a custom CSS file for styling
import './App.css';
import { auth, db, storage } from './firebase';
import { getDocs, collection, query, orderBy, doc, addDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import discordLogo from './Discord.png';
import twitterLogo from './twitter.png';
import youtubeLogo from './youtube.png';
import steamLogo from './steam.png';
import profile from './Me.png';
import ProgrammingIcon from './Programmer.ico';
import DesigningIcon from './Designing.ico';
import VideoEditingIcon from './Video editing.ico';

// Define the LoginSignupForm component
function LoginSignupForm({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);
      setErrorMessage(''); // Clear any previous error messages
    } catch (error) {
      setErrorMessage('Login error: ' + error.message); // Show error message if login fails
    }
  };

  // Handle signup
  const handleSignup = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        uid: user.uid,
        role: 'viewer', // Default role for new users
      });

    console.log("User added to Firestore with default role 'viewer'");
    setErrorMessage(''); // Clear any previous error messages
    setUser(user); // Set the user in the App component
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      setErrorMessage('This email is already in use. Please use a different email or login.');
    } else {
      setErrorMessage('Signup error: ' + error.message); // Show other error messages
    }
  }
};


  return (
    <div className="login-signup-container">
      <div className="form-wrapper">
        <h2 className="form-title">Login or Sign Up</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
        <div className="input-group">
          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <input
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="button-group">
          <button onClick={handleLogin} className="action-button">Login</button>
          <button onClick={handleSignup} className="action-button">Sign Up</button>
        </div>
      </div>
    </div>
  );
}

function AppHeader({ setActiveTab, backgroundColor, setBackgroundColor, handleLogout }) {
  const [logoVisible, setLogoVisible] = useState([false, false, false, false, false, false]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timeouts = [];
    if (logoVisible.every((visible) => !visible)) {
      timeouts.push(setTimeout(() => setLogoVisible([true, false, false, false, false, false]), 500));
      timeouts.push(setTimeout(() => setLogoVisible([true, true, false, false, false, false]), 1000));
      timeouts.push(setTimeout(() => setLogoVisible([true, true, true, false, false, false]), 1500));
      timeouts.push(setTimeout(() => setLogoVisible([true, true, true, true, false, false]), 2000));
      timeouts.push(setTimeout(() => setLogoVisible([true, true, true, true, true, false]), 2500));
      timeouts.push(setTimeout(() => setLogoVisible([true, true, true, true, true, true]), 3000));
    }
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [logoVisible]);

  return (
    <header className="app-header">
      <h1>DANISH WEBSITE</h1>
      <nav className="nav-bar">
        <button onClick={() => setActiveTab('home')} className="nav-link">Home</button>
        <button onClick={() => setActiveTab('about')} className="nav-link">About</button>
        <button onClick={() => setActiveTab('projects')} className="nav-link">Projects</button>
        <button onClick={handleLogout} className="logout-button">Logout</button> {/* Logout button with red background */}
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
        className={`about-overlay ${isHovered ? 'hovered' : ''}`} 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="socials-text">Socials</div>
        <div className="about-content">
        <div className="social-icons-container">
  {[
    { logo: discordLogo, url: "https://discord.gg/nEYdbY6zAV", alt: 'Discord' },
    { logo: twitterLogo, url: "https://x.com/kieon_kip", alt: 'Twitter' },
    { logo: youtubeLogo, url: "https://www.youtube.com/", alt: 'YouTube' },
    { logo: steamLogo, url: "https://steamcommunity.com/profiles/76561198991066994/", alt: 'Steam' }
  ].map((icon, index) => (
    <div className="social-icon" key={index}>
      <img
        src={icon.logo}
        alt={icon.alt} // Add an alt text for better accessibility and debugging
        className={`social-logo ${logoVisible[index] ? 'pop-in' : ''}`}
        onClick={() => window.open(icon.url, "_blank")}
        onError={(e) => e.target.style.display = 'none'} // Hide the icon if there's an error loading it
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
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Store user authentication state

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear the user state
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const getBrightness = (hexColor) => {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      return (r * 299 + g * 587 + b * 114) / 1000;
    };

    const brightness = getBrightness(backgroundColor);
    setTextColor(brightness > 128 ? '#000000' : '#ffffff');
  }, [backgroundColor]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mediaQuery = query(collection(db, 'media'), orderBy('createdAt', sortOrder));
        const mediaSnapshot = await getDocs(mediaQuery);
        const mediaData = mediaSnapshot.docs.map((doc) => ({
          id: doc.id,
          src: doc.data().url,
          type: doc.data().type,
          timestamp: new Date(doc.data().createdAt.toDate()).toLocaleString(),
        }));
        setMedia(mediaData);

        const projectFilesSnapshot = await getDocs(collection(db, 'projectFiles'));
        const projectFilesData = projectFilesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          url: doc.data().url,
        }));
        setProjectFiles(projectFilesData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    const fetchUserRole = async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userRole = userDoc.data().role;
          setRole(userRole);  // Set the user's role
          console.log('User role:', userRole);  // Debugging output
        }
      } else {
        setRole(null);  // No user is signed in
      }
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);  // Update user state
      setLoading(false);  // Stop loading once auth state is determined
      fetchUserRole(user);  // Fetch role if user is authenticated
      fetchData();
    });

    return () => unsubscribe();  // Cleanup on unmount
  }, [sortOrder]);

  // Show loading while checking authentication state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show login/signup form if user is not logged in
  if (!user) {
    return <LoginSignupForm />;
  }

  const handleFileUpload = async (event) => {
    if (role !== 'admin') {
      alert('Only admins can upload files');
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileRef = ref(storage, `projects/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      const fileDocRef = await addDoc(collection(db, 'projectFiles'), {
        name: file.name,
        url,
        createdAt: new Date(),
      });

      setProjectFiles([...projectFiles, { id: fileDocRef.id, name: file.name, url }]);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDeleteFile = async (index) => {
    if (role !== 'admin') {
      alert('Only admins can delete files');
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this file?");
    if (!confirmDelete) return;

    const fileToDelete = projectFiles[index];
    const fileRef = ref(storage, `projects/${fileToDelete.name}`);
    const docRef = doc(db, 'projectFiles', fileToDelete.id);  // Reference to the document in Firestore

    try {
      await deleteObject(fileRef);
      await deleteDoc(docRef);

      const updatedFiles = [...projectFiles];
      updatedFiles.splice(index, 1);
      setProjectFiles(updatedFiles);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleMediaUpload = async (newMedia) => {
    if (role !== 'admin') {
      alert('Only admins can upload media');
      return;
    }

    setMedia([...media, ...newMedia]);
  };

  const handleDeleteMedia = async (index) => {
    if (role !== 'admin') {
      alert('Only admins can delete media');
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this media?");
    if (!confirmDelete) return;

    const mediaItem = media[index];
    const mediaRef = ref(storage, mediaItem.src);
    const docRef = doc(db, 'media', mediaItem.id);

    try {
      await deleteObject(mediaRef);
      await deleteDoc(docRef);

      setMedia(media.filter((_, i) => i !== index));
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
          <div className="counter-container" style={{ color: textColor }}>
            <div className="counter">
              <p>Images: {imageCount}</p>
              <p>Videos: {videoCount}</p>
            </div>
          </div>
          <div className="main-content-wrapper" style={{ display: 'flex' }}>
            <SidePanel
              media={media}
              onDeleteMedia={role === 'admin' ? handleDeleteMedia : null}
              onMediaClick={handleMediaClick}
              backgroundColor={backgroundColor}
            />
            <div className="main-content" style={{ flex: 1, marginLeft: '50px' }}>
              <div className="media-options-container" style={{ color: textColor }}>
                <div className="media-type-dropdown" style={{ color: textColor }}>
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
              <div className="sort-dropdown-container" style={{ color: textColor }}>
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
                 onDeleteMedia={role === 'admin' ? handleDeleteMedia : null} // Pass the delete function
                 onMediaUpload={handleMediaUpload}
              />
            </div>
          </div>
        </>
      );
    } else if (activeTab === 'about') {
      return (
        <div className="about-page" style={{ color: textColor }}>
          <section className="introduction-section">
            <div className="profile-image-wrapper">
              <img src={profile} alt="Profile" className="profile-image" />
            </div>
            <div className="introduction-text">
              <h1>About Me</h1>
              <p>
                Howdy! Names Dan , an enthusiastic IT Programmer with a deep passion for creating intuitive websites and innovative system UIs. My journey in programming has equipped me with the skills to transform ideas into impactful digital experiences that truly make a difference. I believe in the power of technology to solve problems and improve lives, and I constantly strive to push the boundaries of what's possible in the digital world. Whether it's designing sleek interfaces or writing clean, efficient code, I'm driven by the challenge of bringing concepts to life in a way that leaves a lasting impression.
              </p>
            </div>
          </section>
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
            </div>
          </section>
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
          <section className="contact-section" style={{ color: textColor }}>
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
        <div className="projects-section" style={{ color: textColor }}>
          <h2>My Projects</h2>
          <p>Here are some of my recent projects...</p>
          <div className="center-button">
            {role === 'admin' && (
              <>
                <input
                  type="file"
                  id="fileUpload"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.word,psd"
                />
                <label htmlFor="fileUpload" className="file-upload-button">
                  Insert File
                </label>
              </>
            )}
          </div>
          <ul className="file-list">
            {projectFiles.map((file, index) => (
              <li key={index} className="file-item">
                <div className="file-preview">📄</div>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
                {role === 'admin' && (
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteFile(index)}
                  >
                    ✖
                  </button>
                )}
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
        handleLogout={handleLogout} // Pass handleLogout to AppHeader
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
