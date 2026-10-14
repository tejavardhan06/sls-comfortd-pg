/* ---------------- THEME PALETTES ---------------- */
const PALETTES = [
  {
    id: 'obsidian-amber',
    name: 'Obsidian Gold (Current)',
    desc: 'Midnight dark ink with warm golden amber accents',
    colors: {
      '--color-ink': '#0e0f15',
      '--color-darkcard': '#161822',
      '--color-porcelain': '#FAF6EF',
      '--color-clay': '#E7DFD1',
      '--color-claydark': '#D8CDB8',
      '--color-indigo': '#423F8F',
      '--color-amber': '#E3A23C',
      '--color-amber-light': '#EFB65E',
      '--color-emerald': '#1E9A6C',
    }
  },
  {
    id: 'navy-electric-cyan',
    name: 'Nordic Deep Cyan',
    desc: 'Deep oceanic blue with vibrant cyan accents',
    colors: {
      '--color-ink': '#0b1329',
      '--color-darkcard': '#111d3e',
      '--color-porcelain': '#F0F4F8',
      '--color-clay': '#D3E0EA',
      '--color-claydark': '#B8CCD8',
      '--color-indigo': '#2A52BE',
      '--color-amber': '#00D2D3',
      '--color-amber-light': '#54E4E5',
      '--color-emerald': '#10AC84',
    }
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald & Sage',
    desc: 'Deep forest black with rich mint & sage highlights',
    colors: {
      '--color-ink': '#091512',
      '--color-darkcard': '#112420',
      '--color-porcelain': '#F4F7F5',
      '--color-clay': '#D8E2DC',
      '--color-claydark': '#C0D1C7',
      '--color-indigo': '#1B493A',
      '--color-amber': '#2EC4B6',
      '--color-amber-light': '#68DACF',
      '--color-emerald': '#20BF55',
    }
  },
  {
    id: 'crimson-sunset',
    name: 'Sunset Terracotta',
    desc: 'Dark charcoal with warm terracotta & coral punch',
    colors: {
      '--color-ink': '#120f12',
      '--color-darkcard': '#1d171d',
      '--color-porcelain': '#FAF3F0',
      '--color-clay': '#EBDAD2',
      '--color-claydark': '#D8BEB2',
      '--color-indigo': '#6B2D5C',
      '--color-amber': '#FF6B6B',
      '--color-amber-light': '#FFA8A8',
      '--color-emerald': '#06D6A0',
    }
  },
  {
    id: 'purple-neon',
    name: 'Cyber Violet',
    desc: 'Deep synthwave violet with neon purple accents',
    colors: {
      '--color-ink': '#100a1c',
      '--color-darkcard': '#1b122e',
      '--color-porcelain': '#F8F4FF',
      '--color-clay': '#E4D8F7',
      '--color-claydark': '#CCAEE8',
      '--color-indigo': '#7B2CBF',
      '--color-amber': '#C77DFF',
      '--color-amber-light': '#E0AAFF',
      '--color-emerald': '#00F5D4',
    }
  },
  {
    id: 'warm-minimal-cream',
    name: 'Cream & Coffee',
    desc: 'Warm espresso background with creamy latte accents',
    colors: {
      '--color-ink': '#161311',
      '--color-darkcard': '#241F1C',
      '--color-porcelain': '#FDFBF7',
      '--color-clay': '#E8E1D7',
      '--color-claydark': '#D3C8B8',
      '--color-indigo': '#5C4033',
      '--color-amber': '#D4A373',
      '--color-amber-light': '#E6C5A5',
      '--color-emerald': '#8CB369',
    }
  }
];

function applyTheme(paletteId) {
  const selected = PALETTES.find(p => p.id === paletteId) || PALETTES[0];
  const root = document.documentElement;
  Object.entries(selected.colors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  localStorage.setItem('sls_theme_preview', paletteId);
}

const savedTheme = localStorage.getItem('sls_theme_preview') || 'obsidian-amber';
applyTheme(savedTheme);

/* ---------------- HOVER-TO-PLAY VIDEO LOGIC (SECTIONS & ROOMS) ---------------- */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover:hover) and (pointer:fine)');
const connection = navigator.connection;
const lowBandwidth = () => connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
const mediaAsset = name => MEDIA_ASSETS[name];

function loadVideoSource(video) {
  if (video.dataset.loaded === 'true') return;
  video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
  video.dataset.loaded = 'true';
  video.load();
}

function prepareVideo(video) {
  if (video.dataset.prepared) return;
  video.dataset.prepared = 'true';
  const card = video.closest('.hover-video-card, .room-card-container');
  const poster = video.id === 'heroVideo'
    ? document.getElementById('heroPoster')
    : video.previousElementSibling?.matches('.video-poster') ? video.previousElementSibling : null;
  const showPoster = () => {
    video.classList.remove('has-frame');
    if (poster) poster.hidden = false;
    card?.classList.remove('is-playing');
  };
  video.addEventListener('playing', () => {
    video.classList.add('has-frame');
    if (poster) poster.hidden = true;
    card?.classList.add('is-playing');
    card?.classList.remove('video-unavailable');
  });
  // Keep the last decoded frame during buffering rather than flash the thumbnail.
  video.addEventListener('emptied', showPoster);
  video.addEventListener('pause', showPoster);
  video.addEventListener('error', () => {
    video.pause();
    showPoster();
    if (card?.classList.contains('hover-video-card')) {
      card.classList.add('video-unavailable');
      card.setAttribute('aria-label', 'Video unavailable. Preview image shown.');
    }
  });
}

function playVideo(video) {
  document.querySelectorAll('video').forEach(other => {
    if (other !== video) other.pause();
  });
  loadVideoSource(video);
  video.play().catch(() => {
    video.classList.remove('has-frame');
    video.closest('.hover-video-card, .room-card-container')?.classList.remove('is-playing');
  });
}

const videoVisibilityObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      entries.forEach(({ target: video, isIntersecting }) => {
        video.dataset.inViewport = String(isIntersecting);
        if (!isIntersecting) video.pause();
        else if (video.id === 'heroVideo' && !document.hidden && !prefersReducedMotion.matches && !lowBandwidth() && finePointerQuery.matches && ![...document.querySelectorAll('video')].some(other => other !== video && !other.paused)) playVideo(video);
      });
    }, { threshold: 0.15 })
  : null;

