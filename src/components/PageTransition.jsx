import React from "react";
import "./PageTransition.css";

const PageTransition = ({ pages, activePage, onPageChange }) => {
  return (
    <div className="page-container">
      <aside className="page-sidebar">
        <div className="sidebar-balls-container">
          {pages.map((page) => (
            <div
              key={page.name}
              className={`page-ball ${
                activePage === page.name ? "active" : "inactive"
              }`}
              style={{ "--ball-logo": `url(${page.logo})` }}
              onClick={() => onPageChange(page.name)}
            >
              <span className="page-ball-text">{page.name}</span>
            </div>
          ))}
        </div>
      </aside>
      <main className="page-content">
        <div className="content-placeholder">
          <h1>{activePage}</h1>
          <p>There is nothing here, atleast not yet!</p>
        </div>
      </main>
    </div>
  );
};

export default PageTransition;
