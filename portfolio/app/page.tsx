"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import Galaxy from "@/app/components/Galaxy";
import ScrollTrigger from "gsap/ScrollTrigger";
import Navbar from "@/app/components/navbar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel"
import TiltedCard from '@/app/components/TiltedCard';


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
      <ambientLight intensity={1.4} />
      <directionalLight intensity={1.8} position={[-5, 3, 2]} />
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
  const projTitleRef = useRef<HTMLHeadingElement>(null);
const projCarouselRef = useRef<HTMLDivElement>(null);


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
      duration: 1.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section2Ref.current,
        start: "top center",
      },
    });

    gsap.to(".skill-icon", {
      opacity: 1,
      y: -10,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section2Ref.current,
        start: "top center",
      },
    });
  });

  /* Entrada GSAP – Sección 3 (Proyectos) */
useEffect(() => {
  if (!section3Ref.current) return;

  gsap.set([projTitleRef.current, projCarouselRef.current], {
    opacity: 0,
    y: 40,
  });

  gsap.to(projTitleRef.current, {
    opacity: 1,
    y: 0,
    duration: 1.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: section3Ref.current,
      start: "top center",
    },
  });

  gsap.to(projCarouselRef.current, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    delay: 0.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: section3Ref.current,
      start: "top center",
    },
  });
}, []);


  return (
    <main className="relative min-h-screen w-full text-white overflow-hidden">

      {/* LOADER */}
      {!loaderDone && (
        <div
          ref={whiteScreenRef}
          className="fixed inset-0 bg-black flex items-center justify-center z-[9999]"
        >
          <h1
            className="loader-text opacity-0 text-white text-3xl tracking-[0.5em]"
            style={{
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 300,
              letterSpacing: "0.25em",
            }}
          >
            EL PORTFOLIO DE VICTORIA
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

          
            <Navbar />
          

          <div className="hidden md:flex items-center gap-5 text-xl opacity-90">
            <i className="fa-brands fa-github hover:text-purple-400 transition"></i>
            <i className="fa-brands fa-linkedin hover:text-purple-400 transition"></i>
            <i className="fa-brands fa-x-twitter hover:text-purple-400 transition"></i>
          </div>
        </div>
      </nav>

      {/* HERO */}
<section ref={heroRef} className="h-[100vh] relative z-10 pt-72 pointer-events-none">

  {/* P debajo del todo, esquina inferior izquierda */}
  <p
    className="fade-up absolute left-6 bottom-10 md:left-12 xl:left-20 opacity-80"
    style={{
      fontFamily: "'Helvetica', sans-serif",
    }}
  >
    Desarrolladora Creativa. En todas partes
  </p>

  <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 grid grid-cols-1 md:grid-cols-2 items-center gap-20 pointer-events-none">
    <div className="max-w-xl relative z-20 order-1">
      <div className="fade-up mb-3 leading-[0.9]">
        <span
          className="mt-10 mb-2 opacity-90 block text-[120px] md:text-[140px]"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 'lighter',
            letterSpacing: "1px",
          }}
        >
          Victoria
        </span>

        <span
          className="ml-[1em] block opacity-90 text-[120px] md:text-[140px] font-extrabold tracking-wide"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 'lighter',
            letterSpacing: "1px",
          }}
        >
          Martín<span className="text-purple-600 opacity-90">.</span>
        </span>
      </div>
    </div>
  </div>
</section>


{/* SECCIÓN 2 – HABILIDADES (GLASSBOX CENTRAL) */}
<section
  ref={section2Ref}
  className="h-[80vh] flex flex-col items-center justify-center text-white relative z-10 pointer-events-none"
>
  {/* CONTENEDOR DEL TÍTULO DEL MISMO ANCHO QUE LA GLASSBOX */}
  <div className="w-[80vw] max-w-[1200px] mb-4">
    <h2
    
      className="text-3xl font-light tracking-[0.2em] opacity-0 skills-title text-gray-200 text-left"
      style={{ fontFamily: "Helvetica, Arial, sans-serif", letterSpacing: "0.1em" }}
    >
      HABILIDADES
    </h2>
  </div>

  {/* GLASSBOX */}
  <div
    className="
      w-[80vw]
      max-w-[1200px]
      py-14 px-10
      rounded-2xl
      bg-white/10
      backdrop-blur-xl
      shadow-[0_8px_40px_rgba(255,255,255,0.08)]
      flex flex-wrap justify-center gap-16
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
        <i className={`${item.icon} text-7xl text-white drop-shadow-xl mb-3`}></i>

        <span className="text-xs tracking-widest uppercase text-white/70 font-normal">
          {item.label}
        </span>
      </div>
    ))}
  </div>
