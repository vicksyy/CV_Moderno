"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import Galaxy from "@/components/Galaxy";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* --------------------------------------------------
   🌍 MODELO TIERRA
-------------------------------------------------- */
function EarthModel() {
  const { scene } = useGLTF("/models/earth.glb");

  useEffect(() => {
    scene.scale.set(4.2, 4.2, 4.2);
    scene.position.set(2.8, 0, 0);
    scene.rotation.set(0.2, 1.1, 0.1);
  }, [scene]);

  return <primitive object={scene} />;
}

function EarthCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 1180], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight intensity={1.5} position={[5, 5, 5]} />
      <EarthModel />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        enableRotate={true}
      />
    </Canvas>
  );
}

/* --------------------------------------------------
   🛸 OVNI
-------------------------------------------------- */
function UfoModel() {
  const { scene } = useGLTF("/models/ovni.glb");

useEffect(() => {
  scene.scale.set(1.3, 1.3, 1.3);
  scene.rotation.set(0.3, 3.2, 0.05); 
  scene.position.set(0, 0, 0);
}, [scene]);


  return <primitive object={scene} />;
}

function UfoCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={5} />
      <directionalLight intensity={5} position={[-4, 4, -4]} />
      <UfoModel />

      {/* Permitir rotación con mouse */}
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} />
    </Canvas>
  );
}

/* --------------------------------------------------
   PAGE
-------------------------------------------------- */
export default function Page() {
  const heroRef = useRef<HTMLDivElement>(null);
  const ufoRef = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  /* Smooth scroll */
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });

    function raf(t: number) {
      lenis.raf(t);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  /* Animaciones de texto */
  useGSAP(() => {
    gsap.from(".fade-up", {
      opacity: 0,
      y: 40,
      duration: 1.3,
      ease: "power3.out",
      stagger: 0.15,
    });
  }, { scope: heroRef });

  /* --------------------------------------------------
      🛸 OVNI DIAGONAL:
      entra desde IZQUIERDA-ARRIBA →
      sale por DERECHA-ABAJO
  -------------------------------------------------- */
  useEffect(() => {
  const ufo = ufoRef.current;

  if (!ufo || !section2Ref.current || !section3Ref.current) return;

  gsap.set(ufo, { x: "-40vw", y: "-20vh" });

  gsap.to(ufo, {
    x: "250vw",
    y: "55vh",
    ease: "none", // mucho más suave en scroll
    scrollTrigger: {
      trigger: section2Ref.current,
      start: "bottom bottom",   // ⭐ empieza más tarde aún
      end: () => `${section3Ref.current!.offsetTop + 600}`, // ⭐ termina más abajo = recorrido + largo
      scrub: true,
    },
  });
}, []);


  return (
    <main className="relative min-h-screen w-full text-white overflow-hidden">

      {/* 🌌 Galaxy */}
      <div className="fixed inset-0 -z-20 bg-black">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.5}
          glowIntensity={0.5}
          saturation={0.8}
          hueShift={240}
        />
      </div>

      {/* 🌍 TIERRA */}
      <div
        className="
          pointer-events-auto
          absolute
          top-[-15vh]
          right-[-50vw]
          h-[130vh]
          w-[130vw]
          overflow-visible
          z-10
        "
      >
        <EarthCanvas />
      </div>

      {/* 🛸 OVNI DETRÁS DEL TEXTO */}
      <div
        ref={ufoRef}
        className="
          absolute
          top-[95vh]
          left-[-40vw]
          w-[100vw]
          h-[100vh]
          z-[5]
          pointer-events-auto
        "
      >
        <UfoCanvas />
      </div>

      {/* Glow */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-purple-600/40 blur-[140px] opacity-60 pointer-events-none" />

      {/* NAVBAR */}
      <nav className="w-full fixed top-0 left-0 z-50">
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/tu-logo.png" alt="logo" className="w-10 h-10 object-contain" />
          </div>

          <div
            className="
              hidden md:flex items-center gap-10 
              px-10 py-3 
              bg-white/10 backdrop-blur-xl
              rounded-full border border-white/10 shadow-lg
            "
          >
            {["About me", "Skills", "Projects", "Source Code"].map((item) => (
              <button
                key={item}
                className="text-sm font-medium opacity-90 hover:text-purple-400 transition"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5 text-xl opacity-90">
            <i className="fa-brands fa-instagram hover:text-purple-400 transition"></i>
            <i className="fa-brands fa-github hover:text-purple-400 transition"></i>
            <i className="fa-brands fa-x-twitter hover:text-purple-400 transition"></i>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative z-10 pt-72 pointer-events-none">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 grid grid-cols-1 md:grid-cols-2 items-center gap-20 pointer-events-none">
          <div className="max-w-xl relative z-20 order-1">
            <div className="fade-up mb-6 leading-[0.9]">
              <span className="block text-[70px] md:text-[90px] font-[400] italic font-serif">
                Creative
              </span>
              <span className="block text-[60px] md:text-[80px] font-extrabold tracking-wide">
                DEVELOPER<span className="text-purple-400">.</span>
              </span>
            </div>

            <p className="fade-up text-gray-300 mb-6">
              Por todo el mundo.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2 */}
      <section
        ref={section2Ref}
        className="h-[100vh] flex items-center justify-center text-white relative z-10 pointer-events-none"
      >
        <h2 className="text-3xl opacity-50">Dominio del 3D</h2>
      </section>

      {/* SECCIÓN 3 */}
      <section
        ref={section3Ref}
        className="h-[100vh] flex items-center justify-center text-white relative z-10 pointer-events-none"
      >
        <h2 className="text-3xl opacity-50">Aquí empieza la tercera sección</h2>
      </section>

    </main>
  );
}
