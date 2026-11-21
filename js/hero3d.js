// Noirdrop hero — a slowly turning metallic knot lit red/cyan, with mouse parallax.
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

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  // Centerpiece: torus knot + wireframe shell
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.35, 0.42, 240, 40),
    new THREE.MeshStandardMaterial({ color: 0x15151c, metalness: 0.95, roughness: 0.22 })
  );
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.5, 1),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.07 })
  );
  const group = new THREE.Group();
  group.add(knot, shell);
  scene.add(group);

  // Floating shards
  const shardGeo = new THREE.TetrahedronGeometry(0.16);
  const shardMat = new THREE.MeshStandardMaterial({ color: 0x22222e, metalness: 0.8, roughness: 0.3 });
  const shards = [];
  for (let i = 0; i < 26; i++) {
    const s = new THREE.Mesh(shardGeo, shardMat);
    s.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4);
    s.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    s.userData = { vy: 0.0015 + Math.random() * 0.002, vr: (Math.random() - 0.5) * 0.01 };
    shards.push(s);
    scene.add(s);
  }

  // Neon rim lighting
  const red = new THREE.PointLight(0xff2d2d, 220, 30);
  red.position.set(-5, 1.5, 3);
  const cyan = new THREE.PointLight(0x00e5ff, 180, 30);
  cyan.position.set(5, -1, 3);
  scene.add(red, cyan, new THREE.AmbientLight(0x404050, 1.2));

  // Mouse parallax
  let tx = 0, ty = 0;
  addEventListener("pointermove", (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 0.5;
    ty = (e.clientY / innerHeight - 0.5) * 0.35;
  });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the object to the right on wide screens, centered behind content on mobile
    group.position.x = w > 900 ? 2.4 : 0;
    group.position.y = w > 900 ? 0 : 1.1;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  function frame(t) {
    if (!reduced) {
      group.rotation.y = t * 0.00016;
      group.rotation.x = Math.sin(t * 0.0001) * 0.15;
      shell.rotation.y = -t * 0.00008;
      for (const s of shards) {
        s.position.y += s.userData.vy;
        s.rotation.x += s.userData.vr;
        if (s.position.y > 3.4) s.position.y = -3.4;
      }
    }
    camera.position.x += (tx * 1.4 - camera.position.x) * 0.04;
    camera.position.y += (-ty * 1.0 - camera.position.y) * 0.04;
    camera.lookAt(group.position.x * 0.8, group.position.y * 0.6, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
