/* INTRO ANIMATION */
const introLoader = document.getElementById('introLoader');
const introSkip = document.getElementById('introSkip');
let cleanupIntroScene = null;
let introClosed = false;

function closeIntro() {
  if (!introLoader || introClosed) return;

  introClosed = true;
  introLoader.classList.add('is-hidden');
  document.body.classList.remove('intro-active');
  window.scrollTo(0, 0);

  window.setTimeout(() => {
    if (cleanupIntroScene) cleanupIntroScene();
    introLoader.remove();
  }, 750);
}

if (introLoader) {
  cleanupIntroScene = initIntroThreeScene();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let touchStartY = 0;

  function skipIntroByScroll(event) {
    if (event.cancelable) event.preventDefault();
    closeIntro();
  }

  introLoader.addEventListener('wheel', skipIntroByScroll, { passive: false });
  introLoader.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0]?.clientY || 0;
  }, { passive: true });
  introLoader.addEventListener('touchmove', (event) => {
    const touchY = event.touches[0]?.clientY || touchStartY;
    if (touchStartY - touchY > 18) skipIntroByScroll(event);
  }, { passive: false });

  window.setTimeout(closeIntro, 6200);
  introSkip?.addEventListener('click', closeIntro);
}

/* INTRO THREE.JS SCENE */
function initIntroThreeScene() {
  const canvas = document.getElementById('introThreeCanvas');
  if (!canvas || typeof THREE === 'undefined') return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, y: 0 };
  const portalGroup = new THREE.Group();
  const ringGroup = new THREE.Group();
  const codeGroup = new THREE.Group();
  const starGroup = new THREE.Group();
  const disposables = [];
  const textures = [];
  const labels = [];
  let animationFrame = null;
  let active = true;

  renderer.setClearColor(0x000000, 0);
  camera.position.set(0, 0, 8.4);
  scene.add(portalGroup, starGroup);
  portalGroup.add(ringGroup, codeGroup);

  const coreGeometry = new THREE.IcosahedronGeometry(0.82, 3);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x0a8f45,
    emissiveIntensity: 0.8,
    roughness: 0.16,
    metalness: 0.72,
    transparent: true,
    opacity: 0.94
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  portalGroup.add(core);
  disposables.push(coreGeometry, coreMaterial);

  const coreWireGeometry = new THREE.IcosahedronGeometry(1.08, 2);
  const coreWireMaterial = new THREE.MeshBasicMaterial({
    color: 0xf4fff8,
    wireframe: true,
    transparent: true,
    opacity: 0.24
  });
  const coreWire = new THREE.Mesh(coreWireGeometry, coreWireMaterial);
  portalGroup.add(coreWire);
  disposables.push(coreWireGeometry, coreWireMaterial);

  const glowGeometry = new THREE.SphereGeometry(1.36, 48, 24);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  portalGroup.add(glow);
  disposables.push(glowGeometry, glowMaterial);

  const haloGeometry = new THREE.SphereGeometry(2.48, 64, 24);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  portalGroup.add(halo);
  disposables.push(haloGeometry, haloMaterial);

  const rings = [
    { radius: 1.5, tube: 0.014, color: 0x22c55e, opacity: 0.72, rotation: [Math.PI * 0.5, 0, 0], speed: 0.72 },
    { radius: 1.86, tube: 0.01, color: 0xf4fff8, opacity: 0.38, rotation: [Math.PI * 0.34, Math.PI * 0.12, 0], speed: -0.5 },
    { radius: 2.22, tube: 0.012, color: 0x22c55e, opacity: 0.48, rotation: [Math.PI * 0.56, Math.PI * 0.28, 0], speed: 0.34 },
    { radius: 2.7, tube: 0.008, color: 0xf4fff8, opacity: 0.22, rotation: [Math.PI * 0.44, Math.PI * -0.18, 0], speed: -0.24 }
  ].map((config) => {
    const geometry = new THREE.TorusGeometry(config.radius, config.tube, 12, 220);
    const material = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: config.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.set(...config.rotation);
    ringGroup.add(mesh);
    disposables.push(geometry, material);
    return { mesh, speed: config.speed, baseOpacity: config.opacity };
  });

  const scanGeometry = new THREE.TorusGeometry(3.05, 0.006, 8, 260);
  const scanMaterial = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const scanRing = new THREE.Mesh(scanGeometry, scanMaterial);
  scanRing.rotation.x = Math.PI * 0.5;
  ringGroup.add(scanRing);
  disposables.push(scanGeometry, scanMaterial);

  function createCodeLabel(text) {
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 96;
    const context = labelCanvas.getContext('2d');

    context.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    context.fillStyle = 'rgba(3, 12, 10, 0.72)';
    context.strokeStyle = 'rgba(34, 197, 94, 0.95)';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(20, 10);
    context.lineTo(236, 10);
    context.quadraticCurveTo(246, 10, 246, 20);
    context.lineTo(246, 76);
    context.quadraticCurveTo(246, 86, 236, 86);
    context.lineTo(20, 86);
    context.quadraticCurveTo(10, 86, 10, 76);
    context.lineTo(10, 20);
    context.quadraticCurveTo(10, 10, 20, 10);
    context.closePath();
    context.fill();
    context.stroke();

    context.fillStyle = 'rgba(244, 255, 248, 0.96)';
    context.font = '700 32px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 50);

    const texture = new THREE.CanvasTexture(labelCanvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.86,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.94, 0.35, 1);
    codeGroup.add(sprite);
    textures.push(texture);
    disposables.push(material);
    return sprite;
  }

  ['{ }', 'JS', '</>', 'API', 'CSS', 'UI'].forEach((text, index) => {
    const sprite = createCodeLabel(text);
    labels.push({
      sprite,
      angle: (index / 6) * Math.PI * 2,
      radius: 3 + (index % 2) * 0.26,
      lift: -0.28 + (index % 3) * 0.28,
      speed: 0.22 + (index % 3) * 0.035
    });
  });

  const dataGeometry = new THREE.BufferGeometry();
  const dataCount = 360;
  const dataPositions = new Float32Array(dataCount * 3);
  const dataSpeeds = new Float32Array(dataCount);

  for (let i = 0; i < dataCount; i += 1) {
    const index = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.8 + Math.random() * 5.8;
    dataPositions[index] = Math.cos(angle) * radius;
    dataPositions[index + 1] = (Math.random() - 0.5) * 4.6;
    dataPositions[index + 2] = -8 + Math.random() * 10;
    dataSpeeds[i] = 0.018 + Math.random() * 0.05;
  }

  dataGeometry.setAttribute('position', new THREE.BufferAttribute(dataPositions, 3));
  const dataMaterial = new THREE.PointsMaterial({
    color: 0x22c55e,
    size: 0.042,
    transparent: true,
    opacity: 0.68,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const dataStream = new THREE.Points(dataGeometry, dataMaterial);
  starGroup.add(dataStream);
  disposables.push(dataGeometry, dataMaterial);

  const shardGeometry = new THREE.BoxGeometry(0.07, 0.07, 0.07);
  const shardMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4fff8,
    emissive: 0x22c55e,
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.5,
    transparent: true,
    opacity: 0.78
  });
  const shards = [];

  for (let i = 0; i < 28; i += 1) {
    const shard = new THREE.Mesh(shardGeometry, shardMaterial);
    const angle = (i / 28) * Math.PI * 2;
    const radius = 2.08 + (i % 4) * 0.18;
    shard.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 0.52, Math.sin(angle) * radius);
    shard.rotation.set(angle, angle * 0.7, angle * 1.2);
    ringGroup.add(shard);
    shards.push({
      mesh: shard,
      angle,
      radius,
      speed: 0.32 + (i % 6) * 0.025,
      yPhase: i * 0.7
    });
  }
  disposables.push(shardGeometry, shardMaterial);

  scene.add(new THREE.AmbientLight(0xffffff, 1.1));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(2.5, 2.8, 4.5);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x22c55e, 3.8, 11);
  rimLight.position.set(-2.8, -1.4, 2.5);
  scene.add(rimLight);

  const backLight = new THREE.PointLight(0xf4fff8, 1.4, 9);
  backLight.position.set(2.8, 1.8, -2.8);
  scene.add(backLight);

  function resizeScene() {
    const width = introLoader?.clientWidth || window.innerWidth;
    const height = introLoader?.clientHeight || window.innerHeight;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();

    portalGroup.position.set(0, 0.05, 0);
    portalGroup.scale.setScalar(width < 600 ? 0.78 : 1.08);
  }

  function syncThemeColors() {
    const isDark = document.body.classList.contains('dark-mode');
    coreWireMaterial.color.set(isDark ? 0xf4fff8 : 0x0f0f0f);
    coreWireMaterial.opacity = isDark ? 0.26 : 0.18;
    dataMaterial.opacity = isDark ? 0.72 : 0.5;
    haloMaterial.opacity = isDark ? 0.1 : 0.07;
    scanMaterial.opacity = isDark ? 0.22 : 0.15;
    shardMaterial.color.set(isDark ? 0xf4fff8 : 0xdfffe9);
  }

  function renderScene(time = 0) {
    if (!active) return;

    const t = time * 0.001;
    const driftX = pointer.x * 0.28;
    const driftY = pointer.y * 0.2;
    const motion = reduceMotion ? 0.28 : 1;
    const pulse = 1 + Math.sin(t * 3.2) * 0.065;

    portalGroup.rotation.x = driftY * 0.65 + Math.sin(t * 0.45) * 0.03;
    portalGroup.rotation.y = driftX * 0.78 + Math.sin(t * 0.35) * 0.04;
    core.scale.setScalar(pulse);
    glow.scale.setScalar(1.05 + Math.sin(t * 2.8) * 0.09);
    halo.rotation.y = -t * 0.12 * motion;
    halo.rotation.x = t * 0.06 * motion;
    core.rotation.x = t * 0.62 * motion;
    core.rotation.y = t * 0.44 * motion;
    coreWire.rotation.x = -t * 0.34 * motion;
    coreWire.rotation.z = t * 0.52 * motion;
    scanRing.rotation.z = -t * 1.15 * motion;
    scanRing.scale.setScalar(1 + Math.sin(t * 2.6) * 0.045);

    rings.forEach((ring, index) => {
      ring.mesh.rotation.z += ring.speed * 0.008 * motion;
      ring.mesh.material.opacity = ring.baseOpacity + Math.sin(t * 2 + index) * 0.055;
    });

    labels.forEach((label, index) => {
      const angle = label.angle + t * label.speed * motion;
      const depth = Math.sin(angle);
      label.sprite.position.x = Math.cos(angle) * label.radius;
      label.sprite.position.y = label.lift + Math.sin(angle * 1.6 + index) * 0.32;
      label.sprite.position.z = depth * 1.15;
      label.sprite.material.opacity = 0.38 + (depth + 1) * 0.24;
      label.sprite.scale.setScalar(0.82 + (depth + 1) * 0.07);
    });

    shards.forEach((shard) => {
      const angle = shard.angle + t * shard.speed * motion;
      shard.mesh.position.x = Math.cos(angle) * shard.radius;
      shard.mesh.position.z = Math.sin(angle) * shard.radius;
      shard.mesh.position.y = Math.sin(angle * 1.55 + shard.yPhase) * 0.62;
      shard.mesh.rotation.x += 0.012 * motion;
      shard.mesh.rotation.y += 0.016 * motion;
    });

    const positions = dataGeometry.attributes.position.array;
    for (let i = 0; i < dataCount; i += 1) {
      const index = i * 3;
      positions[index + 2] += dataSpeeds[i] * motion;
      positions[index] += Math.sin(t + i) * 0.0015 * motion;
      if (positions[index + 2] > 3.2) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.8 + Math.random() * 5.8;
        positions[index] = Math.cos(angle) * radius;
        positions[index + 1] = (Math.random() - 0.5) * 4.6;
        positions[index + 2] = -8;
      }
    }
    dataGeometry.attributes.position.needsUpdate = true;
    dataStream.rotation.y = t * 0.045 * motion;

    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(renderScene);
  }

  window.addEventListener('resize', resizeScene);
  const handlePointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', handlePointerMove);

  const themeObserver = new MutationObserver(syncThemeColors);
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  resizeScene();
  syncThemeColors();
  renderScene();

  return function cleanup() {
    active = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', resizeScene);
    window.removeEventListener('pointermove', handlePointerMove);
    themeObserver.disconnect();
    textures.forEach((texture) => texture.dispose());
    disposables.forEach((item) => item.dispose());
    renderer.dispose();
  };
}

