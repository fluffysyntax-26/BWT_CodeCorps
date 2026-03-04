import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  LogIn,
} from "lucide-react";
import { useUser, SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

/**
 * Three.js Fluid Data Background Component
 */
const FluidBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    // Fog to fade out particles in the distance
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    // Set camera for the floor perspective
    camera.position.set(0, 3, 10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Plane geometry for the floor
    const geometry = new THREE.PlaneGeometry(40, 40, 100, 100);

    // Custom texture for round particles
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, "rgba(59, 130, 246, 1)"); // Blue-500
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.15,
      map: texture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    // Tilt flat to look like a sea/floor
    particles.rotation.x = -Math.PI / 2.2;
    particles.position.y = -2;
    scene.add(particles);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const positions = particles.geometry.attributes.position.array;

      // Create a fluid wave effect by modifying the Z axis
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];

        // Restored the original floor wave math
        const wave1 = Math.sin(x * 0.3 + elapsedTime * 0.8) * 0.5;
        const wave2 = Math.cos(y * 0.2 + elapsedTime * 0.5) * 0.5;
        const wave3 = Math.sin((x + y) * 0.1 + elapsedTime * 0.2) * 1.5;

        positions[i + 2] = wave1 + wave2 + wave3;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      // Slowly rotate the entire system
      particles.rotation.z = elapsedTime * 0.05;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Changed 'absolute' to 'fixed' so the background stays visible while scrolling
  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-60"
    />
  );
};

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="relative bg-slate-950 text-white min-h-screen overflow-hidden font-sans">
      {/* CSS Media Queries for Transitions */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
                /* Base state for feature cards */
                .feature-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(30, 41, 59, 0.8);
                }

                /* Mobile: Fast, snappy transitions */
                @media (max-width: 768px) {
                    .feature-card {
                        transition: transform 0.2s ease-out, border-color 0.2s ease-out;
                    }
                    .feature-card:active {
                        transform: scale(0.98);
                        border-color: rgba(59, 130, 246, 0.5);
                    }
                }

                /* Desktop: Fluid, floating hover transitions */
                @media (min-width: 769px) {
                    .feature-card {
                        transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                                    border-color 0.4s ease,
                                    box-shadow 0.4s ease;
                    }
                    .feature-card:hover {
                        transform: translateY(-12px) scale(1.02);
                        border-color: rgba(59, 130, 246, 0.6);
                        box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.15);
                    }
                }
            `,
        }}
      />

      {/* ThreeJS Background Layer */}
      <FluidBackground />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
          >
            FIN-GUARD AI
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="bg-blue-600 px-6 py-2.5 rounded-full font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 text-white inline-block"
              >
                Go to Dashboard
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 border border-slate-700 bg-slate-900/50 backdrop-blur-sm px-6 py-2.5 rounded-full hover:bg-slate-800 hover:border-slate-600 transition-all text-white">
                  <LogIn size={16} />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            )}
          </motion.div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-semibold tracking-wide uppercase">
              Empowering Your Finances
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
              Financial Safety <br />
              <span className="bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
                Grounded in Data.
              </span>
            </h2>
            <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              The AI-powered assistant designed for low-income households to
              make safer, smarter financial decisions. Navigate risks with
              confidence. <sup className="text-slate-500 text-xs">[1, 23]</sup>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isSignedIn ? (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-xl shadow-blue-600/20 w-full sm:w-auto justify-center text-white"
                >
                  Get Started Free <ArrowRight size={20} />
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-xl shadow-blue-600/20 w-full sm:w-auto justify-center text-white">
                    Get Started Free <ArrowRight size={20} />
                  </button>
                </SignUpButton>
              )}
              <button className="px-8 py-4 rounded-xl font-semibold flex items-center gap-2 text-slate-300 hover:text-white transition-colors w-full sm:w-auto justify-center">
                Learn More
              </button>
            </div>
          </motion.div>
        </main>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto py-24 px-6 relative">
          {/* Decorative gradient orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <FeatureCard
              delay={0.4}
              icon={<TrendingUp className="text-emerald-400" size={32} />}
              title="Expense Tracking"
              desc="Log and categorize daily spending to monitor your disposable income seamlessly."
            />
            <FeatureCard
              delay={0.6}
              icon={<ShieldCheck className="text-blue-400" size={32} />}
              title="Risk Evaluation"
              desc="Rule-based assessment algorithms tailored for major decisions like new EMIs."
            />
            <FeatureCard
              delay={0.8}
              icon={<MessageSquare className="text-purple-400" size={32} />}
              title="Contextual AI Chat"
              desc="Get explanations for financial risks grounded in your specific household data."
            />
          </div>
        </section>
      </div>

      {/* Footer overlay fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-10" />
    </div>
  );
}

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay }}
    className="feature-card p-8 rounded-2xl cursor-pointer"
  >
    <div className="mb-6 p-4 bg-slate-800/50 rounded-xl inline-block">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">
      {title}
    </h3>
    <p className="text-slate-400 leading-relaxed text-sm md:text-base">
      {desc}
    </p>
  </motion.div>
);