</section>



{/* SECCIÓN 3 – CAROUSEL DE PROYECTOS (CON TILTEDCARD) */}
<section
  ref={section3Ref}
  className="h-[90vh] flex flex-col items-center justify-center text-white relative z-10"
>
  <div className="w-[80vw] max-w-[1150px]">
    <h2
    ref={projTitleRef}
      className="text-3xl font-light tracking-[0.2em] mb-1 opacity-70"
      style={{ fontFamily: "Helvetica, Arial, sans-serif", letterSpacing: "0.1em" }}
    >
      PROYECTOS
    </h2>
  </div>

  <div ref={projCarouselRef} className="w-[80vw] max-w-[1200px]">
    <Carousel className="w-full">
      <CarouselContent className="py-10 flex">

        {[
          {
            img: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
            title: "Kendrick Lamar - GNX",
          },
          {
            img: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
            title: "Album 2",
          },
          {
            img: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
            title: "Album 3",
          },
          {
            img: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
            title: "Album 4",
          },
          {
            img: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
            title: "Album 5",
          },
          {
            img: "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58",
            title: "Album 6",
          },
        ].map((item, i) => (
          <CarouselItem
            key={i}
            className="basis-full md:basis-1/3 flex justify-center"
          >
            <TiltedCard
              imageSrc={item.img}
              altText={item.title}
              captionText={item.title}
              containerHeight="410px"
              containerWidth="360px"
              imageHeight="410px"
              imageWidth="360px"
              rotateAmplitude={12}
              scaleOnHover={1.05}
              showMobileWarning={false}
              showTooltip={false}
              displayOverlayContent={true}
              overlayContent={
                <div
                  className="
                    px-4 py-2 
                    rounded-xl 
                    bg-white/10 
                    backdrop-blur-md 
                    border border-white/20 
                    shadow-lg 
                    text-white 
                    text-sm 
                    tracking-wide
                    mt-6 ml-6
                  "
                >
                  {item.title}
                </div>
              }
            />
          </CarouselItem>
        ))}

      </CarouselContent>

      <CarouselPrevious variant="iconClear" size="icon-lg" className="text-white hover:text-purple-300" />
      <CarouselNext variant="iconClear" size="icon-lg" className="text-white hover:text-purple-300" />
    </Carousel>
  </div>
</section>

<section
  className="
    h-[90vh]
    flex flex-col items-center justify-center
    text-white relative z-10
    px-4
  "
>
  {/* GLASSBOX */}
  <div
    className="
      w-[60vw]
      max-w-[1200px]
      py-14 px-10
      rounded-2xl
      bg-white/10
      backdrop-blur-xl
      shadow-[0_8px_40px_rgba(255,255,255,0.08)]
      flex flex-col gap-10
    "
  >
    <h2
      className="
        text-center text-3xl font-light tracking-[0.2em]
        mb-1 opacity-80
      "
      style={{ fontFamily: "Helvetica, Arial, sans-serif", letterSpacing: "0.1em" }}
    >
      Trabajemos juntos
    </h2>

    <form className="flex flex-col gap-8 text-white w-full">

      {/* Nombre */}
      <input
        type="text"
        placeholder="Nombre"
        className="
          bg-transparent
          border-b border-white/40
          outline-none
          py-3
          text-white
          placeholder-white/50
        "
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        className="
          bg-transparent
          border-b border-white/40
          outline-none
          py-3
          text-white
          placeholder-white/50
        "
      />

      {/* Mensaje */}
      <textarea
        placeholder="Mensaje"
        className="
          bg-transparent
          border-b border-white/40
          outline-none
          py-3
          text-white
          placeholder-white/50
          min-h-[100px]
          resize-none
        "
      />

      {/* Enviar */}
      <button
        type="submit"
        className="
          bg-white/90
          text-black
          px-6 py-3
          rounded-full
          font-normal
          w-full
          mt-4
          hover:bg-white
          transition
        "
      >
        Enviar
      </button>

    </form>
  </div>
</section>


    </main>
  );
}
