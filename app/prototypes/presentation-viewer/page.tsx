"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

// Mock slide data
const slides = [
  {
    id: 1,
    title: "Joint Task Force 505 Earthquake Response CONPLAN",
    content: "Overview of the CONPLAN structure and objectives"
  },
  {
    id: 2,
    title: "Operational Design",
    content: "Strategic framework and operational approach"
  },
  {
    id: 3,
    title: "Tasks to Subordinate Units",
    content: "Detailed task assignments for PACAF, PACFLT, USARPAC, and MARFORPAC",
    tasks: {
      PACAF: [
        "(U) Source CRG to support airport opening ops",
        "(U) BPT deploy HARRT ISO HA/DR ops",
        "(U) BPT provide Intra-Theater lift ISO HA/DR ops",
        "(U) Coordinate STRATLIFT",
        "(U) Provide augmentation to JTF 505"
      ],
      PACFLT: [
        "(U) Deploy ARG/31st MEU ISO HADR",
        "(U) BPT deploy NMCR to support MSR opening ops",
        "(U) BPT deploy MPSRON ISO MPF ops",
        "(U) Provide augmentation to JTF 505"
      ],
      USARPAC: [
        "(U) BPT support Dry Port (railhead) opening ops",
        "(U) Provide Engineering Support",
        "(U) Provide Augmentation to JTF 505"
      ],
      MARFORPAC: [
        "(U) Coordinate STRATLIFT ISO HADR ops",
        "(U) Provide augmentation to JTF 505"
      ]
    }
  },
  {
    id: 4,
    title: "Higher Mission and Intent",
    content: "Mission statement and strategic intent"
  },
  {
    id: 5,
    title: "COMREL",
    content: "Community relations and engagement"
  }
];

type FeatureHighlight = {
  id: string;
  title: string;
  description: string;
  element?: string;
} | null;

