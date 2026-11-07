"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface HeroScene3DProps {
  className?: string;
}

export default function HeroScene3D({ className = "" }: HeroScene3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      // 1. Scene, Camera, Renderer
      const scene = new THREE.Scene();

      const initialW = container.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 390);
      const initialH = container.clientHeight || 360;
      const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

      const camera = new THREE.PerspectiveCamera(
        45,
        initialW / initialH,
        0.1,
        100
      );

      const getCamZ = (w: number) => {
        // Laptop / Desktop: Exactly preserve the pristine original scale
        const isDesktopScreen = typeof window !== "undefined" && window.innerWidth >= 1024;
        if (isDesktopScreen) {
          return 5.4;
        }
        // Mobile / Small tablet
        if (w < 380) return 4.4;
        if (w < 480) return 4.3;
        if (w < 768) return 4.5;
        return 5.4;
      };
      camera.position.set(0, 0, getCamZ(initialW));

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          precision: "highp",
          depth: true,
          stencil: false,
        });
      } catch (err) {
        console.warn("[HeroScene3D] WebGLRenderer error fallback", err);
        renderer = new THREE.WebGLRenderer({
          alpha: true,
        });
      }

      renderer.setSize(initialW, initialH, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      renderer.domElement.style.touchAction = "pan-y";
      renderer.setPixelRatio(isMobile ? Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 1.5) : Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;
      container.appendChild(renderer.domElement);

      // =========================================================================
      // 2. PROCEDURAL ENVIRONMENT SPHERE (Dynamic Specular Reflections)
      // =========================================================================
      const envCanvas = document.createElement("canvas");
      envCanvas.width = 512;
      envCanvas.height = 256;
      const envCtx = envCanvas.getContext("2d");
      if (envCtx) {
        const grad = envCtx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, "#1a1600");
        grad.addColorStop(0.3, "#f5d90a");
        grad.addColorStop(0.5, "#ffffff");
        grad.addColorStop(0.7, "#111111");
        grad.addColorStop(1, "#050505");
        envCtx.fillStyle = grad;
        envCtx.fillRect(0, 0, 512, 256);

        // Light bars for sharp specular reflections
        envCtx.fillStyle = "rgba(255, 255, 255, 0.9)";
        envCtx.fillRect(100, 30, 80, 20);
        envCtx.fillRect(320, 50, 100, 15);
        envCtx.fillStyle = "rgba(245, 217, 10, 0.8)";
        envCtx.fillRect(200, 80, 120, 25);
      }
      const envTex = new THREE.CanvasTexture(envCanvas);
      envTex.mapping = THREE.EquirectangularReflectionMapping;

      let envMapTex: THREE.Texture = envTex;
      try {
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        envMapTex = pmrem.fromEquirectangular(envTex).texture;
        scene.environment = envMapTex;
        pmrem.dispose();
      } catch {
        scene.environment = envTex;
      }

      // =========================================================================
      // 3. THE FLUID LIQUID METAL SPHERE (The Signature Molten Gold Orb)
      // Pure, majestic spherical orb with subtle, organic liquid wave ripples
      // =========================================================================
      const sphereRadius = isMobile ? 1.30 : 1.45;
      const sphereDetail = isMobile ? 48 : 64;
      const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereDetail, sphereDetail);

      const sphereUniforms = {
        uTime: { value: 0 },
        uWaveAmp: { value: isMobile ? 0.06 : 0.12 },
        uShockwave: { value: 0 },
      };

      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: 0xd4af37, // Rich 24K pure liquid gold
        emissive: 0x241804, // Deep warm internal core glow
        emissiveIntensity: 0.35,
        metalness: 0.98,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 1.0,
        envMap: envMapTex,
        envMapIntensity: isMobile ? 3.0 : 2.8,
      });

      // Hook vertex shader for hardware-accelerated ripples (0% CPU, 120 FPS)
      sphereMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = sphereUniforms.uTime;
        shader.uniforms.uWaveAmp = sphereUniforms.uWaveAmp;
        shader.uniforms.uShockwave = sphereUniforms.uShockwave;

        shader.vertexShader = `
          uniform float uTime;
          uniform float uWaveAmp;
          uniform float uShockwave;
        ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          "#include <beginnormal_vertex>",
          `
          #include <beginnormal_vertex>
          vec3 nDirNorm = normalize(position);
          float nw1 = cos(nDirNorm.x * 3.8 + uTime * 1.6) * 3.8;
          float nw2 = -sin(nDirNorm.y * 4.18 + uTime * 1.36) * 4.18;
          float nw3 = cos(nDirNorm.z * 3.42 + uTime * 1.84) * 3.42;
          float sw1 = sin(nDirNorm.x * 3.8 + uTime * 1.6);
          float cw2 = cos(nDirNorm.y * 4.18 + uTime * 1.36);
          float sw3 = sin(nDirNorm.z * 3.42 + uTime * 1.84);
          vec3 ripGrad = vec3(nw1 * cw2 * sw3, nw2 * sw1 * sw3, nw3 * sw1 * cw2) * uWaveAmp;
          objectNormal = normalize(objectNormal - ripGrad * 0.45);
          `
        );

        shader.vertexShader = shader.vertexShader.replace(
          "#include <begin_vertex>",
          `
          #include <begin_vertex>
          vec3 nDir = normalize(position);
          float w1 = sin(nDir.x * 3.8 + uTime * 1.6);
          float w2 = cos(nDir.y * 4.18 + uTime * 1.36);
          float w3 = sin(nDir.z * 3.42 + uTime * 1.84);
          float shock = uShockwave * sin(nDir.y * 8.0 - uTime * 8.0) * 0.2;
          float disp = (w1 * w2 * w3 * uWaveAmp) + shock;
          transformed = position * (1.0 + disp);
          `
        );
      };

      const fluidSphere = new THREE.Mesh(sphereGeo, sphereMat);
      scene.add(fluidSphere);

      // =========================================================================
      // 4. FLOATING GOLDEN EMBER PARTICLES AROUND SPHERE
      // =========================================================================
      const particleCount = isMobile ? 90 : 200;
      const particlePos = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = 2.0 + Math.random() * 2.2;

        particlePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        particlePos[i * 3 + 2] = r * Math.cos(phi);
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));

      const pCanvas = document.createElement("canvas");
      pCanvas.width = 32;
      pCanvas.height = 32;
      const pCtx = pCanvas.getContext("2d");
      if (pCtx) {
        const g = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, "rgba(255, 255, 255, 1)");
        g.addColorStop(0.3, "rgba(245, 217, 10, 0.8)");
        g.addColorStop(1, "rgba(0, 0, 0, 0)");
        pCtx.fillStyle = g;
        pCtx.fillRect(0, 0, 32, 32);
      }
      const pTex = new THREE.CanvasTexture(pCanvas);

      const particleMat = new THREE.PointsMaterial({
        size: isMobile ? 0.09 : 0.1,
        map: pTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.75,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // =========================================================================
      // 6. HIGH-CONTRAST CINEMATIC STUDIO LIGHTING RIG
      // =========================================================================
      const ambientLight = new THREE.AmbientLight(0x181406, isMobile ? 1.8 : 1.6);
      scene.add(ambientLight);

      // Warm 24K Key Light from Upper Right
      const goldKeyLight = new THREE.DirectionalLight(0xffdf66, isMobile ? 4.5 : 4.2);
      goldKeyLight.position.set(4, 3.5, 3.5);
      scene.add(goldKeyLight);

      // Sharp Platinum Edge Rim Light from Lower Left Back
      const coldRimLight = new THREE.DirectionalLight(0xffffff, isMobile ? 4.0 : 3.8);
      coldRimLight.position.set(-4, -2.5, -3.5);
      scene.add(coldRimLight);

      // Golden Halo Backlight for Cinematic Rim Glow
      const goldBackRim = new THREE.DirectionalLight(0xf5d90a, isMobile ? 3.6 : 3.4);
      goldBackRim.position.set(2, 3, -4);
      scene.add(goldBackRim);

      // Soft Front Fill (Subtle, never washing out fluid gold highlights)
      const frontFillLight = new THREE.PointLight(0xf5d90a, 1.2, 10, 1.5);
      frontFillLight.position.set(0, 0, 4.5);
      scene.add(frontFillLight);

      // =========================================================================
      // 7. INTERACTIVE PHYSICS (TOUCH DRAG & SHOCKWAVE)
      // =========================================================================
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;
      let targetRotX = 0;
      let targetRotY = 0;
      let currentRotX = 0;
      let currentRotY = 0;
      let velX = 0;
      let velY = 0;

      let mouseHoverX = 0;
      let mouseHoverY = 0;
      let shockwaveIntensity = 0;

      const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      };

      const onPointerMove = (e: PointerEvent) => {
        mouseHoverX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseHoverY = -(e.clientY / window.innerHeight) * 2 + 1;

        if (!isDragging) return;
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        velY += dx * 0.005;
        velX += dy * 0.005;
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      const onClick = () => {
        shockwaveIntensity = 1.0;
      };

      renderer.domElement.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      renderer.domElement.addEventListener("click", onClick);

      // =========================================================================
      // 8. ANIMATION LOOP (HARDWARE ACCELERATED FLUID ORB)
      // =========================================================================
      let animId: number;
      const clock = new THREE.Clock();

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const render = () => {
        const t = clock.getElapsedTime();

        if (!prefersReducedMotion) {
          // Drag inertia & damping
          targetRotY += velY;
          targetRotX += velX;
          velX *= 0.9;
          velY *= 0.9;

          // Baseline steady auto-rotation
          targetRotY += isMobile ? 0.0038 : 0.0035;

          currentRotX += (targetRotX + mouseHoverY * 0.18 - currentRotX) * 0.08;
          currentRotY += (targetRotY + mouseHoverX * 0.22 - currentRotY) * 0.08;

          fluidSphere.rotation.x = currentRotX;
          fluidSphere.rotation.y = currentRotY;

          // Shockwave decay
          if (shockwaveIntensity > 0.005) {
            shockwaveIntensity *= 0.93;
          } else {
            shockwaveIntensity = 0;
          }

          // Liquid ripple wave amplitude (subtle, elegant, never distorted into a lumpy egg)
          const baseWaveAmp = isMobile ? 0.06 : 0.12;
          sphereUniforms.uTime.value = t;
          sphereUniforms.uWaveAmp.value = baseWaveAmp + shockwaveIntensity * (isMobile ? 0.15 : 0.35);
          sphereUniforms.uShockwave.value = shockwaveIntensity;

          // Particles gentle drift
          particles.rotation.y = t * 0.04;
          particles.rotation.x = Math.sin(t * 0.03) * 0.08;

          // Front fill light reacts to mouse/touch
          frontFillLight.position.x = mouseHoverX * 2.0;
          frontFillLight.position.y = mouseHoverY * 2.0;
        }

        renderer.render(scene, camera);
      };

      // IntersectionObserver: Pause rendering when scrolled past hero section
      let isVisible = true;
      let visibilityObserver: IntersectionObserver | null = null;
      if (typeof IntersectionObserver !== "undefined") {
        visibilityObserver = new IntersectionObserver(
          (entries) => {
            if (entries[0]) {
              isVisible = entries[0].isIntersecting;
            }
          },
          { threshold: 0.05 }
        );
        visibilityObserver.observe(container);
      }

      const renderLoop = () => {
        animId = requestAnimationFrame(renderLoop);
        if (!isVisible) return;
        render();
      };

      renderLoop();

      // =========================================================================
      // 9. RESIZE & VIEWPORT SYNC (Precision ResizeObserver)
      // =========================================================================
      const updateSize = (w: number, h: number) => {
        if (!w || !h || !renderer) return;
        camera.aspect = w / h;
        camera.position.z = getCamZ(w);
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      };

      // Ensure exact initial sizing once layout settles
      requestAnimationFrame(() => {
        if (container) {
          const w = container.clientWidth;
          const h = container.clientHeight;
          if (w && h) updateSize(w, h);
        }
      });

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: w, height: h } = entry.contentRect;
          if (w > 0 && h > 0) {
            updateSize(w, h);
          }
        }
      });
      resizeObserver.observe(container);

      // =========================================================================
      // 10. CLEANUP
      // =========================================================================
      return () => {
        if (visibilityObserver) {
          visibilityObserver.disconnect();
        }
        resizeObserver.disconnect();
        if (renderer.domElement) {
          renderer.domElement.removeEventListener("pointerdown", onPointerDown);
          renderer.domElement.removeEventListener("click", onClick);
        }
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        cancelAnimationFrame(animId);

        sphereGeo.dispose();
        sphereMat.dispose();
        particleGeo.dispose();
        particleMat.dispose();
        pTex.dispose();
        envTex.dispose();

        renderer.dispose();
        if (container && renderer.domElement && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      console.error("[HeroScene3D] UNCAUGHT ERROR IN MOUNT:", err);
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none touch-pan-y ${className}`}
      title="Drag to rotate molten gold // Click for acoustic ripple"
    />
  );
}