function observeVideo(video) {
  prepareVideo(video);
  if (!videoVisibilityObserver || video.dataset.observed === 'true') return;
  videoVisibilityObserver.observe(video);
  video.dataset.observed = 'true';
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) document.querySelectorAll('video').forEach(video => video.pause());
});

function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  const desktopQuery = window.matchMedia('(min-width: 1024px)');
  const setSource = () => {
    const asset = mediaAsset(desktopQuery.matches ? 'hero-pc.mp4' : 'hero-mobile.mp4');
    video.pause();
    video.classList.remove('has-frame');
    video.removeAttribute('src');
    const source = video.querySelector('source');
    source.removeAttribute('src');
    source.dataset.src = asset.src;
    video.dataset.loaded = 'false';
    video.poster = asset.poster;
    const poster = document.getElementById('heroPoster');
    poster.src = asset.poster;
    poster.hidden = false;
    video.load();
    if (finePointerQuery.matches && !prefersReducedMotion.matches && !lowBandwidth() && !document.hidden && video.dataset.inViewport !== 'false') playVideo(video);
  };
  prepareVideo(video);
  setSource();
  observeVideo(video);
  desktopQuery.addEventListener('change', setSource);
  finePointerQuery.addEventListener('change', setSource);
  prefersReducedMotion.addEventListener('change', setSource);
  connection?.addEventListener('change', setSource);
}

function initHoverVideos() {
  document.querySelectorAll('.room-card-container').forEach(card => {
    const video = card.querySelector('.room-hover-video');
    if (!video || card.dataset.videoInitialized === 'true') return;
    card.dataset.videoInitialized = 'true';
    observeVideo(video);
    card.addEventListener('mouseenter', () => {
      if (finePointerQuery.matches && !lowBandwidth() && !prefersReducedMotion.matches) playVideo(video);
    });
    card.addEventListener('mouseleave', () => video.pause());
  });
  initTourVideos();
}

function initTourVideos() {
  document.querySelectorAll('.hover-video-card').forEach(card => {
    if (card.dataset.tourReady === 'true') return;
    const video = card.querySelector('.interactive-hover-video');
    if (!video) return;
    card.dataset.tourReady = 'true';
    const title = card.querySelector('h4')?.textContent.trim() || 'video tour';
    video.setAttribute('aria-label', title);
    // Native controls start playback directly from the user's tap on mobile.
    // No card click handler, thumbnail overlay, or visibility observer interferes.
    video.addEventListener('play', () => {
      document.querySelectorAll('video').forEach(other => {
        if (other !== video) other.pause();
      });
    });
  });
}