export default function PresentationViewer() {
  const [currentSlide, setCurrentSlide] = useState(2); // Start on slide 3 (Tasks to Subordinate Units)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [featureHighlight, setFeatureHighlight] = useState<FeatureHighlight>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const handleSlideClick = (slideId: number) => {
    setCurrentSlide(slideId);
    setFeatureHighlight(null);
  };

  const handleFeatureClick = (feature: FeatureHighlight) => {
    setFeatureHighlight(feature);
    setTimeout(() => setFeatureHighlight(null), 3000);
  };

  const currentSlideData = slides.find(s => s.id === currentSlide) || slides[0];

  const features = [
    {
      id: 'slide-nav',
      title: 'Slide Navigation',
      description: 'Click any slide thumbnail to navigate instantly. The active slide is highlighted with a blue border.',
      element: 'sidebar'
    },
    {
      id: 'task-grid',
      title: 'Task Organization',
      description: 'Tasks are organized in a clear 2x2 grid layout by unit (PACAF, PACFLT, USARPAC, MARFORPAC) for easy scanning.',
      element: 'content'
    },
    {
      id: 'toolbar',
      title: 'Formatting Toolbar',
      description: 'Access formatting options, comments, and presentation controls directly from the toolbar.',
      element: 'toolbar'
    },
    {
      id: 'sync',
      title: 'Real-time Sync',
      description: 'See live collaboration status with the sync indicator showing active users.',
      element: 'sync'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Top Navigation Bar */}
      <div className={styles.topNav}>
        <div className={styles.titleBar}>
          <div className={styles.classification}>UNCLASSIFIED//NOTIONAL</div>
          <div className={styles.title}>(U) Plan Overview Brief</div>
          <div className={styles.titleBarRight}>
            <span>Updated 5 minutes ago</span>
            <button className={styles.helpButton}>Help</button>
            <div className={styles.profileIcon}>DB</div>
          </div>
        </div>
        
        <div className={styles.menuBar}>
          <div className={styles.menuLeft}>
            <button className={styles.menuButton}>File</button>
            <button className={styles.menuButton}>Edit</button>
            <button className={styles.menuButton}>View</button>
            <button className={styles.menuButton}>Insert</button>
            <button className={styles.menuButton}>Format</button>
            <button className={styles.menuButton}>Arrange</button>
          </div>
          <div className={styles.menuRight}>
            <button 
              className={styles.syncButton}
              onClick={() => handleFeatureClick({
                id: 'sync',
                title: 'Real-time Sync',
                description: 'See live collaboration status with the sync indicator showing active users.'
              })}
              onMouseEnter={() => setShowTooltip('sync')}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <span className={styles.syncIcon}>🔄</span>
              <span>8 syncing</span>
            </button>
            <button className={styles.iconButton}>📤</button>
            <button className={styles.iconButton}>ℹ️</button>
            <button className={styles.iconButton}>📜</button>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button className={styles.toolbarButton}>↶</button>
            <button className={styles.toolbarButton}>↷</button>
            <div className={styles.toolbarDivider}></div>
            <button className={styles.toolbarButton}>✂️</button>
            <button className={styles.toolbarButton}>📋</button>
            <button className={styles.toolbarButton}>📄</button>
          </div>
          <div className={styles.toolbarCenter}>
            <button className={styles.newSlideButton}>New slide</button>
            <select className={styles.fontSelect}>
              <option>Normal text 12</option>
            </select>
            <button className={styles.formatButton}>B</button>
            <button className={styles.formatButton}>I</button>
            <button className={styles.formatButton}>U</button>
            <button className={styles.formatButton}>S</button>
            <div className={styles.toolbarDivider}></div>
            <button className={styles.formatButton}>●</button>
            <button className={styles.formatButton}>1.</button>
          </div>
          <div className={styles.toolbarRight}>
            <button 
              className={styles.commentButton}
              onClick={() => handleFeatureClick({
                id: 'toolbar',
                title: 'Formatting Toolbar',
                description: 'Access formatting options, comments, and presentation controls directly from the toolbar.'
              })}
            >
              Add comment
            </button>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Left Sidebar */}
        <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <div className={styles.sidebarNav}>
            <div className={styles.sidebarHeader}>
              <select className={styles.planSelect}>
                <option>CONPLAN JTF 505</option>
              </select>
            </div>
            <div className={styles.classificationBadge}>UNCLASSIFIED//NOTIONAL</div>
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarItem}>🔔 Notifications</div>
              <div className={styles.sidebarItem}>🔍 Q Jump to...</div>
              <div className={styles.sidebarItem}>📇 Cards...</div>
              <div className={styles.sidebarItem}>📊 Dashboard</div>
            </div>
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarSectionTitle}>FAVORITES</div>
              <div className={styles.sidebarItem}>⭐ Problem Framing / Mission Analysis</div>
              <div className={styles.sidebarItem}>⭐ Area of Operations</div>
              <div className={styles.sidebarItem}>⭐ &gt; Mission Analysis (8)</div>
            </div>
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarSectionTitle}>PLAN</div>
              <div className={styles.sidebarItem}>📁 &gt; Source Documents (1)</div>
              <div className={styles.sidebarItem}>📁 Higher Mission and Intent</div>
              <div className={styles.sidebarItemActive}>📄 Plan Overview Brief</div>
            </div>
          </div>
          
          <div className={styles.slidesPanel}>
            <div className={styles.slidesHeader}>Slides</div>
            <div className={styles.slidesList}>
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className={`${styles.slideThumbnail} ${currentSlide === slide.id ? styles.slideThumbnailActive : ''}`}
                  onClick={() => {
                    handleSlideClick(slide.id);
                    handleFeatureClick({
                      id: 'slide-nav',
                      title: 'Slide Navigation',
                      description: 'Click any slide thumbnail to navigate instantly. The active slide is highlighted with a blue border.'
                    });
                  }}
                >
                  <div className={styles.slideThumbnailNumber}>{slide.id}</div>
                  <div className={styles.slideThumbnailTitle}>{slide.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Slide Area */}
        <div className={styles.slideArea}>
          <div className={styles.slide}>
            <div className={styles.slideHeader}>
              <div className={styles.slideClassification}>UNCLASSIFIED</div>
              <div className={styles.slideEmblems}>
                <div className={styles.emblems}>⚫ 🔵</div>
              </div>
            </div>
            
            <div className={styles.slideTitle}>{currentSlideData.title}</div>
            
            <div className={styles.slideContent}>
              {currentSlideData.id === 3 && currentSlideData.tasks ? (
                <div className={styles.taskGrid}>
                  <div 
                    className={styles.taskBox}
                    onClick={() => handleFeatureClick({
                      id: 'task-grid',
                      title: 'Task Organization',
                      description: 'Tasks are organized in a clear 2x2 grid layout by unit (PACAF, PACFLT, USARPAC, MARFORPAC) for easy scanning.'
                    })}
                  >
                    <div className={styles.taskBoxTitle}>Tasks to PACAF</div>
                    <ul className={styles.taskList}>
                      {currentSlideData.tasks.PACAF.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.taskBox}>
                    <div className={styles.taskBoxTitle}>Tasks to USARPAC</div>
                    <ul className={styles.taskList}>
                      {currentSlideData.tasks.USARPAC.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.taskBox}>
                    <div className={styles.taskBoxTitle}>Tasks to PACFLT</div>
                    <ul className={styles.taskList}>
                      {currentSlideData.tasks.PACFLT.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.taskBox}>
                    <div className={styles.taskBoxTitle}>Tasks to MARFORPAC</div>
                    <ul className={styles.taskList}>
                      {currentSlideData.tasks.MARFORPAC.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className={styles.slideContentText}>{currentSlideData.content}</div>
              )}
              
              <div className={styles.slideImage}>
                <div className={styles.imagePlaceholder}>Map/Image Area</div>
              </div>
            </div>
            
            <div className={styles.slideFooter}>
              <div className={styles.slideFooterLeft}>
                <div>15 1836Z May 2024</div>
                <div>LCDR John Smith, PACFLT N53 - john.s.smith@navy.smil.mil</div>
              </div>
              <div className={styles.slideFooterRight}>
                <div className={styles.slideNumber}>{currentSlide}</div>
                <div className={styles.slideClassification}>UNCLASSIFIED</div>
              </div>
            </div>
            
            <div className={styles.slideUpdated}>
              Updated 5 mins ago by LCDR Smith
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlight Overlay */}
      {featureHighlight && (
        <div className={styles.featureHighlight}>
          <div className={styles.featureHighlightContent}>
            <h3>{featureHighlight.title}</h3>
            <p>{featureHighlight.description}</p>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip === 'sync' && (
        <div className={styles.tooltip}>
          Real-time collaboration indicator
        </div>
      )}

      {/* Back Button */}
      <Link href="/" className={styles.backButton}>
        ← Back to Home
      </Link>
    </div>
  );
}

