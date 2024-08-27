import React from 'react';
import './SidePanel.css';

const SidePanel = ({ media, onDeleteMedia, onMediaClick, backgroundColor }) => {
  return (
    <div className="side-panel" style={{ backgroundColor: backgroundColor }}>
      <h2>Media</h2>
      <div className="side-panel-media">
        {media.map((item, index) => (
          <div key={index} className="side-media-container" onClick={() => onMediaClick(item.src, item.type)}>
            {item.type === 'image' ? (
              <img src={item.src} alt={`Uploaded ${index}`} className="side-uploaded-image" />
            ) : (
              <video src={item.src} controls className="side-uploaded-media" />
            )}
            <div className="side-overlay">
              <div className="side-timestamp">{item.timestamp}</div>
              {onDeleteMedia && ( // Only show delete button if onDeleteMedia is provided
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMedia(index);
                  }}
                  className="side-delete-button"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidePanel;