/*DARK MODE TOGGLE*/
const darkToggle = document.getElementById('darkToggle');
const body = document.body;

// Load saved preference
if (localStorage.getItem('theme') === 'dark') {
  body.classList.replace('light-mode', 'dark-mode');
}

darkToggle.addEventListener('click', () => {
  const isDark = body.classList.contains('dark-mode');
  body.classList.toggle('dark-mode', !isDark);
  body.classList.toggle('light-mode',  isDark);
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

/* ═══════════════════════════════════════════
   MOBILE MENU TOGGLE
═══════════════════════════════════════════ */
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

menuToggle.addEventListener('click', () => {
  const isOpen = !mobileMenu.hidden;
  mobileMenu.hidden = isOpen;
  menuToggle.classList.toggle('open', !isOpen);
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.hidden = true;
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ═══════════════════════════════════════════
   SKILL BARS — animate when in viewport
═══════════════════════════════════════════ */
const skillBars = document.querySelectorAll('.skill-bar');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

skillBars.forEach(bar => skillObserver.observe(bar));

/* ═══════════════════════════════════════════
   LOAD PROJECTS VIA AJAX
═══════════════════════════════════════════ */
function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const fallbackProjects = [
    {
      tag: 'E-commerce',
      title: 'E-commerce Website',
      description: 'A responsive e-commerce web app with product browsing and a clean storefront experience.',
      tech_stack: 'React · JavaScript · CSS · Vercel',
      live_url: 'https://ecommerce-woad-one-13.vercel.app/'
    }
  ];

  function renderProjects(projects) {
    grid.innerHTML = '';
    projects.forEach(project => {
      const stack = project.tech_stack
        .split('·')
        .map(item => `<span class="stack-pill">${item.trim()}</span>`)
        .join('');

      grid.innerHTML += `
        <article class="project-card">
          <span class="project-tag">${project.tag}</span>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.description}</p>
          <div class="project-stack">${stack}</div>
          <div class="project-links">
            <a href="${project.live_url}" class="project-link" target="_blank" rel="noopener">
              Live Demo &rarr;
            </a>
          </div>
        </article>`;
    });
  }

  renderProjects(fallbackProjects);
  return;

  grid.innerHTML = '<p class="projects-loading">Loading projects...</p>';

  fetch('api/get_projects.php')
    .then(res => {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(projects => {
      if (!projects.length) {
        grid.innerHTML = '<p class="projects-loading">No projects yet.</p>';
        return;
      }
      grid.innerHTML = '';
      projects.forEach(p => {
        const stack = p.tech_stack
          .split('·')
          .map(t => `<span class="stack-pill">${t.trim()}</span>`)
          .join('');

        const liveLink = p.live_url
          ? `<a href="${p.live_url}" class="project-link" target="_blank" rel="noopener">
               Live Demo ↗
             </a>`
          : '';

        grid.innerHTML += `
          <article class="project-card">
            <span class="project-tag">${p.tag || 'Project'}</span>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.description}</p>
            <div class="project-stack">${stack}</div>
            <div class="project-links">
              <a href="${p.github_url}" class="project-link" target="_blank" rel="noopener">
                GitHub ↗
              </a>
              ${liveLink}
            </div>
          </article>`;
      });
    })
    .catch(() => {
      grid.innerHTML = '<p class="projects-loading">Could not load projects.</p>';
    });
}

function loadProjectsFromDatabase() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const fallbackProjects = [
    {
      tag: 'E-commerce',
      title: 'E-commerce Website',
      description: 'A responsive e-commerce web app with product browsing and a clean storefront experience.',
      tech_stack: 'React · JavaScript · CSS · Vercel',
      github_url: '',
      live_url: 'https://ecommerce-woad-one-13.vercel.app/'
    }
  ];

  function renderProjects(projects) {
    if (!projects.length) {
      grid.innerHTML = '<p class="projects-loading">No projects yet.</p>';
      return;
    }

    grid.innerHTML = projects.map(project => {
      const stack = (project.tech_stack || '')
        .split('·')
        .map(item => `<span class="stack-pill">${item.trim()}</span>`)
        .join('');

      const githubLink = project.github_url
        ? `<a href="${project.github_url}" class="project-link" target="_blank" rel="noopener">GitHub &rarr;</a>`
        : '';

      const liveLink = project.live_url
        ? `<a href="${project.live_url}" class="project-link" target="_blank" rel="noopener">Live Demo &rarr;</a>`
        : '';

      return `
        <article class="project-card">
          <span class="project-tag">${project.tag || 'Project'}</span>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.description}</p>
          <div class="project-stack">${stack}</div>
          <div class="project-links">
            ${githubLink}
            ${liveLink}
          </div>
        </article>`;
    }).join('');
  }

  grid.innerHTML = '<p class="projects-loading">Loading projects...</p>';

  fetch('api/get_projects.php')
    .then(response => {
      if (!response.ok) throw new Error('Could not load projects.');
      return response.json();
    })
    .then(projects => renderProjects(Array.isArray(projects) ? projects : fallbackProjects))
    .catch(() => renderProjects(fallbackProjects));
}

loadProjectsFromDatabase();

/* ═══════════════════════════════════════════
   CONTACT FORM — validation + AJAX submit
═══════════════════════════════════════════ */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.form-group input, .form-group textarea')
      .forEach(el => el.classList.remove('error'));

    const name    = document.getElementById('name');
    const email   = document.getElementById('email');
    const message = document.getElementById('message');
    const status  = document.getElementById('formStatus');

    let valid = true;

    // Name validation
    if (name.value.trim().length < 2) {
      showError(name, 'nameError', 'Please enter your full name.');
      valid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      showError(email, 'emailError', 'Please enter a valid email address.');
      valid = false;
    }

    // Message validation
    if (message.value.trim().length < 10) {
      showError(message, 'messageError', 'Message must be at least 10 characters.');
      valid = false;
    }

    if (!valid) return;

    // Submit via AJAX
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const formData = new FormData(contactForm);

    fetch('api/save_contact.php', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          status.className = 'form-status success';
          status.textContent = 'Message sent! I\'ll get back to you soon.';
          contactForm.reset();
        } else {
          status.className = 'form-status error';
          status.textContent = data.error || 'Something went wrong. Try again.';
        }
      })
      .catch(() => {
        status.className = 'form-status error';
        status.textContent = 'Network error. Please try again later.';
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = 'Send Message';
      });
  });
}

function showError(input, errorId, message) {
  input.classList.add('error');
  const err = document.getElementById(errorId);
  if (err) {
    err.textContent = message;
    err.classList.add('visible');
  }
}

/* ═══════════════════════════════════════════
   SMOOTH SCROLL ACTIVE NAV HIGHLIGHT
═══════════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.main-nav a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--accent)';
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -55%' });

sections.forEach(s => navObserver.observe(s));
