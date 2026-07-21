"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import styles from "./why.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function WhyScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.1, 6.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4.5, 5.5, 6);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.1);
    fillLight.position.set(-5, 1.5, 4);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(0, -2, -4);

    scene.add(ambientLight, keyLight, fillLight, rimLight);

    const group = new THREE.Group();
    scene.add(group);

    const loader = new GLTFLoader();
    let modelRoot: THREE.Object3D | null = null;
    let frameId = 0;
    let destroyed = false;
    let scrollProgress = 0;
    let scrollTrigger: ScrollTrigger | null = null;
    let freeSpinY = 0;
    let finalCtaVisualProgress = 0;

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      if (!width || !height) {
        return;
      }

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const getCardTarget = (cardElement: HTMLElement) => {
      const mountRect = mount.getBoundingClientRect();
      const cardRect = cardElement.getBoundingClientRect();
      const targetX = cardRect.left + cardRect.width * 0.5;
      const targetY = cardRect.top + cardRect.height * 0.36;

      const localX = targetX - mountRect.left;
      const localY = targetY - mountRect.top;
      const ndcX = localX / mountRect.width * 2 - 1;
      const ndcY = -(localY / mountRect.height) * 2 + 1;
      const distance = camera.position.z;
      const visibleHeight =
        2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;
      const visibleWidth = visibleHeight * camera.aspect;

      return {
        x: ndcX * visibleWidth * 0.5,
        y: ndcY * visibleHeight * 0.5,
      };
    };

    resize();

    loader.load("/3d/paperCoffeeCup.glb", (gltf) => {
      if (destroyed) {
        return;
      }

      const model = gltf.scene;
      modelRoot = model;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z) || 1;
      const scale = 1.8 / maxAxis;
      model.position.sub(center);
      model.position.y = -0.98;
      model.scale.setScalar(scale);
      model.rotation.set(-0.18, -0.55, 0.04);

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });

      group.add(model);
    });

    const stageElement = mount.closest(`.${styles.stageWrap}`);
    const triggerElement = mount.closest(`.${styles.heroSection}`);
    const titleElement = stageElement?.querySelector(`.${styles.stageTitleWrap}`);
    const pointsElement = stageElement?.querySelector(`.${styles.pointGrid}`);
    const reasonScreens = stageElement
      ? Array.from(
          stageElement.querySelectorAll<HTMLElement>(`.${styles.reasonScreen}`),
        )
      : [];
    const reasonCards = reasonScreens.map((screen) =>
      screen.querySelector<HTMLElement>(`.${styles.reasonCard}`),
    );
    const reasonDetails = reasonScreens.map((screen) =>
      screen.querySelector<HTMLElement>(`.${styles.reasonDetail}`),
    );
    const cupCardElement = stageElement?.querySelector(`.${styles.cupCard}`);
    const finalCtaElement = stageElement?.querySelector(`.${styles.finalCta}`);

    if (stageElement && triggerElement) {
      scrollTrigger = ScrollTrigger.create({
        trigger: triggerElement,
        pin: stageElement,
        start: "top top",
        end: "+=900%",
        scrub: 3,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollProgress = self.progress;
        },
      });
    }

    const tick = () => {
      frameId = window.requestAnimationFrame(tick);
      const textProgress = Math.min(scrollProgress / 0.14, 1);
      const cardStart = 0.1;
      const cardEnd = 0.24;
      const detailStart = 0.18;
      const detailEnd = 0.32;
      const screenHolds = [
        { start: 0.32, end: 0.47 },
        { start: 0.6, end: 0.71 },
        { start: 0.84, end: 0.92 },
        { start: 0.97, end: 0.985 },
      ];
      const screenTransitions = [
        { start: 0.47, end: 0.6 },
        { start: 0.71, end: 0.84 },
        { start: 0.92, end: 0.97 },
      ];
      const holdTurns = [3, 3, 3, 2];
      const finalRevealStart = 0.97;
      const finalRevealRawProgress = THREE.MathUtils.clamp(
        (scrollProgress - finalRevealStart) / (1 - finalRevealStart),
        0,
        1,
      );
      const finalRevealProgress = THREE.MathUtils.smootherstep(
        THREE.MathUtils.smootherstep(finalRevealRawProgress, 0, 1),
        0,
        1,
      );
      const finalCtaLagFactor = 0.065;
      finalCtaVisualProgress = THREE.MathUtils.lerp(
        finalCtaVisualProgress,
        finalRevealProgress,
        finalCtaLagFactor,
      );

      if (Math.abs(finalCtaVisualProgress - finalRevealProgress) < 0.0015) {
        finalCtaVisualProgress = finalRevealProgress;
      }
      const firstCardProgress = THREE.MathUtils.clamp(
        (scrollProgress - cardStart) / (cardEnd - cardStart),
        0,
        1,
      );
      const firstDetailProgress = THREE.MathUtils.clamp(
        (scrollProgress - detailStart) / (detailEnd - detailStart),
        0,
        1,
      );
      const fallingProgress = Math.min(scrollProgress / detailEnd, 1);
      const fallingRotationZ = THREE.MathUtils.lerp(0, 2.4, fallingProgress);
      freeSpinY += 0.0036 * (1 - firstDetailProgress * 0.92);

      let activeScreenIndex = 0;
      let activeTransitionProgress = 0;

      for (let index = 0; index < screenTransitions.length; index += 1) {
        const transition = screenTransitions[index];
        const nextHold = screenHolds[index + 1];

        if (scrollProgress >= transition.start && scrollProgress < transition.end) {
          activeScreenIndex = index;
          activeTransitionProgress = THREE.MathUtils.clamp(
            (scrollProgress - transition.start) / (transition.end - transition.start),
            0,
            1,
          );
          break;
        }

        if (nextHold && scrollProgress >= nextHold.start) {
          activeScreenIndex = index + 1;
        }
      }

      let spinAngle = 0;
      for (let index = 0; index < screenHolds.length; index += 1) {
        const hold = screenHolds[index];
        const fullTurnAngle = holdTurns[index] * Math.PI * 2;

        if (scrollProgress >= hold.end) {
          spinAngle += fullTurnAngle;
          continue;
        }

        if (scrollProgress > hold.start) {
          const holdProgress = THREE.MathUtils.clamp(
            (scrollProgress - hold.start) / (hold.end - hold.start),
            0,
            1,
          );
          spinAngle +=
            THREE.MathUtils.smootherstep(holdProgress, 0, 1) * fullTurnAngle;
        }

        break;
      }

      group.rotation.x = 0;
      group.rotation.y = THREE.MathUtils.lerp(freeSpinY, 0, firstDetailProgress);
      group.rotation.z = THREE.MathUtils.lerp(
        fallingRotationZ,
        0,
        firstDetailProgress,
      );
      const scaleSettleProgress = THREE.MathUtils.smootherstep(
        firstCardProgress,
        0,
        1,
      );
      const baseGroupScale = THREE.MathUtils.lerp(1, 0.56, scaleSettleProgress);
      group.scale.setScalar(baseGroupScale);

      if (modelRoot) {
        modelRoot.rotation.x = THREE.MathUtils.lerp(-0.18, 0, firstDetailProgress);
        modelRoot.rotation.y = THREE.MathUtils.lerp(-0.55, 0, firstDetailProgress) + spinAngle;
        modelRoot.rotation.z = THREE.MathUtils.lerp(0.04, 0, firstDetailProgress);
      }

      if (titleElement instanceof HTMLElement) {
        titleElement.style.transform = `translate3d(0, ${THREE.MathUtils.lerp(0, -420, textProgress)}px, 0)`;
        titleElement.style.opacity = `${THREE.MathUtils.lerp(1, 0, textProgress)}`;
      }

      if (pointsElement instanceof HTMLElement) {
        pointsElement.style.transform = `translate3d(0, ${THREE.MathUtils.lerp(0, -260, textProgress)}px, 0)`;
        pointsElement.style.opacity = `${THREE.MathUtils.lerp(1, 0, textProgress)}`;
      }

      reasonScreens.forEach((screenElement, index) => {
        let screenY = 100;

        if (index < activeScreenIndex) {
          screenY = -100;
        } else if (index === activeScreenIndex) {
          screenY = THREE.MathUtils.lerp(0, -100, activeTransitionProgress);
        } else if (index === activeScreenIndex + 1) {
          screenY = THREE.MathUtils.lerp(100, 0, activeTransitionProgress);
        }

        screenElement.style.transform = `translate3d(0, ${screenY}%, 0)`;
      });

      const firstReasonCardElement = reasonCards[0];
      const firstReasonDetailElement = reasonDetails[0];

      if (firstReasonCardElement instanceof HTMLElement) {
        const riseProgress = Math.min(firstCardProgress / 0.52, 1);
        const shiftProgress = THREE.MathUtils.clamp(
          (firstCardProgress - 0.52) / 0.48,
          0,
          1,
        );
        const cardY = THREE.MathUtils.lerp(120, -530, riseProgress);
        const cardX = THREE.MathUtils.lerp(0, 455, shiftProgress);
        const cardScale = THREE.MathUtils.lerp(0.94, 0.9, shiftProgress);
        const cardOpacity = THREE.MathUtils.lerp(
          0,
          1,
          Math.min(firstCardProgress / 0.14, 1),
        );

        firstReasonCardElement.style.transform = `translate(${cardX}%, ${cardY}px) scale(${cardScale})`;
        firstReasonCardElement.style.opacity = `${THREE.MathUtils.clamp(
          cardOpacity,
          0,
          1,
        )}`;
      }

      if (cupCardElement instanceof HTMLElement) {
        const frameEntry = THREE.MathUtils.clamp(
          (firstDetailProgress - 0.08) / 0.34,
          0,
          1,
        );
        const frameX = THREE.MathUtils.lerp(-16, 0, frameEntry);
        const frameY = THREE.MathUtils.lerp(40, -18, firstDetailProgress);
        const frameScale = THREE.MathUtils.lerp(0.92, 1, frameEntry);
        const frameOpacity = THREE.MathUtils.lerp(0, 1, frameEntry);

        cupCardElement.style.transform = `translate3d(calc(-50% + ${frameX}px), calc(-50% + ${frameY}px), 0) scale(${frameScale})`;
        cupCardElement.style.opacity = `${THREE.MathUtils.clamp(
          frameOpacity,
          0,
          1,
        )}`;

        const target = getCardTarget(cupCardElement);
        group.position.x = THREE.MathUtils.lerp(0, target.x, firstDetailProgress);
        group.position.y = THREE.MathUtils.lerp(0, target.y, firstDetailProgress);
      } else {
        group.position.x = 0;
        group.position.y = 0;
      }

      if (firstReasonDetailElement instanceof HTMLElement) {
        firstReasonDetailElement.style.transform = `translate3d(0, ${THREE.MathUtils.lerp(
          180,
          -24,
          firstDetailProgress,
        )}px, 0)`;
        firstReasonDetailElement.style.opacity = `${THREE.MathUtils.lerp(
          0,
          1,
          Math.min(firstDetailProgress / 0.32, 1),
        )}`;
      }

      reasonCards.forEach((cardElement, index) => {
        if (!(cardElement instanceof HTMLElement) || index === 0) {
          return;
        }

        cardElement.style.transform = "translate(455%, -530px) scale(0.9)";
        cardElement.style.opacity = "1";
      });

      reasonDetails.forEach((detailElement, index) => {
        if (!(detailElement instanceof HTMLElement) || index === 0) {
          return;
        }

        detailElement.style.transform = "translate3d(0, -24px, 0)";
        detailElement.style.opacity = "1";
      });

      if (finalCtaElement instanceof HTMLElement) {
        finalCtaElement.style.transform = `translate3d(0, ${THREE.MathUtils.lerp(
          100,
          0,
          finalCtaVisualProgress,
        )}%, 0)`;
      }

      renderer.render(scene, camera);
    };

    tick();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(frameId);
      scrollTrigger?.kill();
      resizeObserver.disconnect();
      renderer.dispose();
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();

          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={styles.sceneMount} aria-hidden="true" />;
}
