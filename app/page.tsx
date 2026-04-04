import Link from "next/link";
import styles from './styles/home.module.css';
import { instrumentSans } from './fonts';

export default function Home() {
  // Add your prototypes to this array
  const prototypes = [
    {
      title: 'Getting started',
      description: 'How to create a prototype',
      path: '/prototypes/example'
    },
    {
      title: 'Confetti button',
      description: 'An interactive button that creates a colorful confetti explosion',
      path: '/prototypes/confetti-button'
    },
    {
      title: 'Digital Piano',
      description: 'A retro digital piano with old Mac OS styling and synth controls',
      path: '/prototypes/digital-piano'
    },
    {
      title: 'Noted OS',
      description: 'A window-based note-taking app with cyberpunk aesthetics, featuring draggable windows, rich text editing, and drawing canvas',
      path: '/prototypes/noted-os'
    },
    {
      title: 'Presentation Viewer',
      description: 'A click-through mockup of a presentation viewer interface highlighting key features like slide navigation, task organization, and real-time collaboration',
      path: '/prototypes/presentation-viewer'
    },
    {
      title: 'Feedback Widget',
      description: 'Floating feedback button with 1–5 severity scale, file attachment, and Slack CR team notification. Ready to port to Onebrief.',
      path: '/prototypes/feedback-widget'
    },
    {
      title: 'Personal Brand',
      description: 'Defense-tech themed personal brand site with hero, project showcase, design gallery, and contact section. Military HUD aesthetic.',
      path: '/prototypes/personal-brand'
    },
    {
      title: 'Iran OSINT Monitor',
      description: 'Live military flight tracker (ADS-B Exchange), rotating YouTube video feed, X/Twitter #Iran live posts, and Reddit signal feed.',
      path: '/prototypes/iran-osint'
    },
    {
      title: 'Decision Support Matrix',
      description: 'DSO/M prototype: C&E-driven operational design → live tactical map + decision matrix + timeline scrubber.',
      path: '/prototypes/decision-support-tool'
    },
    {
      title: 'Undercity Agent Monitor',
      description: 'Live 3D isometric WoW-themed monitoring dashboard for multi-agent Claude Code sessions. Profession workstations, raid briefings, summoning stone.',
      path: '/prototypes/undercity-monitor'
    },
    // Add your new prototypes here like this:
    // {
    //   title: 'Your new prototype',
    //   description: 'A short description of what this prototype does',
    //   path: '/prototypes/my-new-prototype'
    // },
  ];

  return (
    <div className={`${styles.container} ${instrumentSans.className}`}>
      <div className={styles.dashboard}>
        <div className={styles.scanline}></div>
        <header className={styles.header}>
          <div className={styles.neonTitle}>
            <span className={styles.titleGlow}>PROTOTYPE</span>
            <span className={styles.titleGlow}>SYSTEM</span>
          </div>
          <div className={styles.subtitle}>Elizabeth's Dashboard</div>
        </header>

        <main className={styles.main}>
          <div className={styles.grid}>
            {/* Goes through the prototypes list (array) to create cards */}
            {prototypes.map((prototype, index) => (
              <Link 
                key={index}
                href={prototype.path} 
                className={styles.card}
              >
                <div className={styles.cardGlow}></div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{prototype.title}</h3>
                  <p className={styles.cardDescription}>{prototype.description}</p>
                  <div className={styles.cardIndicator}>
                    <span className={styles.pulseDot}></span>
                    ACTIVE
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
        
        <div className={styles.footer}>
          <div className={styles.statusBar}>
            <span className={styles.statusItem}>SYSTEM: ONLINE</span>
            <span className={styles.statusItem}>PROTOTYPES: {prototypes.length}</span>
            <span className={styles.statusItem}>STATUS: READY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
