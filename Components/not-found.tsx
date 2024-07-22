"use client";

import React, { useEffect, useRef } from "react";

const TVStaticBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastUpdateTime = 0;
    const updateInterval = 100; // Update every 100ms

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const drawStatic = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 16) {
        // Update every 4th pixel
        if (Math.random() > 0.5) {
          // 50% chance to update each pixel
          const noise = Math.floor(Math.random() * 255);
          data[i] = noise; // red
          data[i + 1] = noise; // green
          data[i + 2] = noise; // blue
          data[i + 3] = 255; // alpha
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const animate = (currentTime: number) => {
      if (currentTime - lastUpdateTime > updateInterval) {
        drawStatic();
        lastUpdateTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.3,
      }}
    />
  );
};

const TV404Page: React.FC = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: '"Courier New", Courier, monospace',
        color: "white",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        background: "black",
      }}
    >
      <TVStaticBackground />
      <div
        style={{
          position: "relative",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <h1 style={{ fontSize: "4rem", margin: "0" }}>404</h1>
        <h2 style={{ fontSize: "2rem", margin: "0" }}>CHANNEL NOT FOUND</h2>
        <p style={{ fontSize: "1.2rem", marginTop: "2rem" }}>
          Please stand by or return to our{" "}
          <a href="/" style={{ color: "#00ff00" }}>
            main broadcast
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default TV404Page;
