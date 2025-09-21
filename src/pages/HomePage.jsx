import React, { useState } from "react";
import Chaos from "../components/Chaos";
import PageTransition from "../components/PageTransition"; // Import the new component
import "./HomePage.css";

// --- Logo Imports and PAGES array now live here ---
import aboutMeLogo from "../assets/about-me.png";
import publicationsLogo from "../assets/publications.png";
import awardsLogo from "../assets/awards.png";
import experienceLogo from "../assets/experience.png";
import educationLogo from "../assets/education.png";

const PAGES = [
  { name: "About Me", logo: aboutMeLogo },
  { name: "Publications", logo: publicationsLogo },
  { name: "Awards", logo: awardsLogo },
  { name: "Experience", logo: experienceLogo },
  { name: "Education", logo: educationLogo },
];

const HomePage = () => {
  const [isChaosMode, setIsChaosMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(null);

  const handleNavigation = (pageName) => {
    // This function is called from the Chaos component
    setCurrentPage(pageName);
    setIsChaosMode(false);
  };

  const handlePageChange = (pageName) => {
    // This function is called from the PageTransition component
    setCurrentPage(pageName);
  };

  return (
    <div className="homepage-container">
      {isChaosMode ? (
        <Chaos
          pages={PAGES} // Pass pages down to Chaos
          onNavigate={handleNavigation}
        />
      ) : (
        <PageTransition
          pages={PAGES}
          activePage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default HomePage;
