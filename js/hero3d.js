// Noirdrop hero — a metallic knot over a receding neon grid, drifting embers,
// twin wireframe shells and red/cyan lights that orbit the centerpiece.
// Pointer parallax on desktop, device tilt on mobile, scroll-linked pull-back.
// Falls back silently to the CSS gradient if WebGL or the CDN is unavailable.
(async () => {
  const canvas = document.getElementById("hero3d");
  if (!canvas) return;
  let THREE;
  try {
    THREE = await import("three");
  } catch {
    canvas.remove();
    return;
  }

  const small = matchMedia("(max-width: 700px)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.75 : 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0e, 0.055);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  // ---- centerpiece: torus knot + twin counter-rotating wireframe shells ----
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.35, 0.42, 240, 40),
    new THREE.MeshStandardMaterial({
      color: 0x15151c,
      metalness: 0.95,
      roughness: 0.22,
      emissive: 0x000000,
    })
  );
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.5, 1),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.07 })
  );
  const shell2 = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.15, 1),
    new THREE.MeshBasicMaterial({ color: 0xff2d2d, wireframe: true, transparent: true, opacity: 0.045 })
  );
  const group = new THREE.Group();
  group.add(knot, shell, shell2);
  scene.add(group);

  // ---- neon grid floor, fading into fog ----
  const gridFloor = new THREE.GridHelper(60, 60, 0x00e5ff, 0x161622);
  gridFloor.position.y = -3.2;
  gridFloor.material.transparent = true;
  gridFloor.material.opacity = 0.3;
  scene.add(gridFloor);

  // ---- floating shards ----
  const shardCount = small ? 14 : 26;
  const shardGeo = new THREE.TetrahedronGeometry(0.16);
  const shardMat = new THREE.MeshStandardMaterial({ color: 0x22222e, metalness: 0.8, roughness: 0.3 });
  const shards = [];
  for (let i = 0; i < shardCount; i++) {
    const s = new THREE.Mesh(shardGeo, shardMat);
    s.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4);
    s.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    s.userData = { vy: 0.0015 + Math.random() * 0.002, vr: (Math.random() - 0.5) * 0.01 };
    shards.push(s);
    scene.add(s);
  }

  // ---- ember particle field ----
  const emberCount = small ? 90 : 180;
  const emberPos = new Float32Array(emberCount * 3);
  const emberSpeed = new Float32Array(emberCount);
  for (let i = 0; i < emberCount; i++) {
    emberPos[i * 3] = (Math.random() - 0.5) * 16;
    emberPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    emberPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    emberSpeed[i] = 0.0012 + Math.random() * 0.0035;
  }
  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
  const embers = new THREE.Points(
    emberGeo,
    new THREE.PointsMaterial({
      color: 0xff6a55,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  scene.add(embers);

  // ---- neon lighting: red and cyan orbit the knot, cool rim from behind ----
  const red = new THREE.PointLight(0xff2d2d, 220, 30);
  const cyan = new THREE.PointLight(0x00e5ff, 180, 30);
  const rim = new THREE.DirectionalLight(0x8899ff, 1.1);
  rim.position.set(0, 3, -4);
  scene.add(red, cyan, rim, new THREE.AmbientLight(0x404050, 1.1));

  // ---- parallax: pointer on fine-pointer devices, tilt elsewhere ----
  let tx = 0, ty = 0;
  if (finePointer) {
    addEventListener("pointermove", (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 0.5;
      ty = (e.clientY / innerHeight - 0.5) * 0.35;
    });
  }
  addEventListener("deviceorientation", (e) => {
    if (e.gamma == null || e.beta == null) return;
    tx = Math.max(-0.4, Math.min(0.4, e.gamma / 60));
    ty = Math.max(-0.3, Math.min(0.3, (e.beta - 45) / 90));
  });

  // ---- tap the knot: quick red emissive pulse ----
  let pulse = 0;
  canvas.addEventListener("pointerdown", () => { pulse = 1; });

  // ---- scroll-linked pull-back through the hero ----
  let scrollT = 0;
  const onScroll = () => {
    scrollT = Math.min(1, Math.max(0, scrollY / (innerHeight || 1)));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  let baseX = 0, baseY = 0;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the object to the right on wide screens, centered behind content on mobile
    baseX = w > 900 ? 2.4 : 0;
    baseY = w > 900 ? 0 : 1.1;
    group.position.x = baseX;
    group.position.y = baseY;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  // ---- reduced motion: one composed still frame, no loop ----
  function compose(t) {
    red.position.set(-5, 1.5, 3);
    cyan.position.set(5, -1, 3);
    renderer.render(scene, camera);
  }
  if (reduced) {
    compose();
    addEventListener("resize", compose);
    return;
  }

  // ---- render only while the hero is on screen and the tab is visible ----
  let inView = true, pageVisible = !document.hidden;
  new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; }).observe(canvas);
  document.addEventListener("visibilitychange", () => { pageVisible = !document.hidden; });

  function frame(t) {
    requestAnimationFrame(frame);
    if (!inView || !pageVisible) return;

    group.rotation.y = t * 0.00016 + scrollT * 0.9;
    group.rotation.x = Math.sin(t * 0.0001) * 0.15 + scrollT * 0.3;
    group.position.y = baseY + scrollT * 0.7;
    shell.rotation.y = -t * 0.00008;
    shell2.rotation.y = t * 0.00005;
    shell2.rotation.z = t * 0.00003;

    // orbiting neon lights — reflections sweep across the metal
    const a = t * 0.00035;
    red.position.set(Math.cos(a) * 6, 1.5 + Math.sin(t * 0.00021) * 1.6, Math.sin(a) * 6);
    cyan.position.set(Math.cos(a + Math.PI) * 6, -1 + Math.cos(t * 0.00017) * 1.6, Math.sin(a + Math.PI) * 6);

    for (const s of shards) {
      s.position.y += s.userData.vy;
      s.rotation.x += s.userData.vr;
      if (s.position.y > 3.4) s.position.y = -3.4;
    }

    const p = emberGeo.attributes.position;
    for (let i = 0; i < emberCount; i++) {
      let y = p.getY(i) + emberSpeed[i];
      if (y > 4.6) y = -4.6;
      p.setY(i, y);
    }
    p.needsUpdate = true;

    // grid slides slowly toward the viewer (one cell period = seamless loop)
    gridFloor.position.z = (t * 0.0006) % 1;

    // tap pulse decay
    if (pulse > 0.001) pulse *= 0.92;
    knot.material.emissive.setRGB(pulse * 0.9, pulse * 0.12, pulse * 0.14);
    knot.scale.setScalar(1 + pulse * 0.06);

    camera.position.x += (tx * 1.4 - camera.position.x) * 0.04;
    camera.position.y += (-ty * 1.0 - camera.position.y) * 0.04;
    camera.position.z = 7.5 + scrollT * 2.2;
    camera.lookAt(group.position.x * 0.8, group.position.y * 0.6, 0);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
})();