function setMobileTourFocus(activeCard, shouldFocus){
  if(prefersReducedMotion.matches || window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const cards = [...document.querySelectorAll('.hover-video-card')];
  cards.forEach(card=>{
    const isActive = shouldFocus && card === activeCard;
    gsap.to(card, {
      scale:isActive ? 1.025 : (shouldFocus ? 0.94 : 1),
      opacity:isActive || !shouldFocus ? 1 : 0.38,
      filter:isActive || !shouldFocus ? 'blur(0px) saturate(1)' : 'blur(1px) saturate(0.7)',
      duration:0.24,
      ease:'power2.out',
      overwrite:'auto',
      onComplete:()=>{ if(!shouldFocus) gsap.set(card, { clearProps:'transform,opacity,filter' }); }
    });
  });
}

function initVideoTourHoverFocus(grid){
  if(!grid || grid.dataset.tourFocusReady === 'true') return;
  if(prefersReducedMotion.matches || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  grid.dataset.tourFocusReady = 'true';

  grid.addEventListener('mouseover', e=>{
    const active = e.target.closest('.hover-video-card');
    if(!active || !grid.contains(active) || active.classList.contains('tour-focused')) return;
    const cards = [...grid.querySelectorAll('.hover-video-card')];
    const rect = active.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const safeHalfWidth = Math.max(0, Math.min(centerX - 20, window.innerWidth - centerX - 20));
    const safeHalfHeight = Math.max(0, Math.min(centerY - 20, window.innerHeight - centerY - 20));
    const safeScaleX = rect.width ? (safeHalfWidth * 2) / rect.width : 1;
    const safeScaleY = rect.height ? (safeHalfHeight * 2) / rect.height : 1;
    const previewScale = Math.max(1, Math.min(1.14, safeScaleX, safeScaleY));
    grid.classList.add('video-tour-focus-active');
    cards.forEach(card=>{
      const isActive = card === active;
      card.classList.toggle('tour-focused', isActive);
      gsap.to(card, {
        scale:isActive ? previewScale : 0.9,
        opacity:isActive ? 1 : 0.25,
        filter:isActive ? 'blur(0px) saturate(1.08)' : 'blur(2px) saturate(0.6)',
        zIndex:isActive ? 30 : 1,
        duration:0.24,
        ease:'power2.out',
        overwrite:'auto'
      });
    });
  });

  grid.addEventListener('mouseleave', ()=>{
    grid.classList.remove('video-tour-focus-active');
    grid.querySelectorAll('.hover-video-card').forEach(card=>{
      card.classList.remove('tour-focused');
      gsap.to(card, {
        scale:1,
        opacity:1,
        filter:'blur(0px) saturate(1)',
        zIndex:1,
        duration:0.26,
        ease:'power2.out',
        overwrite:'auto',
        clearProps:'transform,opacity,filter,zIndex'
      });
    });
  });
}

/* ---------------- DATA: ROOMS WITH HIGH-RES PHOTOS & HOVER VIDEOS ---------------- */
lucide.createIcons();
gsap.registerPlugin(ScrollTrigger);

const ROOMS = {
  single: [
    { name:'Single Sharing · A Block', image:'room-single-a.jpg', video:'room-single-a.mp4', fallback:'from-indigo-100 to-indigo-50', tags:['Bed with Wardrobe','Study Table','Biometric Lock','Fibernet Wi-Fi'] },
    { name:'Single Standard · B Block', image:'room-single-b.jpg', video:'room-single-b.mp4', fallback:'from-amber-50 to-clay', tags:['Bed with Wardrobe','Study Table','Fibernet Wi-Fi','Housekeeping'] },
    { name:'Single Deluxe · B Block', image:'room-single-deluxe-b.jpg', video:'room-single-deluxe-b.mp4', fallback:'from-clay to-indigo-50', tags:['Bed with Wardrobe','Study Table','Fibernet Wi-Fi','Refrigerator'] },
  ],
  double: [
    { name:'Twin Standard · A Block', image:'room-double-a.jpg', video:'room-double-a.mp4', fallback:'from-clay to-amber-50', tags:['Bed with Wardrobe','Fibernet Wi-Fi','Housekeeping'] },
    { name:'Twin Comfort · A Block', image:'room-double-comfort-a.jpg', video:'room-double-comfort-a.mp4', fallback:'from-indigo-50 to-clay', tags:['Bed with Wardrobe','Common Lounge','Fibernet Wi-Fi','Housekeeping'] },
    { name:'Twin Deluxe · A Block', image:'room-double-deluxe-a.jpg', video:'room-double-deluxe-a.mp4', fallback:'from-emerald-50 to-indigo-50', tags:['Bed with Wardrobe','Study Table','Wi-Fi','Biometric Lock'] },
    { name:'Twin Sharing · B Block', image:'room-double-b.jpg', video:'room-double-b.mp4', fallback:'from-amber-50 to-indigo-100', tags:['Bed with Wardrobe','Study Table','Wi-Fi','Refrigerator'] },
  ],
  triple: [
    { name:'Triple Sharing · A Block', image:'room-triple-a.jpg', video:'room-triple-a.mp4', fallback:'from-emerald-50 to-clay', tags:['Bed with Wardrobe','Wi-Fi','Housekeeping'] },
    { name:'Triple Standard · B Block', image:'room-triple-b.jpg', video:'room-triple-b.mp4', fallback:'from-indigo-50 to-clay', tags:['Bed with Wardrobe','Wi-Fi','Housekeeping'] },
    { name:'Triple Comfort · B Block', image:'room-triple-comfort-b.jpg', video:'room-triple-comfort-b.mp4', fallback:'from-clay to-emerald-50', tags:['Bed with Wardrobe','Study Table','Wi-Fi'] },
    { name:'Triple Deluxe · B Block', image:'room-triple-deluxe-b.jpg', video:'room-triple-deluxe-b.mp4', fallback:'from-indigo-100 to-amber-50', tags:['Bed with Wardrobe','Study Table','Wi-Fi','Biometric Lock'] },
  ],
  quad: [
    { name:'4-Sharing · B Block', image:'room-quad-b.jpg', video:'room-quad-b.mp4', fallback:'from-clay to-indigo-50', tags:['Bed with Wardrobe','Common Lounge','Wi-Fi','Housekeeping'] },
  ],
};

const AMENITIES = [
  { icon:'dumbbell', title:'In-House Gym & Fitness', desc:'Equipped gym stations and weights inside the building to maintain your workout routine.' },
  { icon:'book-open', title:'Dedicated Study Area', desc:'Silent, focused study environment with comfortable seating, charging ports, and quiet zones.' },
  { icon:'bed', title:'Bed with Wardrobe', desc:'A proper comfortable bed and personal lockable wardrobe in every room.' },
  { icon:'wifi', title:'Fibernet High-Speed Wi-Fi', desc:'High-speed fibre broadband coverage across all rooms, study spaces, and common lounges.' },
  { icon:'sparkles', title:'Daily Housekeeping', desc:'Rooms, washrooms, and common spaces cleaned by staff every single day.' },
  { icon:'fingerprint', title:'Biometric Entry System', desc:'Keyless secure fingerprint access with automated logging at the entrance.' },
  { icon:'shield-check', title:'24x7 Security & Warden', desc:'On-premise warden and trained round-the-clock security personnel.' },
  { icon:'camera', title:'Full CCTV Surveillance', desc:'Monitored security cameras across entry gates, corridors, and amenities.' },
  { icon:'droplets', title:'RO Drinking Water', desc:'Continuous purified RO drinking water dispensers installed on all floors.' },
  { icon:'move-vertical', title:'Elevator / Lift', desc:'High-speed lift access across all floors for hassle-free movement.' },
  { icon:'shirt', title:'Laundry Machines', desc:'In-house automatic washing machines for convenient everyday clothing care.' },
  { icon:'zap', title:'24/7 Power Backup', desc:'Automatic backup power generators for uninterrupted fans, lights, and study Wi-Fi.' },
];

const MEALS = {
  Mon: {
    Breakfast:'Masala Dosa, White Chutney / Normal Dosa, Sambar, Chutney',
    Lunch:'Puliyogare, Rice, Dal, Boti, Buttermilk / Vangibath, White Rice, Dal, Papad',
    Dinner:'Egg Bhurji, Rajma Curry, Veg Curry, Rice, Phulka / Boiled Egg, Rajma, Phulka'
  },
  Tue: {
    Breakfast:'Plain Chapati, Aloo Matar Curry / Palak Chapati, Aloo Matar Curry',
    Lunch:'Jeera Rice, White Rice, Dal, Chutney, Boti, Buttermilk',
    Dinner:'Chole Bhature, Rice, Dal, Buttermilk / Puri, Chole Curry, Rice, Dal'
  },
  Wed: {
    Breakfast:'Bread Upma / Pav Bhaji / Bread Pakodi, Tomato Ketchup',
    Lunch:'Egg Biryani, Mushroom / Paneer Biryani, Raita, Cucumber Salad',
    Dinner:'Kebab, Rice, Masoor Dal, Chapati, Soya Curry / Chicken Fry, Rice, Chapati'
  },
  Thu: {
    Breakfast:'Onion Dosa / Uthappa, Red Chutney / White Chutney',
    Lunch:'Tomato Rice, White Rice, Sambar / Green Moong Dal, Boti, Buttermilk',
    Dinner:'Gobi / Veg Fried Rice / Egg Fried Rice, Rice, Dal, Phulka, Mixed Veg Curry'
  },
  Fri: {
    Breakfast:'Puri, Black Chana Curry',
    Lunch:'Veg Pulav, White Rice, Aloo Matar Curry, Papad, Buttermilk',
    Dinner:'Chicken Gravy, Rice, Chapati, Soya Curry / Gongura Chicken, Rice, Chapati'
  },
  Sat: {
    Breakfast:'Aloo Paratha, Tomato Ketchup, Curd',
    Lunch:'Rice, Sambar, Veg Curry, Banana, Buttermilk',
    Dinner:'Rice, Dal, Veg Curry, Phulka, Buttermilk'
  },
  Sun: {
    Breakfast:'Idly, Sambar, Chutney',
    Lunch:'Chicken Biryani, Paneer Biryani / Bhagara Rice, Chicken Curry',
    Dinner:'Gobi Rice, White Rice, Mixed Veg Curry, Phulka, Buttermilk'
  },
};

const GALLERY = [
  { cat:'rooms', h:260, label:'Double Sharing Room, Block B', src:'room-double-b.jpg', width:4096, height:2304 },
  { cat:'gym', h:220, label:'In-House Cardio and Fitness Gym', src:'gallery-gym-fitness.jpg', width:3264, height:1836 },
  { cat:'dining', h:230, label:'Dining, Reception and CCTV Area', src:'IMG_20250303_164253.jpg', width:3884, height:2184 },
  { cat:'study', h:260, label:'Study Lounge and Recreation Area', src:'gallery-study-lounge.jpg', width:4096, height:2304 },
  { cat:'rooms', h:220, label:'Comfort Double Sharing Room, Block A', src:'room-double-comfort-a.jpg', width:4096, height:2304 },
  { cat:'study', h:210, label:'Quiet Common Lounge and Corridor', src:'IMG_20241231_171727.jpg', width:3264, height:1836 },
  { cat:'rooms', h:250, label:'Deluxe Double Sharing Room, Block A', src:'room-double-deluxe-a.jpg', width:3264, height:1836 },
  { cat:'rooms', h:270, label:'Residential Corridor and Common Fridge', src:'IMG_20250609_214135.jpg', width:2304, height:4096 },
  { cat:'rooms', h:230, label:'Triple Sharing Room, Block B', src:'room-triple-b.jpg', width:4096, height:2304 },
];

const TESTIMONIALS = [
  { name:'Ritika Malhotra', college:'B.Tech Student', quote:'The food genuinely tastes homemade and the gym and study zones make staying here super convenient. My parents are completely relaxed.', rating:5 },
  { name:'Anjali Verma, Parent', college:"Mother of a resident student, Block B", quote:'I visit every festival season and the cleanliness and safety standards never drop. Transparent policies and great food.', rating:5 },
  { name:'Ayesha Khan', college:'Student', quote:'One-minute walk to campus means I never worry about travel. The dedicated study area on the floor is my go-to spot for exams.', rating:5 },
  { name:'Sneha Rao', college:'B.Com Student', quote:'Having breakfast, lunch, and dinner served fresh every day and an in-house gym keeps my college routine completely on track.', rating:5 },
];

const FAQS = [
  { q:'How secure is the property, really?', a:'Every block runs 24/7 CCTV coverage on all floors and entry points, with trained security personnel on rotating shifts. Biometric entry logs are maintained for safety.' },
  { q:'What are the gate timings?', a:'The main gate closes strictly at 10:00 PM every night.' },
  { q:'Are all 3 meals included?', a:'Yes, breakfast, lunch, and dinner are prepared fresh on-site every single day with North and South Indian home-style variety.' },
  { q:'How can I get the current rent and deposit details?', a:'Rent and deposit details are shared privately because they depend on the room type and current availability. Please contact us on WhatsApp or schedule a visit for the latest information.' },
  { q:'Can I check room availability before visiting?', a:'Yes. Send us your preferred block and sharing type on WhatsApp, and our residence manager will confirm current availability privately.' },
];

function animateCardsWhenVisible(container, options={}){
  if(!container) return;
  if (prefersReducedMotion.matches || !finePointerQuery.matches) {
    gsap.set(container.children, { opacity:1, y:0 });
    return;
  }
  if(!container) return;
  const cards = [...container.children];
  if(!cards.length) return;
  if(container._cardRevealTrigger) container._cardRevealTrigger.kill();
  gsap.killTweensOf(cards);
  if(prefersReducedMotion.matches){
    gsap.set(cards, { opacity:1, y:0, scale:1 });
    return;
  }
  gsap.set(cards, { opacity:0, y:options.y ?? 24, scale:options.scale ?? .985 });
  container._cardRevealTrigger = ScrollTrigger.create({
    trigger:container,
    start:options.start || 'top 88%',
    once:true,
    onEnter:()=>gsap.to(cards, {
      opacity:1,
      y:0,
      scale:1,
      duration:options.duration || .55,
      stagger:options.stagger || .07,
      ease:'power2.out',
      overwrite:'auto'
    })
  });
  ScrollTrigger.refresh();
}

/* ---------------- RENDER ROOMS WITH FULL IMAGE & HOVER VIDEO ---------------- */
function renderRooms(tab){
  const grid = document.getElementById('roomGrid');
  grid.querySelectorAll('video').forEach(video => video.pause());
  if (videoVisibilityObserver) grid.querySelectorAll('video').forEach(video=>videoVisibilityObserver.unobserve(video));
  grid.innerHTML = '';
  ROOMS[tab].forEach((r) => {
    const photo = mediaAsset(r.image)?.src || mediaAsset(r.video)?.poster;
    const card = document.createElement('div');
    card.className = 'room-card-container card-glow bg-white border border-clay rounded-3xl overflow-hidden fade-up shadow-sm flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <div class="room-card-media h-56 bg-slate-900 relative overflow-hidden flex items-center justify-center">
          ${photo ? `<img 
            src="${photo}" loading="lazy" decoding="async" 
            alt="${r.name}" 
            class="room-photo-img w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />` : ''}
          <div class="${photo ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br ${r.fallback} items-center justify-center absolute inset-0">
            <i data-lucide="bed-double" class="w-10 h-10 text-ink/20"></i>
          </div>
          ${mediaAsset(r.video) ? `
            <video 
              muted 
              loop 
              playsinline 
              preload="none"
              poster="${mediaAsset(r.video).poster}" class="room-hover-video"
              onerror="this.classList.remove('has-video');">
              <source data-src="${mediaAsset(r.video).src}" type="video/mp4">
            </video>
          ` : ''}
        </div>
        <div class="p-6">
          <h3 class="font-display font-bold text-lg mb-3">${r.name}</h3>
          <div class="flex flex-wrap gap-1.5 mb-5">
            ${r.tags.map(t=>`<span class="tag-chip text-[11px] bg-porcelain border border-clay px-2 py-1 rounded-md text-ink/60">${t}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="px-6 pb-6">
        <button type="button" onclick='openRoomWhatsApp(${JSON.stringify(r.name)})' aria-label="Enquire about ${r.name} on WhatsApp" class="group w-full inline-flex items-center justify-center gap-2 bg-ink text-porcelain font-semibold text-sm py-3 rounded-xl hover:bg-emerald transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5">
          <i data-lucide="message-circle" class="w-4 h-4 text-emerald group-hover:text-white transition-colors"></i>
          Enquire on WhatsApp
          <i data-lucide="arrow-up-right" class="w-4 h-4 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
        </button>
      </div>`;
    grid.appendChild(card);
  });
  lucide.createIcons();
  initHoverVideos();
  animateCardsWhenVisible(grid, { y:28, stagger:.08 });
}

document.querySelectorAll('.room-tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.room-tab').forEach(b=>{
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    renderRooms(btn.dataset.tab);
  });
});

/* ---------------- RENDER: AMENITIES ---------------- */
function renderAmenities(){
  const grid = document.getElementById('amenitiesGrid');
  AMENITIES.forEach(a=>{
    const card = document.createElement('div');
    card.className = 'card-glow group bg-porcelain border border-clay rounded-2xl p-6 fade-up';
    card.innerHTML = `
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center mb-5 group-hover:from-indigo group-hover:to-indigo-400 transition-all duration-300">
        <i data-lucide="${a.icon}" class="w-5 h-5 text-indigo group-hover:text-white transition-colors duration-300"></i>
      </div>
      <h3 class="font-display font-bold mb-1.5">${a.title}</h3>
      <p class="text-sm text-ink/55 leading-relaxed">${a.desc}</p>`;
    grid.appendChild(card);
  });
  lucide.createIcons();
}

/* ---------------- RENDER: MEAL MENU ---------------- */
let activeDay = 'Mon';
let dayTabsBound = false;
function renderDayTabs(){
  const wrap = document.getElementById('dayTabs');
  if (!dayTabsBound){
    wrap.addEventListener('click', (e)=>{
      const btn = e.target.closest('.day-tab');
      if(!btn || !wrap.contains(btn)) return;
      activeDay = btn.dataset.day;
      setActiveDayTab();
      renderMeals();
    });
    dayTabsBound = true;
  }
  setActiveDayTab();
}
function setActiveDayTab(){
  document.querySelectorAll('#dayTabs .day-tab').forEach(btn=>{
    const isActive = btn.dataset.day === activeDay;
    btn.setAttribute('aria-pressed', String(isActive));
    btn.classList.toggle('bg-amber', isActive);
    btn.classList.toggle('text-ink', isActive);
    btn.classList.toggle('border-amber', isActive);
    btn.classList.toggle('border-white/15', !isActive);
    btn.classList.toggle('text-porcelain/60', !isActive);
    btn.classList.toggle('hover:border-white/40', !isActive);
  });
}
function renderMeals(){
  const grid = document.getElementById('mealGrid');
  grid.innerHTML = '';
  const icons = { Breakfast:'coffee', Lunch:'sun', Dinner:'moon' };
  const times = { Breakfast:'7:30 – 9:30 AM', Lunch:'12:00 – 2:00 PM', Dinner:'8:00 – 9:30 PM' };
  Object.entries(MEALS[activeDay]).forEach(([slot, dish])=>{
    const card = document.createElement('div');
    card.className = 'meal-card tilt-card bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] hover:-translate-y-1 transition-all duration-300';
    card.innerHTML = `
      <i data-lucide="${icons[slot]}" class="w-5 h-5 text-amber mb-4"></i>
      <p class="tag-chip text-[11px] text-porcelain/40 uppercase tracking-widest mb-1">${slot} · ${times[slot]}</p>
      <p class="font-display font-semibold text-white leading-snug">${dish}</p>`;
    grid.appendChild(card);
  });
  lucide.createIcons();
  initTiltCards(grid);
  animateCardsWhenVisible(grid, { y:20, duration:.45, stagger:.07, start:'top 90%' });
}

/* ---------------- GALLERY ---------------- */
function renderGallery(){
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML='';
  GALLERY.forEach(g=>{
    const el = document.createElement('div');
    el.className = 'gallery-item card-glow relative break-inside-avoid mb-5 rounded-2xl overflow-hidden border border-clay bg-clay flex items-end';
    el.style.height = g.h + 'px';
    el.dataset.cat = g.cat;
    el.innerHTML = `
      <div class="gallery-fallback hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-indigo-100 to-clay p-6 text-center">
        <div>
          <i data-lucide="image-off" class="w-7 h-7 text-ink/30 mx-auto mb-2"></i>
          <p class="text-ink/60 text-sm font-semibold">Photo temporarily unavailable</p>
        </div>
      </div>
      <img src="${mediaAsset(g.src)?.src || g.src}" alt="${g.label}" width="${g.width}" height="${g.height}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover" />
      <div class="relative z-10 p-4 pt-16 w-full bg-gradient-to-t from-ink/80 to-transparent">
        <p class="text-white text-sm font-semibold">${g.label}</p>
      </div>`;
    const image = el.querySelector('img');
    image.addEventListener('error', ()=>{
      image.classList.add('hidden');
      el.querySelector('.gallery-fallback').classList.remove('hidden');
      el.querySelector('.gallery-fallback').classList.add('flex');
      lucide.createIcons();
    }, { once:true });
    grid.appendChild(el);
  });
  lucide.createIcons();
  initGalleryHoverFocus();
  gsap.fromTo('#galleryGrid .gallery-item', {opacity:0, y:24}, {
    opacity:1, y:0, duration:.6, stagger:.06, ease:'power2.out',
    scrollTrigger:{ trigger:'#galleryGrid', start:'top 85%' }
  });
}

function initGalleryHoverFocus(){
  const grid = document.getElementById('galleryGrid');
  if(!grid || grid.dataset.focusReady === 'true') return;
  if(prefersReducedMotion.matches) return;
  grid.dataset.focusReady = 'true';

  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!finePointer){
    const resetTouchFocus = ()=>{
      grid.classList.remove('gallery-focus-active');
      grid.querySelectorAll('.gallery-item').forEach(item=>{
        item.classList.remove('gallery-focused');
        gsap.to(item, { scale:1, opacity:1, filter:'blur(0px) saturate(1)', duration:.22, ease:'power2.out', overwrite:'auto', clearProps:'transform,opacity,filter,zIndex' });
      });
    };
    grid.addEventListener('click', e=>{
      const active = e.target.closest('.gallery-item');
      if(!active || !grid.contains(active)) return;
      if(active.classList.contains('gallery-focused')){ resetTouchFocus(); return; }
      const visibleItems = [...grid.querySelectorAll('.gallery-item')].filter(item=>item.offsetParent !== null);
      grid.classList.add('gallery-focus-active');
      visibleItems.forEach(item=>{
        const isActive = item === active;
        item.classList.toggle('gallery-focused', isActive);
        gsap.to(item, { scale:isActive ? 1.025 : .9, opacity:isActive ? 1 : .3, filter:isActive ? 'blur(0px) saturate(1.08)' : 'blur(2px) saturate(.65)', zIndex:isActive ? 30 : 1, duration:.22, ease:'power2.out', overwrite:'auto' });
      });
    });
    document.addEventListener('pointerdown', e=>{ if(!grid.contains(e.target)) resetTouchFocus(); });
    return;
  }

  grid.addEventListener('mouseover', e=>{
    const active = e.target.closest('.gallery-item');
    if(!active || !grid.contains(active) || active.classList.contains('gallery-focused')) return;
    const visibleItems = [...grid.querySelectorAll('.gallery-item')].filter(item=>item.offsetParent !== null);
    grid.classList.add('gallery-focus-active');
    visibleItems.forEach(item=>{
      const isActive = item === active;
      item.classList.toggle('gallery-focused', isActive);
      gsap.to(item, {
        scale:isActive ? 1.22 : 0.84,
        opacity:isActive ? 1 : 0.16,
        filter:isActive ? 'blur(0px) saturate(1.12)' : 'blur(3px) saturate(0.5)',
        boxShadow:isActive ? '0 38px 90px -22px rgba(14,15,21,.9)' : 'none',
        zIndex:isActive ? 30 : 1,
        duration:0.24,
        ease:'power2.out',
        overwrite:'auto'
      });
    });
  });

  grid.addEventListener('mouseleave', ()=>{
    const visibleItems = [...grid.querySelectorAll('.gallery-item')].filter(item=>item.offsetParent !== null);
    grid.classList.remove('gallery-focus-active');
    visibleItems.forEach(item=>{
      item.classList.remove('gallery-focused');
      gsap.to(item, {
        scale:1,
        opacity:1,
        filter:'blur(0px) saturate(1)',
        boxShadow:'none',
        zIndex:1,
        duration:0.26,
        ease:'power2.out',
        overwrite:'auto',
        clearProps:'transform,opacity,filter,boxShadow,zIndex'
      });
    });
  });
}
document.getElementById('galleryFilters').addEventListener('click', (e)=>{
  const btn = e.target.closest('.gallery-pill');
  if(!btn) return;
  document.querySelectorAll('.gallery-pill').forEach(b=>{
    b.classList.remove('active','bg-ink','text-white');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active','bg-ink','text-white');
  btn.setAttribute('aria-pressed', 'true');
  const cat = btn.dataset.cat;
  document.querySelectorAll('#galleryGrid .gallery-item').forEach(item=>{
    const show = cat==='all' || item.dataset.cat===cat;
    if(show){
      item.style.display = '';
      gsap.fromTo(item, {opacity:0, scale:.92}, {opacity:1, scale:1, duration:.4, ease:'power2.out'});
    } else {
      gsap.to(item, {opacity:0, scale:.92, duration:.25, ease:'power2.in', onComplete:()=>{ item.style.display='none'; }});
    }
  });
});

/* ---------------- TESTIMONIALS ---------------- */
let testiIndex = 0;
function renderTesti(){
  const track = document.getElementById('testiTrack');
  const dots = document.getElementById('testiDots');
  track.innerHTML=''; dots.innerHTML='';
  TESTIMONIALS.forEach((t,i)=>{
    const card = document.createElement('div');
    card.className = 'testimonial-card tilt-card min-w-full sm:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] bg-porcelain border border-clay rounded-3xl p-7';
    card.innerHTML = `
      <div class="flex gap-1 mb-4">${Array.from({length:5}).map((_,s)=>`<i data-lucide="star" class="w-4 h-4 ${s<t.rating?'text-amber fill-amber':'text-clay'}"></i>`).join('')}</div>
      <p class="text-ink/70 leading-relaxed mb-6">"${t.quote}"</p>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-display font-bold text-indigo text-sm">${t.name.charAt(0)}</div>
        <div>
          <p class="font-semibold text-sm">${t.name}</p>
          <p class="text-xs text-ink/40">${t.college}</p>
        </div>
      </div>`;
    track.appendChild(card);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    dot.setAttribute('aria-current', String(i === testiIndex));
    dot.className = 'w-2 h-2 rounded-full ' + (i===testiIndex?'bg-ink':'bg-clay');
    dot.addEventListener('click', ()=>{ testiIndex=i; alignTesti(); });
    dots.appendChild(dot);
  });
  lucide.createIcons();
  initTiltCards(track);
  alignTesti();
  animateCardsWhenVisible(track, { y:24, duration:.5, stagger:.08 });
}
function alignTesti(){
  const track = document.getElementById('testiTrack');
  const perView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const maxIndex = Math.max(0, TESTIMONIALS.length - perView);
  testiIndex = Math.min(testiIndex, maxIndex);
  const cardWidth = track.children[0] ? track.children[0].offsetWidth + 24 : 0;
  track.style.transform = `translateX(-${testiIndex*cardWidth}px)`;
  document.querySelectorAll('#testiDots button').forEach((d,i)=>{
    d.className = 'w-2 h-2 rounded-full ' + (i===testiIndex?'bg-ink':'bg-clay');
    d.setAttribute('aria-current', String(i === testiIndex));
  });
}
function shiftTesti(dir){
  const perView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const maxIndex = Math.max(0, TESTIMONIALS.length - perView);
  testiIndex = Math.min(Math.max(0, testiIndex+dir), maxIndex);
  alignTesti();
}
window.addEventListener('resize', alignTesti);

/* ---------------- FAQ ---------------- */
function renderFaq(){
  const list = document.getElementById('faqList');
  FAQS.forEach((f)=>{
    const item = document.createElement('div');
    item.className = 'bg-white border border-clay rounded-2xl overflow-hidden';
    const panelId = `faq-panel-${list.children.length + 1}`;
    item.innerHTML = `
      <button type="button" class="faq-trigger w-full flex items-center justify-between gap-4 text-left px-6 py-5 font-display font-semibold" aria-expanded="false" aria-controls="${panelId}">
        <span>${f.q}</span>
        <i data-lucide="plus" class="faq-icon w-5 h-5 shrink-0 transition-transform duration-300"></i>
      </button>
      <div id="${panelId}" class="accordion-panel px-6" role="region">
        <p class="text-ink/60 text-sm leading-relaxed pb-5">${f.a}</p>
      </div>`;
    list.appendChild(item);
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.accordion-panel');
    const icon = item.querySelector('.faq-icon');
    trigger.addEventListener('click', ()=>{
      const isOpen = panel.style.maxHeight;
      document.querySelectorAll('.accordion-panel').forEach(p=>p.style.maxHeight='');
      document.querySelectorAll('.faq-icon').forEach(ic=>ic.style.transform='rotate(0deg)');
      document.querySelectorAll('.faq-trigger').forEach(btn=>btn.setAttribute('aria-expanded', 'false'));
      if(!isOpen){
        panel.style.maxHeight = panel.scrollHeight+'px';
        icon.style.transform='rotate(45deg)';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
  lucide.createIcons();
}

/* ---------------- MODAL ---------------- */
let lastFocusedElement = null;

function openRoomWhatsApp(roomName){
  const message = `Hello SLS Comforts PG, I’m interested in ${roomName}. Please share the current rent, deposit, availability, and room details.`;
  const whatsappUrl = `https://wa.me/916360632742?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener');
}

function openModal(roomName=''){
  const overlay = document.getElementById('modalOverlay');
  const roomInput = document.getElementById('visitRoom');
  const roomNotice = document.getElementById('selectedRoomNotice');
  const blockSelect = document.getElementById('visitBlock');
  const visitDate = document.getElementById('visitDate');
  const today = new Date();
  visitDate.min = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  roomInput.value = roomName;
  if(roomName){
    roomNotice.textContent = `Interested in: ${roomName}`;
    roomNotice.classList.remove('hidden');
    if(roomName.includes('B Block')) blockSelect.selectedIndex = 1;
    else if(roomName.includes('A Block')) blockSelect.selectedIndex = 0;
  } else {
    roomNotice.textContent = '';
    roomNotice.classList.add('hidden');
  }
  lastFocusedElement = document.activeElement;
  overlay.classList.remove('hidden'); overlay.classList.add('flex');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  gsap.fromTo('#modalCard', {opacity:0, y:20, scale:.96}, {opacity:1, y:0, scale:1, duration:.4, ease:'power2.out'});
  if(!prefersReducedMotion.matches){
    gsap.fromTo('#visitDateTimeGrid .visit-datetime-card',
      { opacity:0, y:12, scale:.97 },
      { opacity:1, y:0, scale:1, duration:.45, stagger:.08, delay:.12, ease:'power3.out', clearProps:'transform' }
    );
  }
  requestAnimationFrame(()=>document.getElementById('visitName').focus());
}
function closeModal(){
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.getElementById('modalSuccess').classList.add('hidden');
  document.querySelector('#modalOverlay form').classList.remove('hidden');
  if(lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
}

function normalizeIndianPhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

function formatVisitDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { day:'numeric', month:'long', year:'numeric' }).format(new Date(year, month - 1, day));
}

function formatVisitTime(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return new Intl.DateTimeFormat('en-IN', { hour:'numeric', minute:'2-digit', hour12:true }).format(new Date(2000, 0, 1, hours, minutes));
}

const visitPhoneInput = document.getElementById('visitPhone');
const visitNameInput = document.getElementById('visitName');
visitNameInput.addEventListener('input', ()=>visitNameInput.setCustomValidity(''));
visitPhoneInput.addEventListener('input', ()=>visitPhoneInput.setCustomValidity(''));
visitPhoneInput.addEventListener('blur', ()=>{
  const isValid = normalizeIndianPhone(visitPhoneInput.value);
  visitPhoneInput.setCustomValidity(isValid ? '' : 'Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8, or 9.');
});

function submitVisit(e){
  e.preventDefault();
  const name = document.getElementById('visitName').value.trim();
  const phone = normalizeIndianPhone(visitPhoneInput.value);
  const block = document.getElementById('visitBlock').value;
  const room = document.getElementById('visitRoom').value;
  const visitDate = document.getElementById('visitDate').value;
  const visitTime = document.getElementById('visitTime').value;
  if (name.length < 2) {
    document.getElementById('visitName').setCustomValidity('Enter the resident’s full name.');
    document.getElementById('visitName').reportValidity();
    return;
  }
  document.getElementById('visitName').setCustomValidity('');
  if (!phone) {
    visitPhoneInput.setCustomValidity('Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8, or 9.');
    visitPhoneInput.reportValidity();
    return;
  }
  const message = [
    room
      ? `Hello SLS Comforts PG, I’m interested in ${room}. Could you please share the rent, deposit, current availability, and other details?`
      : 'Hello SLS Comforts PG, I would like to schedule a visit. Please share the available room details.',
    '',
    `Name: ${name}`,
    `Phone: +91 ${phone}`,
    ...(room ? [`Interested room: ${room}`] : []),
    `Preferred block: ${block}`,
    `Preferred visit date: ${formatVisitDate(visitDate)}`,
    `Preferred visit time: ${formatVisitTime(visitTime)}`
  ].join('\n');
  const whatsappUrl = `https://wa.me/916360632742?text=${encodeURIComponent(message)}`;

  document.getElementById('whatsappFallback').href = whatsappUrl;
  document.getElementById('visitForm').classList.add('hidden');
  document.getElementById('modalSuccess').classList.remove('hidden');
  window.open(whatsappUrl, '_blank', 'noopener');
  document.getElementById('whatsappFallback').focus();
}
document.getElementById('modalOverlay').addEventListener('click', (e)=>{
  if(e.target.id==='modalOverlay') closeModal();
});
document.addEventListener('keydown', (e)=>{
  const overlay = document.getElementById('modalOverlay');
  if(overlay.classList.contains('hidden')) return;
  if(e.key === 'Escape'){
    e.preventDefault();
    closeModal();
    return;
  }
  if(e.key !== 'Tab') return;
  const focusable = [...overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(el=>!el.disabled && el.offsetParent !== null);
  if(!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});

/* ---------------- MOBILE MENU ---------------- */
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', ()=>{
  const isHidden = mobileMenu.classList.contains('hidden');
  mobileMenu.classList.toggle('hidden');
  menuBtn.setAttribute('aria-expanded', String(isHidden));
  document.getElementById('menuIcon').setAttribute('data-lucide', isHidden ? 'x' : 'menu');
  lucide.createIcons();
});
document.querySelectorAll('#mobileMenu a').forEach(a=>a.addEventListener('click', ()=>{
  mobileMenu.classList.add('hidden');
  document.getElementById('menuIcon').setAttribute('data-lucide','menu');
  lucide.createIcons();
}));

/* ---------------- NAV SHRINK ON SCROLL ---------------- */
window.addEventListener('scroll', ()=>{
  const navInner = document.getElementById('navInner');
  if(window.scrollY > 30){ navInner.classList.add('shadow-lift'); } else { navInner.classList.remove('shadow-lift'); }
});

/* ---------------- COUNT-UP STATS ---------------- */
function animateCounters(){
  document.querySelectorAll('.counter').forEach(el=>{
    const target = Number(el.dataset.target);
    const obj = {val:0};
    gsap.to(obj, {
      val: target, duration: 1.6, ease:'power2.out',
      onUpdate: ()=>{ el.textContent = Math.round(obj.val); }
    });
  });
}

/* ---------------- GSAP ENTRANCE + SCROLL REVEALS ---------------- */
function initAnimations(){
  if (prefersReducedMotion.matches || !finePointerQuery.matches) {
    gsap.set('.fade-up, .reveal', { opacity:1, y:0 });
    document.querySelectorAll('.counter').forEach(el => { el.textContent = el.dataset.target; });
    return;
  }
  gsap.timeline({ defaults:{ ease:'power3.out', duration:.8 } })
    .to('#heroHeading', { opacity:1, y:0 })
    .to('#heroSub', { opacity:1, y:0 }, '-=.55')
    .to('#heroCtas', { opacity:1, y:0 }, '-=.55')
    .to('#heroStats', { opacity:1, y:0 }, '-=.6')
    .call(animateCounters, [], '-=.3');

  gsap.utils.toArray('.reveal').forEach(el=>{
    gsap.fromTo(el, {opacity:0, y:24}, {
      opacity:1, y:0, duration:.7, ease:'power2.out',
      scrollTrigger:{ trigger:el, start:'top 85%' }
    });
  });

  document.querySelectorAll('#amenitiesGrid').forEach(grid=>{
    gsap.fromTo(grid.children, {opacity:0, y:24}, {
      opacity:1, y:0, duration:.6, stagger:.06, ease:'power2.out',
      scrollTrigger:{ trigger:grid, start:'top 85%' }
    });
  });
}

/* ---------------- SMOOTH SCROLL EFFECTS ---------------- */
function initSmoothEffects(){
  const progress = document.getElementById('scrollProgress');
  let progressFrame = null;
  const updateProgress = ()=>{
    progressFrame = null;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };
  window.addEventListener('scroll', ()=>{
    if(!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
  }, { passive:true });
  window.addEventListener('resize', updateProgress, { passive:true });
  updateProgress();

  const sectionLinks = [...document.querySelectorAll('.nav-link[href^="#"]')]
    .map(link=>({ link, section:document.querySelector(link.getAttribute('href')) }))
    .filter(item=>item.section);
  if('IntersectionObserver' in window){
    const sectionObserver = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        sectionLinks.forEach(item=>item.link.classList.toggle('nav-active', item.section === entry.target));
      });
    }, { rootMargin:'-35% 0px -55%', threshold:0 });
    sectionLinks.forEach(item=>sectionObserver.observe(item.section));
  }

  if(prefersReducedMotion.matches || !finePointerQuery.matches || lowBandwidth()) return;

  gsap.to('#heroVideo', {
    scale:1.1,
    yPercent:5,
    ease:'none',
    scrollTrigger:{ trigger:'#home', start:'top top', end:'bottom top', scrub:0.8 }
  });

  gsap.fromTo('.hover-video-card',
    { opacity:0, y:42, scale:0.98 },
    { opacity:1, y:0, scale:1, duration:0.75, stagger:0.1, ease:'power3.out',
      scrollTrigger:{ trigger:'#video-tour', start:'top 72%' } }
  );

  gsap.fromTo('#faqList > div',
    { opacity:0, y:24 },
    { opacity:1, y:0, duration:0.6, stagger:0.08, ease:'power2.out',
      scrollTrigger:{ trigger:'#faqList', start:'top 82%' } }
  );

  document.querySelectorAll('.gallery-item img').forEach(image=>{
    gsap.fromTo(image,
      { scale:1.08, yPercent:-3 },
      { scale:1.08, yPercent:3, ease:'none',
        scrollTrigger:{ trigger:image.closest('.gallery-item'), start:'top bottom', end:'bottom top', scrub:0.7 } }
    );
  });

  ScrollTrigger.refresh();
}

/* ---------------- POINTER INTERACTIONS ---------------- */
function initTiltCards(root=document){
  if(prefersReducedMotion.matches || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  root.querySelectorAll('.tilt-card:not([data-tilt-ready])').forEach(card=>{
    card.dataset.tiltReady = 'true';
    card.addEventListener('pointermove', e=>{
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, { rotationY:x * 4, rotationX:y * -4, transformPerspective:800, duration:0.35, ease:'power2.out', overwrite:'auto' });
    });
    card.addEventListener('pointerleave', ()=>{
      gsap.to(card, { rotationY:0, rotationX:0, duration:0.45, ease:'power3.out', overwrite:'auto' });
    });
  });
}

function initPointerInteractions(){
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hero = document.getElementById('home');
  const spotlight = document.getElementById('heroSpotlight');
  if(finePointer && !prefersReducedMotion.matches && hero && spotlight){
    const moveX = gsap.quickTo(spotlight, 'left', { duration:0.7, ease:'power3.out' });
    const moveY = gsap.quickTo(spotlight, 'top', { duration:0.7, ease:'power3.out' });
    hero.addEventListener('pointermove', e=>{
      const rect = hero.getBoundingClientRect();
      moveX(e.clientX - rect.left);
      moveY(e.clientY - rect.top);
    });
    hero.addEventListener('pointerleave', ()=>{
      moveX(hero.clientWidth / 2);
      moveY(hero.clientHeight * 0.48);
    });
  }

  document.addEventListener('pointerdown', e=>{
    const target = e.target.closest('button, .cta-btn, a[href^="https://wa.me"]');
    if(!target || prefersReducedMotion.matches) return;
    target.classList.add('tap-feedback');
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'tap-ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    ripple.setAttribute('aria-hidden', 'true');
    target.appendChild(ripple);
    ripple.addEventListener('animationend', ()=>ripple.remove(), { once:true });
  });

  initTiltCards();
}

/* ---------------- INIT ---------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  initHeroVideo();
  renderRooms('single');
  renderAmenities();
  renderDayTabs();
  renderMeals();
  renderGallery();
  renderTesti();
  renderFaq();
  initAnimations();
  initSmoothEffects();
  initPointerInteractions();
  initHoverVideos();
  lucide.createIcons();
});
