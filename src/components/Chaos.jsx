import React, { useState, useEffect, useRef } from "react";
import "./Chaos.css";

// --- Logo Imports remain the same ---
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

const BASE_SPEED = 1;
const MAX_SPEED_MULTIPLIER = 5;
const CHAOS_INCREASE_INTERVAL = 5000;
const BALL_SIZE = 120;
const SPARK_DURATION = 500;

const Chaos = ({ onNavigate }) => {
  const [mode, setMode] = useState("CHAOS"); // 'CHAOS', 'ALIGNING', 'ALIGNED'
  const [balls, setBalls] = useState([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [hoveredBallId, setHoveredBallId] = useState(null);
  const [sparks, setSparks] = useState([]);
  const containerRef = useRef(null);
  const animationFrameId = useRef(null);
  const targetPositions = useRef([]);

  // Initialize balls on mount
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setBalls(
        PAGES.map((page, index) => ({
          id: index,
          name: page.name,
          logo: page.logo,
          x: Math.random() * (width - BALL_SIZE),
          y: Math.random() * (height - BALL_SIZE),
          vx: (Math.random() - 0.5) * BASE_SPEED * 2,
          vy: (Math.random() - 0.5) * BASE_SPEED * 2,
          isHovered: false,
        }))
      );
    }
  }, []);

  const addSpark = (x, y) => {
    const newSpark = { id: Date.now() + Math.random(), x, y };
    setSparks((prev) => [...prev, newSpark]);
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
    }, SPARK_DURATION);
  };

  // Main animation loop
  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) return;
      animationFrameId.current = requestAnimationFrame(animate);

      if (mode === "CHAOS") {
        setBalls((prevBalls) => {
          const { width, height } =
            containerRef.current.getBoundingClientRect();
          const updatedBalls = prevBalls.map((ball) => {
            if (ball.isHovered) return ball;
            let newX = ball.x + ball.vx * speedMultiplier;
            let newY = ball.y + ball.vy * speedMultiplier;
            let newVx = ball.vx,
              newVy = ball.vy;
            if (newX <= 0 || newX >= width - BALL_SIZE) {
              newVx = -newVx;
              newX = Math.max(0, Math.min(newX, width - BALL_SIZE));
            }
            if (newY <= 0 || newY >= height - BALL_SIZE) {
              newVy = -newVy;
              newY = Math.max(0, Math.min(newY, height - BALL_SIZE));
            }
            return { ...ball, x: newX, y: newY, vx: newVx, vy: newVy };
          });

          for (let i = 0; i < updatedBalls.length; i++) {
            for (let j = i + 1; j < updatedBalls.length; j++) {
              const b1 = updatedBalls[i];
              const b2 = updatedBalls[j];
              if (b1.isHovered || b2.isHovered) continue;
              const dx = b1.x + BALL_SIZE / 2 - (b2.x + BALL_SIZE / 2);
              const dy = b1.y + BALL_SIZE / 2 - (b2.y + BALL_SIZE / 2);
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < BALL_SIZE) {
                addSpark(
                  (b1.x + b2.x + BALL_SIZE) / 2,
                  (b1.y + b2.y + BALL_SIZE) / 2
                );
                let tempVx = b1.vx;
                let tempVy = b1.vy;
                b1.vx = b2.vx;
                b1.vy = b2.vy;
                b2.vx = tempVx;
                b2.vy = tempVy;
                const overlap = BALL_SIZE - distance;
                const adjustX = ((dx / distance) * overlap) / 2;
                const adjustY = ((dy / distance) * overlap) / 2;
                b1.x += adjustX;
                b1.y += adjustY;
                b2.x -= adjustX;
                b2.y -= adjustY;
              }
            }
          }
          return updatedBalls;
        });
      } else if (mode === "ALIGNING") {
        setBalls((prevBalls) => {
          let allInPlace = true;
          const easingFactor = 0.05;
          const updatedBalls = prevBalls.map((ball, index) => {
            const target = targetPositions.current[index];
            if (!target) return ball;
            const newX = ball.x + (target.x - ball.x) * easingFactor;
            const newY = ball.y + (target.y - ball.y) * easingFactor;
            if (
              Math.abs(target.x - newX) > 0.5 ||
              Math.abs(target.y - newY) > 0.5
            ) {
              allInPlace = false;
            }
            return { ...ball, x: newX, y: newY };
          });
          if (allInPlace) {
            setMode("ALIGNED");
            return prevBalls.map((ball, index) => ({
              ...ball,
              x: targetPositions.current[index].x,
              y: targetPositions.current[index].y,
            }));
          }
          return updatedBalls;
        });
      }
    };
    if (mode === "CHAOS" || mode === "ALIGNING") {
      animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [mode, speedMultiplier, hoveredBallId]);

  // Effect to increase chaos
  useEffect(() => {
    if (mode !== "CHAOS") return;
    const chaosTimer = setInterval(() => {
      setSpeedMultiplier((prev) => Math.min(prev + 0.2, MAX_SPEED_MULTIPLIER));
    }, CHAOS_INCREASE_INTERVAL);
    return () => clearInterval(chaosTimer);
  }, [mode]);

  // --- MODIFIED: This function is now screen-size aware ---
  // --- MODIFIED: This function now aligns balls to the right on narrow screens ---
  const startAligning = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const spacing = 20;
      const isNarrowScreen = width < 768;

      if (isNarrowScreen) {
        // --- VERTICAL alignment logic for narrow screens (RIGHT SIDE) ---
        const totalHeight =
          PAGES.length * BALL_SIZE + (PAGES.length - 1) * spacing;
        const startY = (height - totalHeight) / 2;
        // Position the balls to be centered on the right 2/3 of the screen
        const targetX = width * 0.75 - BALL_SIZE / 2;
        targetPositions.current = PAGES.map((_, index) => ({
          x: targetX,
          y: startY + index * (BALL_SIZE + spacing),
        }));
      } else {
        // --- HORIZONTAL alignment logic for wider screens (no change) ---
        const totalWidth =
          PAGES.length * BALL_SIZE + (PAGES.length - 1) * spacing;
        const startX = (width - totalWidth) / 2;
        const targetY = (height - BALL_SIZE) / 2;
        targetPositions.current = PAGES.map((_, index) => ({
          x: startX + index * (BALL_SIZE + spacing),
          y: targetY,
        }));
      }
      setMode("ALIGNING");
    }
  };

  const adjustSpeed = (amount) => {
    setSpeedMultiplier((prev) =>
      Math.max(0.2, Math.min(prev + amount, MAX_SPEED_MULTIPLIER))
    );
  };

  const handleMouseEnterBall = (id) => {
    setHoveredBallId(id);
    setBalls((p) =>
      p.map((b) => (b.id === id ? { ...b, isHovered: true } : b))
    );
  };
  const handleMouseLeaveBall = (id) => {
    setHoveredBallId(null);
    setBalls((p) =>
      p.map((b) => (b.id === id ? { ...b, isHovered: false } : b))
    );
  };

  return (
    <>
      <div className={`controls-container ${mode !== "CHAOS" ? "hidden" : ""}`}>
        <button
          onClick={() => adjustSpeed(-0.5)}
          className="speed-control down-arrow"
        >
          <span className="arrow-line"></span>
        </button>
        <button onClick={startAligning} className="chaos-button">
          Chaos
        </button>
        <button
          onClick={() => adjustSpeed(0.5)}
          className="speed-control up-arrow"
        >
          <span className="arrow-line"></span>
        </button>
      </div>
      <div className="chaos-box" ref={containerRef}>
        {mode === "ALIGNED" && (
          <h2 className="prompt-text">Where do you want to go?</h2>
        )}
        {balls.map((ball) => (
          <div
            key={ball.id}
            className={`ball ${ball.isHovered ? "paused" : ""}`}
            style={{
              transform: `translate(${ball.x}px, ${ball.y}px)`,
              "--ball-logo": `url(${ball.logo})`,
            }}
            onClick={() => onNavigate(ball.name)}
            onMouseEnter={
              mode === "CHAOS" ? () => handleMouseEnterBall(ball.id) : null
            }
            onMouseLeave={
              mode === "CHAOS" ? () => handleMouseLeaveBall(id) : null
            }
          >
            <span className="ball-text">{ball.name}</span>
          </div>
        ))}
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className="spark-container"
            style={{ left: spark.x, top: spark.y }}
          >
            <div className="spark"></div>
            <div className="spark"></div>
            <div className="spark"></div>
            <div className="spark"></div>
            <div className="spark"></div>
            <div className="spark"></div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Chaos;
