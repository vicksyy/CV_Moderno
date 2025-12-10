"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import Galaxy from "@/app/components/Galaxy";
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
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} enableRotate={true} />
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

  /* Loader */
  const [loaderDone, setLoaderDone] = useState(false);

  const whiteScreenRef = useRef<HTMLDivElement>(null);
  const blackScreenRef = useRef<HTMLDivElement>(null);

  /* --------------------------------------------------
      🚫 Bloquear scroll mientras loader está activo
  -------------------------------------------------- */
  useEffect(() => {
    if (!loaderDone) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [loaderDone]);

  /* --------------------------------------------------
      🔁 Forzar scroll a top al recargar
  -------------------------------------------------- */
  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 50);
  }, []);

  /* Loader Animation */
  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => setLoaderDone(true),
    });

    tl.fromTo(
      ".loader-text",
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: "power2.out", delay: 0.5 }
    )
      .to(".loader-text", {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
      })
      .to(whiteScreenRef.current, {
        y: "-100%",
        duration: 1.5,
        ease: "power3.inOut",
      })
      .to(
        blackScreenRef.current,
        {
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
        },
        "-=0.3"
      );
  }, []);

  /* Smooth scroll (solo se activa cuando loaderDone = true) */
  useEffect(() => {
    if (!loaderDone) return;

    const lenis = new Lenis({ lerp: 0.08 });

    function raf(t: number) {
      lenis.raf(t);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

  }, [loaderDone]);

  /* Fade-up (hero) */
  useGSAP(
    () => {
      gsap.from(".fade-up", {
        opacity: 0,
        y: 40,
        duration: 1.3,
        ease: "power3.out",
        stagger: 0.15,
      });
    },
    { scope: heroRef }
  );

  /* 🛸 OVNI scroll animation */
  useEffect(() => {
    const ufo = ufoRef.current;

    if (!ufo || !section2Ref.current || !section3Ref.current) return;

    gsap.set(ufo, { x: "-60vw", y: "-20vh" });

    gsap.to(ufo, {
      x: "250vw",
      y: "95vh",
      ease: "none",
      scrollTrigger: {
        trigger: section2Ref.current,
        start: "top 95%",
        end: () => `${section3Ref.current!.offsetTop + 600}`,
        scrub: true,
      },
    });
  }, []);

  /* Animación habilidades */
  useGSAP(() => {
    gsap.to(".skills-title", {
      opacity: 1,
      y: -20,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section2Ref.current,
        start: "top center",
      },
    });

    gsap.to(".skill-icon", {
      opacity: 1,
      y: -10,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section2Ref.current,
        start: "top center",
      },
    });
  });

  return (
    <main className="relative min-h-screen w-full text-white overflow-hidden">

      {/* LOADER */}
      {!loaderDone && (
        <div
          ref={whiteScreenRef}
          className="fixed inset-0 bg-black flex items-center justify-center z-[9999]"
        >
          <h1
            className="loader-text text-white text-3xl tracking-[0.5em]"
            style={{
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 300,
              letterSpacing: "0.25em",
            }}
          >
            EL PORTFOLIO DE VICKY
          </h1>
        </div>
      )}

      {!loaderDone && (
        <div
          ref={blackScreenRef}
          className="fixed inset-0 bg-black z-[9998]"
        />
      )}

      {/* 🌌 Galaxy */}
      <div className="fixed inset-0 -z-20 bg-black">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1}
          glowIntensity={0.3}
          saturation={0.2}
          hueShift={240}
        />
      </div>

      {/* 🌍 Tierra */}
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

      {/* 🛸 OVNI */}
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
            <i className="fa-brands fa-github hover:text-purple-400 transition"></i>
            <i className="fa-brands fa-linkedin hover:text-purple-400 transition"></i>
            <i className="fa-brands fa-x-twitter hover:text-purple-400 transition"></i>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="h-[100vh] relative z-10 pt-72 pointer-events-none">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 grid grid-cols-1 md:grid-cols-2 items-center gap-20 pointer-events-none">
          <div className="max-w-xl relative z-20 order-1">
            <div className="fade-up mb-6 leading-[0.9]">
             <span
                className="block text-[70px] md:text-[90px]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 500, // más elegante
                  letterSpacing: "-0.5px", // serif moderna más fina
                }}
              >
                Creative
              </span>

              <span
                className="block text-[60px] md:text-[80px] font-extrabold tracking-wide"
                style={{
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontWeight: 600,
                }}
              >
                DEVELOPER<span className="text-purple-400">.</span>
              </span>
            </div>

            <p className="fade-up text-gray-300 mb-6">
              Por todo el mundo.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2 – HABILIDADES (GLASSBOX CENTRAL) */}
{/* SECCIÓN 2 – HABILIDADES (GLASSBOX CENTRAL) */}
<section
  ref={section2Ref}
  className="h-[90vh] flex flex-col items-center justify-center text-white relative z-10 pointer-events-none"
>
  {/* CONTENEDOR DEL TÍTULO DEL MISMO ANCHO QUE LA GLASSBOX */}
  <div className="w-[80vw] max-w-[1000px] mb-4">
    <h2
      className="text-2xl font-normal tracking-[0.25em] opacity-0 skills-title text-gray-300 text-left"
      style={{ fontFamily: "Helvetica, Arial, sans-serif", letterSpacing: "0.1em" }}
    >
      HABILIDADES
    </h2>
  </div>

  {/* GLASSBOX */}
  <div
    className="
      w-[80vw]
      max-w-[1000px]
      py-14 px-10
      rounded-2xl
      bg-white/10
      backdrop-blur-xl
      shadow-[0_8px_40px_rgba(255,255,255,0.08)]
      flex flex-wrap justify-center gap-14
      pointer-events-none
    "
  >
    {[
      { icon: "fa-brands fa-square-js", label: "JavaScript" },
      { icon: "fa-brands fa-react", label: "React" },
      { icon: "fa-solid fa-cubes", label: "Three.js" },
      { icon: "fa-brands fa-node-js", label: "Node.js" },
      { icon: "fa-brands fa-git-alt", label: "Git" },
      { icon: "fa-brands fa-github", label: "GitHub" },
      { icon: "fa-brands fa-figma", label: "Figma" },
      { icon: "fa-brands fa-bootstrap", label: "Bootstrap" },
    ].map((item, i) => (
      <div
        key={i}
        className="
          skill-icon opacity-0
          flex flex-col items-center justify-center
        "
      >
        <i className={`${item.icon} text-6xl text-white drop-shadow-xl mb-3`}></i>

        <span className="text-xs tracking-widest uppercase text-white/70 font-semibold">
          {item.label}
        </span>
      </div>
    ))}
  </div>
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
