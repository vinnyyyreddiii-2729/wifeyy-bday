/* ==========================================================================
   HAPPIEST BIRTHDAY WIFEYY ❤️ — STARRY POLAROID LOVE ALBUM
   Complete Interactive Logic (script.js)
   ========================================================================== */

(function () {
  "use strict";

  /* ========================================================================
     1. APPLICATION STATE & CONSTANTS
     ======================================================================== */
  const SECRET_AGE = "19";
  const SECRET_DATE = "10/10/2021"; // Exact DD/MM/YYYY format required

  // All 12 required nicknames + 12 distinct colors (Shown ONLY after Age 19 is unlocked)
  const WIFEY_NICKNAMES = [
    { name: "sphoo", color: "#FF8FB1", glow: "rgba(255, 143, 177, 0.75)" },     // Pink
    { name: "ammu", color: "#DCC6FF", glow: "rgba(220, 198, 255, 0.75)" },      // Lavender
    { name: "ammadi", color: "#FFD76A", glow: "rgba(255, 215, 106, 0.75)" },    // Gold
    { name: "bujji", color: "#9BF6FF", glow: "rgba(155, 246, 255, 0.75)" },     // Cyan
    { name: "bangaram", color: "#FFADAD", glow: "rgba(255, 173, 173, 0.75)" },  // Coral
    { name: "cutie", color: "#E0AAFF", glow: "rgba(224, 170, 255, 0.75)" },     // Purple
    { name: "dii", color: "#BFE8FF", glow: "rgba(191, 232, 255, 0.75)" },       // Baby blue
    { name: "nanna", color: "#B9FBC0", glow: "rgba(185, 251, 192, 0.75)" },     // Mint
    { name: "nannalu", color: "#FF758F", glow: "rgba(255, 117, 143, 0.75)" },   // Rose
    { name: "bujjilu", color: "#FFD6A5", glow: "rgba(255, 214, 165, 0.75)" },   // Peach
    { name: "mommyy", color: "#FF99C8", glow: "rgba(255, 153, 200, 0.75)" },    // Magenta
    { name: "babyy", color: "#A0C4FF", glow: "rgba(160, 196, 255, 0.75)" }      // Sky blue
  ];

  // 12 Album Photos Data
  const ALBUM_PHOTOS = [
    { src: "assets/photos/photo1.jpg", fallback: "images/photo1.jpg", caption: "Our Beginning 💕" },
    { src: "assets/photos/photo2.jpg", fallback: "images/photo2.jpg", caption: "My Favorite Smile ✨" },
    { src: "assets/photos/photo3.jpg", fallback: "images/photo3.jpg", caption: "Little Moments 🌸" },
    { src: "assets/photos/photo4.jpg", fallback: "images/photo4.jpg", caption: "Just Us 💗" },
    { src: "assets/photos/photo5.jpg", fallback: "images/photo5.jpg", caption: "My Cutiee 🦋" },
    { src: "assets/photos/photo6.jpg", fallback: "images/photo6.jpg", caption: "That Special Day 🌙" },
    { src: "assets/photos/photo7.jpg", fallback: "images/photo7.jpg", caption: "Our Crazy Side 💕" },
    { src: "assets/photos/photo8.jpg", fallback: "images/photo8.jpg", caption: "My Wifeyy 👑" },
    { src: "assets/photos/photo9.jpg", fallback: "images/photo9.jpg", caption: "Forever Us ♾️" },
    { src: "assets/photos/photo10.jpg", fallback: "images/photo10.jpg", caption: "One More Memory 📸" },
    { src: "assets/photos/photo11.jpg", fallback: "images/photo11.jpg", caption: "Under The Stars 🌟" },
    { src: "assets/photos/photo12.jpg", fallback: "images/photo12.jpg", caption: "My Whole World ❤️" }
  ];

  let isAgeUnlocked = false;
  let isDateUnlocked = false;
  let nicknamesStarted = false;
  let currentSection = "home";
  let isTransitioningSection = false;
  let currentLightboxIndex = 0;
  let isGiftOpened = false;

  // Music & Video Sync State
  let isMusicPlaying = false;
  let userManuallyMutedMusic = false;
  let wasMusicPlayingBeforeVideo = false;
  let synthMusicInterval = null;
  let audioCtx = null;

  /* ========================================================================
     2. WEB AUDIO SYNTHESIZER FALLBACK & SOUND EFFECTS SYSTEM
     Ensures gentle celebratory tones & romantic music box work even if MP3s
     are missing, with zero console errors.
     ======================================================================== */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(function () {});
    }
    return audioCtx;
  }

  function playGentleTone(freq, startTimeOffset, duration, volume, type) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime + startTimeOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume || 0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (_e) {
      // Ignore audio errors silently
    }
  }

  // Soft romantic chime for Correct Age (19)
  function playCorrectAgeSound() {
    const audioEl = document.getElementById("sound-correct-age");
    if (audioEl) {
      audioEl.volume = 0.55;
      audioEl.currentTime = 0;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {
          // Fallback gentle romantic chime (C5 - E5 - G5 - C6)
          playGentleTone(523.25, 0.0, 0.45, 0.09, "sine");
          playGentleTone(659.25, 0.11, 0.5, 0.09, "sine");
          playGentleTone(783.99, 0.22, 0.55, 0.09, "sine");
          playGentleTone(1046.5, 0.34, 0.85, 0.11, "triangle");
        });
        return;
      }
    }
    playGentleTone(523.25, 0.0, 0.45, 0.09, "sine");
    playGentleTone(659.25, 0.11, 0.5, 0.09, "sine");
    playGentleTone(783.99, 0.22, 0.55, 0.09, "sine");
    playGentleTone(1046.5, 0.34, 0.85, 0.11, "triangle");
  }

  // Dreamy harp arpeggio for Correct Relationship Date (10/10/21)
  function playCorrectDateSound() {
    const audioEl = document.getElementById("sound-correct-date");
    if (audioEl) {
      audioEl.volume = 0.55;
      audioEl.currentTime = 0;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {
          // Fallback romantic harp arpeggio (F4 - A4 - C5 - E5 - F5 - A5)
          const notes = [349.23, 440.0, 523.25, 659.25, 698.46, 880.0];
          notes.forEach(function (n, idx) {
            playGentleTone(n, idx * 0.09, 0.75, 0.08, "sine");
          });
        });
        return;
      }
    }
    const notes = [349.23, 440.0, 523.25, 659.25, 698.46, 880.0];
    notes.forEach(function (n, idx) {
      playGentleTone(n, idx * 0.09, 0.75, 0.08, "sine");
    });
  }

  // Very subtle click sound for important buttons
  function playSubtleClickSound() {
    const audioEl = document.getElementById("sound-click");
    if (audioEl) {
      audioEl.volume = 0.28;
      audioEl.currentTime = 0;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {
          playGentleTone(880, 0, 0.09, 0.035, "sine");
        });
        return;
      }
    }
    playGentleTone(880, 0, 0.09, 0.035, "sine");
  }

  /* ========================================================================
     3. BACKGROUND BIRTHDAY MUSIC CONTROLLER + SYNTH MUSIC BOX FALLBACK
     ======================================================================== */
  const MUSIC_BOX_MELODY = [
    { f: 392.0, d: 0.45 }, { f: 392.0, d: 0.45 }, { f: 440.0, d: 0.8 }, { f: 392.0, d: 0.8 },
    { f: 523.25, d: 0.8 }, { f: 493.88, d: 1.2 },
    { f: 392.0, d: 0.45 }, { f: 392.0, d: 0.45 }, { f: 440.0, d: 0.8 }, { f: 392.0, d: 0.8 },
    { f: 587.33, d: 0.8 }, { f: 523.25, d: 1.2 },
    { f: 392.0, d: 0.45 }, { f: 392.0, d: 0.45 }, { f: 783.99, d: 0.8 }, { f: 659.25, d: 0.8 },
    { f: 523.25, d: 0.8 }, { f: 493.88, d: 0.8 }, { f: 440.0, d: 1.1 },
    { f: 698.46, d: 0.45 }, { f: 698.46, d: 0.45 }, { f: 659.25, d: 0.8 }, { f: 523.25, d: 0.8 },
    { f: 587.33, d: 0.8 }, { f: 523.25, d: 1.4 }
  ];
  let melodyNoteIdx = 0;

  function startFallbackMusicBox() {
    stopFallbackMusicBox();
    synthMusicInterval = setInterval(function () {
      if (!isMusicPlaying) return;
      const note = MUSIC_BOX_MELODY[melodyNoteIdx % MUSIC_BOX_MELODY.length];
      playGentleTone(note.f, 0, note.d * 0.95, 0.045, "sine");
      playGentleTone(note.f * 0.5, 0, note.d * 0.95, 0.02, "triangle");
      melodyNoteIdx++;
    }, 560);
  }

  function stopFallbackMusicBox() {
    if (synthMusicInterval) {
      clearInterval(synthMusicInterval);
      synthMusicInterval = null;
    }
  }

  function updateMusicUI() {
    const floatBtn = document.getElementById("floating-music-btn");
    const floatLabel = document.getElementById("floating-music-label");
    const floatIcon = document.getElementById("floating-music-icon");
    const navIcon = document.getElementById("nav-music-icon");
    const navText = document.getElementById("nav-music-text");

    if (floatBtn) {
      floatBtn.classList.toggle("music-paused", !isMusicPlaying);
    }
    if (floatLabel) {
      floatLabel.textContent = isMusicPlaying ? "Music On" : "Music Off";
    }
    if (floatIcon) {
      floatIcon.textContent = isMusicPlaying ? "🎵" : "🔇";
    }
    if (navIcon) {
      navIcon.textContent = isMusicPlaying ? "🎵" : "🔇";
    }
    if (navText) {
      navText.textContent = isMusicPlaying ? "Music On" : "Muted";
    }
  }

  function startBackgroundMusic() {
    const bgAudio = document.getElementById("bg-music");
    isMusicPlaying = true;
    userManuallyMutedMusic = false;
    updateMusicUI();

    if (bgAudio) {
      bgAudio.volume = 0.45;
      const p = bgAudio.play();
      if (p !== undefined) {
        p.then(function () {
          stopFallbackMusicBox();
        }).catch(function () {
          startFallbackMusicBox();
        });
      }
    } else {
      startFallbackMusicBox();
    }
  }

  function pauseBackgroundMusic(isManualAction) {
    const bgAudio = document.getElementById("bg-music");
    isMusicPlaying = false;
    if (isManualAction) {
      userManuallyMutedMusic = true;
    }
    if (bgAudio) {
      try {
        bgAudio.pause();
      } catch (_e) {}
    }
    stopFallbackMusicBox();
    updateMusicUI();
  }

  function toggleBackgroundMusic() {
    playSubtleClickSound();
    if (isMusicPlaying) {
      pauseBackgroundMusic(true);
    } else {
      startBackgroundMusic();
    }
  }

  /* ========================================================================
     4. STARRY SKY & SHOOTING STARS CANVAS
     ======================================================================== */
  const shootingStars = [];

  function initStarrySkyCanvas() {
    const canvas = document.getElementById("starry-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const starCount = Math.min(130, Math.floor((width * height) / 11000));
    const stars = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.7 + 0.4,
        alpha: Math.random() * 0.75 + 0.2,
        speed: Math.random() * 0.018 + 0.005,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.7 ? "#FFD6E7" : Math.random() > 0.4 ? "#FFF9F5" : "#FFD76A"
      });
    }

    window.addEventListener("resize", function () {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    function spawnRandomShootingStar() {
      if (shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * height * 0.35,
          len: Math.random() * 75 + 55,
          vx: -(Math.random() * 6 + 5),
          vy: Math.random() * 4 + 3,
          life: 1
        });
      }
    }

    setInterval(function () {
      if (Math.random() < 0.65) {
        spawnRandomShootingStar();
      }
    }, 3400);

    function renderSky() {
      ctx.clearRect(0, 0, width, height);

      // Twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.speed;
        const currentAlpha = 0.25 + ((Math.sin(s.phase) + 1) / 2) * 0.7;
        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = s.hue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Shooting stars
      for (let j = shootingStars.length - 1; j >= 0; j--) {
        const st = shootingStars[j];
        st.x += st.vx;
        st.y += st.vy;
        st.life -= 0.022;

        if (st.life <= 0) {
          shootingStars.splice(j, 1);
          continue;
        }

        ctx.save();
        const grad = ctx.createLinearGradient(
          st.x,
          st.y,
          st.x - st.vx * 10,
          st.y - st.vy * 10
        );
        grad.addColorStop(0, "rgba(255, 249, 245, " + st.life + ")");
        grad.addColorStop(0.4, "rgba(255, 143, 177, " + st.life * 0.7 + ")");
        grad.addColorStop(1, "rgba(255, 143, 177, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(st.x - st.vx * 10, st.y - st.vy * 10);
        ctx.stroke();
        ctx.restore();
      }

      requestAnimationFrame(renderSky);
    }

    requestAnimationFrame(renderSky);
  }

  function triggerShootingStarShower(count) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < count; i++) {
      setTimeout(function () {
        shootingStars.push({
          x: Math.random() * w * 0.85 + w * 0.1,
          y: Math.random() * h * 0.4,
          len: 90,
          vx: -(Math.random() * 7 + 6),
          vy: Math.random() * 5 + 3.5,
          life: 1
        });
      }, i * 180);
    }
  }

  /* ========================================================================
     5. CONTINUOUS HEART RAIN (Active on First Locked Page & All Pages)
     ======================================================================== */
  function initHeartRain() {
    const container = document.getElementById("heart-rain-container");
    if (!container) return;

    const symbols = ["💗", "💕", "✨", "💖", "🌸", "✦"];
    const maxHearts = window.innerWidth < 600 ? 14 : 22;

    function spawnHeart() {
      if (container.childElementCount >= maxHearts) return;

      const el = document.createElement("span");
      el.className = "falling-heart";
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];

      const size = (Math.random() * 0.85 + 0.75).toFixed(2);
      const left = (Math.random() * 96 + 2).toFixed(2);
      const duration = (Math.random() * 6 + 7.5).toFixed(2);
      const drift = (Math.random() * 90 - 45).toFixed(0) + "px";
      const spin = (Math.random() * 320 - 160).toFixed(0) + "deg";
      const maxOp = (Math.random() * 0.35 + 0.35).toFixed(2);

      el.style.left = left + "%";
      el.style.fontSize = size + "rem";
      el.style.animationDuration = duration + "s";
      el.style.setProperty("--drift", drift);
      el.style.setProperty("--spin", spin);
      el.style.setProperty("--max-op", maxOp);

      container.appendChild(el);

      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, parseFloat(duration) * 1000);
    }

    // Initial gentle sprinkle
    for (let i = 0; i < 8; i++) {
      setTimeout(spawnHeart, i * 350);
    }
    setInterval(spawnHeart, 680);
  }

  /* ========================================================================
     6. 12 FLOATING NICKNAMES SYSTEM
     CRITICAL: Starts ONLY after Age 19 is validated!
     ======================================================================== */
  function startFloatingNicknames() {
    if (nicknamesStarted) return;
    nicknamesStarted = true;

    const container = document.getElementById("nicknames-container");
    if (!container) return;
    container.innerHTML = "";
    container.classList.remove("hidden");

    // Create all 12 floating nicknames in non-intrusive peripheral & ambient zones
    WIFEY_NICKNAMES.forEach(function (item, idx) {
      const tag = document.createElement("span");
      tag.className = "floating-nickname";
      tag.textContent = item.name;

      // Distribute across screen while keeping center text readable
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const baseLeft = col * 24 + (Math.random() * 10 + 3);
      const baseTop = row * 28 + (Math.random() * 14 + 8);

      const dur = (15 + Math.random() * 9).toFixed(1) + "s";
      const delay = (idx * 0.45).toFixed(2) + "s";
      const dx = (Math.random() * 90 - 45).toFixed(0) + "px";
      const dy = (Math.random() * -70 - 20).toFixed(0) + "px";
      const dxEnd = (Math.random() * 80 - 40).toFixed(0) + "px";
      const dyEnd = (Math.random() * -110 - 30).toFixed(0) + "px";
      const rotStart = (Math.random() * 16 - 8).toFixed(1) + "deg";
      const rotMid = (Math.random() * 16 - 8).toFixed(1) + "deg";

      tag.style.left = Math.min(88, Math.max(4, baseLeft)) + "%";
      tag.style.top = Math.min(88, Math.max(6, baseTop)) + "%";
      tag.style.setProperty("--nick-color", item.color);
      tag.style.setProperty("--nick-glow", item.glow);
      tag.style.setProperty("--dur", dur);
      tag.style.setProperty("--delay", delay);
      tag.style.setProperty("--dx", dx);
      tag.style.setProperty("--dy", dy);
      tag.style.setProperty("--dx-end", dxEnd);
      tag.style.setProperty("--dy-end", dyEnd);
      tag.style.setProperty("--rot-start", rotStart);
      tag.style.setProperty("--rot-mid", rotMid);

      container.appendChild(tag);
    });
  }

  /* ========================================================================
     7. CELEBRATION EXPLOSIONS (CONFETTI, HEARTS, PAPER PIECES, BALLOONS)
     ======================================================================== */
  function triggerScreenFlash() {
    const flash = document.getElementById("screen-flash");
    if (!flash) return;
    flash.classList.add("flash-active");
    setTimeout(function () {
      flash.classList.remove("flash-active");
    }, 520);
  }

  function createCelebrationExplosion(options) {
    const layer = document.getElementById("celebration-layer");
    if (!layer) return;

    const count = (options && options.count) || 55;
    const includeBalloons = options && options.balloons;
    const includeLetters = options && options.letters;
    const originX = (options && options.x) || window.innerWidth / 2;
    const originY = (options && options.y) || window.innerHeight / 2;

    const symbols = includeLetters
      ? ["💌", "💗", "🌸", "🌹", "✨", "💖", "📜", "💕"]
      : ["💗", "💖", "✨", "🌟", "💕", "🎊", "🌸", "💛"];

    const colors = [
      "#FF4F87",
      "#FFD76A",
      "#FFD6E7",
      "#DCC6FF",
      "#BFE8FF",
      "#FF8FB1",
      "#B9FBC0"
    ];

    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "burst-particle";

      const isPaperStrip = i % 2 === 0;
      if (isPaperStrip) {
        p.style.width = Math.floor(Math.random() * 8 + 7) + "px";
        p.style.height = Math.floor(Math.random() * 14 + 10) + "px";
        p.style.background = colors[i % colors.length];
        p.style.borderRadius = "2px";
        p.style.boxShadow = "0 0 8px " + colors[i % colors.length];
      } else {
        p.textContent = symbols[i % symbols.length];
        p.style.fontSize = (Math.random() * 0.9 + 0.95).toFixed(2) + "rem";
      }

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * ( Math.min(window.innerWidth, window.innerHeight) * 0.55 ) + 60;
      const tx = Math.cos(angle) * distance + "px";
      const ty = Math.sin(angle) * distance + "px";
      const rot = Math.floor(Math.random() * 720 - 360) + "deg";
      const dur = (Math.random() * 0.9 + 1.25).toFixed(2) + "s";

      p.style.left = originX + "px";
      p.style.top = originY + "px";
      p.style.setProperty("--tx", tx);
      p.style.setProperty("--ty", ty);
      p.style.setProperty("--rot", rot);
      p.style.setProperty("--p-dur", dur);

      layer.appendChild(p);

      setTimeout(function () {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 2300);
    }

    if (includeBalloons) {
      const balloonIcons = ["🎈", "💗", "🎈", "💖", "🎈"];
      for (let b = 0; b < 10; b++) {
        const bal = document.createElement("span");
        bal.className = "rising-balloon";
        bal.textContent = balloonIcons[b % balloonIcons.length];
        bal.style.left = Math.floor(Math.random() * 86 + 7) + "%";
        bal.style.setProperty("--b-dur", (3.4 + Math.random() * 1.8).toFixed(2) + "s");
        bal.style.setProperty("--b-sway", Math.floor(Math.random() * 60 - 30) + "px");
        layer.appendChild(bal);

        setTimeout(function () {
          if (bal.parentNode) bal.parentNode.removeChild(bal);
        }, 5400);
      }
    }
  }

  function spawnClickHeartBurst(clientX, clientY, customSymbol) {
    const symbols = customSymbol ? [customSymbol, "💗", "✨"] : ["💗", "💖", "✨", "💕"];
    for (let i = 0; i < 5; i++) {
      const h = document.createElement("span");
      h.className = "click-ripple-heart";
      h.textContent = symbols[i % symbols.length];
      h.style.left = clientX + "px";
      h.style.top = clientY + "px";
      h.style.setProperty("--cx", Math.floor(Math.random() * 54 - 27) + "px");
      document.body.appendChild(h);
      setTimeout(function () {
        if (h.parentNode) h.parentNode.removeChild(h);
      }, 900);
    }
  }

  /* ========================================================================
     8. STEP 1: SECRET AGE LOCK VALIDATION (ONLY "19" UNLOCKS)
     ======================================================================== */
  function initAgeLock() {
    const form = document.getElementById("age-lock-form");
    const ageInput = document.getElementById("age-input");
    const inputWrap = document.getElementById("age-input-wrap");
    const errorMsg = document.getElementById("age-error-msg");
    const lockVisual = document.getElementById("heart-lock-visual");
    const stageOne = document.getElementById("stage-age-lock");
    const stageTwo = document.getElementById("stage-date-lock");
    const floatMusicBtn = document.getElementById("floating-music-btn");

    if (!form || !ageInput) return;

    ageInput.addEventListener("input", function () {
      if (errorMsg) errorMsg.classList.remove("visible");
      if (inputWrap) inputWrap.classList.remove("shake-error");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isAgeUnlocked) return;

      const enteredValue = ageInput.value.trim();

      if (enteredValue !== SECRET_AGE) {
        // Wrong answer: Keep locked, shake input, pink/red glow, show cute message
        playSubtleClickSound();
        if (inputWrap) {
          inputWrap.classList.remove("shake-error");
          void inputWrap.offsetWidth; // trigger reflow
          inputWrap.classList.add("shake-error");
        }
        if (errorMsg) {
          errorMsg.classList.add("visible");
        }
        ageInput.select();
        return;
      }

      // CORRECT ANSWER: 19
      isAgeUnlocked = true;
      if (errorMsg) errorMsg.classList.remove("visible");

      // 1. Play soft romantic correct-age sound immediately
      playCorrectAgeSound();

      // 2. Open the heart lock shackle
      if (lockVisual) {
        lockVisual.classList.add("unlocked");
      }

      // 3. Soft screen flash + confetti, paper pieces, hearts, glitter & balloons
      triggerScreenFlash();
      createCelebrationExplosion({ count: 70, balloons: true });
      triggerShootingStarShower(5);

      // 4. Start background birthday music + show music toggle button
      if (floatMusicBtn) {
        floatMusicBtn.classList.remove("hidden");
      }
      startBackgroundMusic();

      // 5. Start the 12 floating nicknames NOW that 19 is entered
      startFloatingNicknames();

      // 6. Transition smoothly into Birthday Reveal + Second Lock Page
      setTimeout(function () {
        if (stageOne) stageOne.classList.add("hidden");
        if (stageTwo) {
          stageTwo.classList.remove("hidden");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 950);
    });
  }

  /* ========================================================================
     9. STEP 2: RELATIONSHIP DATE LOCK VALIDATION (ONLY "10/10/2021" UNLOCKS)
     Automatically formats numeric input as DD/MM/YYYY:
       1        -> 1
       10       -> 10/
       101      -> 10/1
       1010     -> 10/10/
       10102021 -> 10/10/2021
     ======================================================================== */
  function formatDateInputValue(rawVal, isDeleting) {
    const digits = String(rawVal || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length === 0) return "";
    if (digits.length < 2) return digits;
    if (digits.length === 2) {
      return isDeleting ? digits : digits + "/";
    }
    if (digits.length < 4) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    if (digits.length === 4) {
      return isDeleting
        ? digits.slice(0, 2) + "/" + digits.slice(2, 4)
        : digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/";
    }
    return (
      digits.slice(0, 2) +
      "/" +
      digits.slice(2, 4) +
      "/" +
      digits.slice(4, 8)
    );
  }

  function initDateLock() {
    const form = document.getElementById("date-lock-form");
    const dateInput =
      document.getElementById("dateInput") ||
      document.getElementById("date-input");
    const inputWrap = document.getElementById("date-input-wrap");
    const errorMsg = document.getElementById("date-error-msg");
    const envelopeVisual = document.getElementById("envelope-visual");
    const envelopeWrapper = document.getElementById("date-envelope-wrapper");
    const storyBanner = document.getElementById("story-begins-banner");
    const stageTwo = document.getElementById("stage-date-lock");
    const mainWebsite = document.getElementById("main-website");

    if (!form || !dateInput) return;

    // Allow smooth Backspace when cursor is right after an auto-inserted "/"
    dateInput.addEventListener("keydown", function (e) {
      if (e.key === "Backspace") {
        const val = dateInput.value;
        const selStart = dateInput.selectionStart;
        const selEnd = dateInput.selectionEnd;
        if (selStart === selEnd && selStart === val.length && val.endsWith("/")) {
          e.preventDefault();
          // Remove the trailing slash AND the last digit so Backspace feels natural
          const digits = val.replace(/\D/g, "").slice(0, -1);
          dateInput.value = formatDateInputValue(digits, true);
        }
      }
    });

    dateInput.addEventListener("input", function (e) {
      if (errorMsg) errorMsg.classList.remove("visible");
      if (inputWrap) inputWrap.classList.remove("shake-error");

      const inputType = (e && e.inputType) || "";
      const isDeleting =
        inputType === "deleteContentBackward" ||
        inputType === "deleteContentForward";

      dateInput.value = formatDateInputValue(dateInput.value, isDeleting);
    });

    dateInput.addEventListener("paste", function (e) {
      e.preventDefault();
      const pasted =
        (e.clipboardData || window.clipboardData).getData("text") || "";
      dateInput.value = formatDateInputValue(pasted, false);
      if (errorMsg) errorMsg.classList.remove("visible");
      if (inputWrap) inputWrap.classList.remove("shake-error");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isDateUnlocked) return;

      // Ensure value is formatted before validating
      const formattedVal = formatDateInputValue(dateInput.value, false);
      if (dateInput.value.replace(/\D/g, "").length === 8) {
        dateInput.value = formattedVal;
      }

      const enteredDate = dateInput.value.trim();

      // Strict exact match for DD/MM/YYYY -> 10/10/2021
      if (enteredDate !== SECRET_DATE) {
        playSubtleClickSound();
        if (inputWrap) {
          inputWrap.classList.remove("shake-error");
          void inputWrap.offsetWidth;
          inputWrap.classList.add("shake-error");
        }
        if (errorMsg) {
          errorMsg.classList.add("visible");
        }
        return;
      }

      // CORRECT ANSWER: 10/10/2021
      isDateUnlocked = true;
      if (errorMsg) errorMsg.classList.remove("visible");

      // 1. Play soft romantic correct-date sound
      playCorrectDateSound();

      // 2. Open the love-letter envelope & raise the paper inside
      if (envelopeVisual) {
        envelopeVisual.classList.add("envelope-open");
      }

      // 3. Burst paper pieces, rose petals, hearts, glitter & shooting stars
      triggerScreenFlash();
      createCelebrationExplosion({ count: 65, letters: true });
      triggerShootingStarShower(7);

      // 4. Reveal "Our Story Begins Here ❤️" cinematic banner
      if (storyBanner) {
        storyBanner.classList.remove("hidden");
      }

      // 5. Transition into Main Website (showing HOME section only)
      setTimeout(function () {
        if (envelopeWrapper) {
          envelopeWrapper.style.opacity = "0";
          envelopeWrapper.style.transform = "translateY(-20px) scale(0.96)";
        }
      }, 900);

      setTimeout(function () {
        if (stageTwo) stageTwo.classList.add("hidden");
        if (mainWebsite) {
          mainWebsite.classList.remove("hidden");
          showSection("home", true);
        }
      }, 1750);
    });
  }

  /* ========================================================================
     10. SPA SECTION NAVIGATION — showSection(sectionId)
     Opens each major section independently (HOME, ALBUM, POEM, ABOUT, SURPRISE)
     with a 0.5s–0.8s starry transition.
     ======================================================================== */
  const SECTION_MAP = {
    home: "section-home",
    album: "section-album",
    poem: "section-poem",
    about: "section-about",
    surprise: "section-surprise"
  };

  function animatePoemLines() {
    const lines = document.querySelectorAll("#poem-lines-list .poem-line");
    lines.forEach(function (line) {
      line.classList.remove("line-revealed");
    });
    lines.forEach(function (line, idx) {
      setTimeout(function () {
        line.classList.add("line-revealed");
      }, 140 + idx * 130);
    });
  }

  function closeMobileMenu() {
    const drawer = document.getElementById("mobile-nav-drawer");
    const hamBtn = document.getElementById("hamburger-btn");
    if (drawer) drawer.classList.add("hidden");
    if (hamBtn) {
      hamBtn.classList.remove("open");
      hamBtn.setAttribute("aria-expanded", "false");
    }
  }

  function updateActiveNavButtons(targetKey) {
    const allNavButtons = document.querySelectorAll("[data-target]");
    allNavButtons.forEach(function (btn) {
      const isMatch = btn.getAttribute("data-target") === targetKey;
      btn.classList.toggle("active", isMatch);
    });
  }

  function showSection(sectionKey, isInitialOpen) {
    const targetId = SECTION_MAP[sectionKey];
    if (!targetId) return;

    closeMobileMenu();
    updateActiveNavButtons(sectionKey);

    if (!isInitialOpen) {
      playSubtleClickSound();
    }

    if (currentSection === sectionKey && !isInitialOpen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (isTransitioningSection && !isInitialOpen) return;
    isTransitioningSection = true;

    const currentEl = document.getElementById(SECTION_MAP[currentSection]);
    const nextEl = document.getElementById(targetId);

    // Subtle sparkle burst during page transition
    if (!isInitialOpen) {
      createCelebrationExplosion({
        count: 16,
        x: window.innerWidth / 2,
        y: 90
      });
    }

    if (isInitialOpen || !currentEl) {
      Object.keys(SECTION_MAP).forEach(function (key) {
        const el = document.getElementById(SECTION_MAP[key]);
        if (el) {
          if (key === sectionKey) {
            el.classList.remove("hidden-section", "section-fading-out", "section-entering");
            el.classList.add("active-section");
          } else {
            el.classList.remove("active-section", "section-fading-out", "section-entering");
            el.classList.add("hidden-section");
          }
        }
      });
      currentSection = sectionKey;
      isTransitioningSection = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (sectionKey === "poem") animatePoemLines();
      return;
    }

    // Step 1: Current section gently fades out (260ms)
    currentEl.classList.add("section-fading-out");

    setTimeout(function () {
      currentEl.classList.remove("active-section", "section-fading-out");
      currentEl.classList.add("hidden-section");

      // Step 2: Prepare new section in entering state
      if (nextEl) {
        nextEl.classList.remove("hidden-section");
        nextEl.classList.add("section-entering", "active-section");
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Force reflow then animate upward & sharp (360ms)
        void nextEl.offsetWidth;
        requestAnimationFrame(function () {
          nextEl.classList.remove("section-entering");
        });
      }

      currentSection = sectionKey;

      if (sectionKey === "poem") {
        animatePoemLines();
      }

      setTimeout(function () {
        isTransitioningSection = false;
      }, 380);
    }, 260);
  }

  // Expose showSection globally for inline onclick handlers
  window.showSection = showSection;

  /* ========================================================================
     11. POLAROID IMAGE RESILIENCE & 12-PHOTO LIGHTBOX VIEWER
     ======================================================================== */
  function buildRomanticPlaceholderSVG(index, captionText) {
    const gradients = [
      ["#2c1344", "#ff6b9d"],
      ["#1d1138", "#e0aaff"],
      ["#3a154b", "#ffd76a"],
      ["#1a1a40", "#ff8fb1"]
    ];
    const pair = gradients[index % gradients.length];
    const cleanCaption = (captionText || "Memory " + (index + 1)).replace(/[<>&"']/g, "");
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 660" width="600" height="660">' +
      "<defs>" +
      '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + pair[0] + '"/>' +
      '<stop offset="100%" stop-color="' + pair[1] + '"/>' +
      "</linearGradient>" +
      "</defs>" +
      '<rect width="600" height="660" fill="url(#g)"/>' +
      '<circle cx="490" cy="110" r="42" fill="#FFFDF5" opacity="0.85"/>' +
      '<circle cx="120" cy="140" r="3" fill="#FFF9F5" opacity="0.8"/>' +
      '<circle cx="240" cy="90" r="2.5" fill="#FFD76A" opacity="0.9"/>' +
      '<circle cx="360" cy="160" r="3.5" fill="#FFD6E7" opacity="0.8"/>' +
      '<circle cx="160" cy="480" r="3" fill="#FFF9F5" opacity="0.7"/>' +
      '<circle cx="460" cy="460" r="2.5" fill="#FFD76A" opacity="0.85"/>' +
      '<text x="300" y="290" text-anchor="middle" fill="#FFF9F5" font-family="Georgia, serif" font-size="68">💗</text>' +
      '<text x="300" y="365" text-anchor="middle" fill="#FFF9F5" font-family="Georgia, serif" font-weight="bold" font-size="28">' +
      cleanCaption +
      "</text>" +
      '<text x="300" y="415" text-anchor="middle" fill="#FFD6E7" font-family="sans-serif" font-size="16" opacity="0.9">' +
      "assets/photos/photo" + (index + 1) + ".jpg" +
      "</text>" +
      "</svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function initImageFallbacks() {
    const cards = document.querySelectorAll(".polaroid-card");
    cards.forEach(function (card, idx) {
      const img = card.querySelector("img");
      const captionEl = card.querySelector(".polaroid-caption");
      const captionText = captionEl ? captionEl.textContent : "Memory " + (idx + 1);
      if (!img) return;

      img.addEventListener("error", function handleImgErr() {
        const altPath = img.getAttribute("data-fallback");
        if (altPath && img.src.indexOf(altPath) === -1 && !img.dataset.triedAlt) {
          img.dataset.triedAlt = "true";
          img.src = altPath;
        } else {
          img.removeEventListener("error", handleImgErr);
          img.src = buildRomanticPlaceholderSVG(idx, captionText);
          ALBUM_PHOTOS[idx].resolvedSrc = img.src;
        }
      });

      img.addEventListener("load", function () {
        ALBUM_PHOTOS[idx].resolvedSrc = img.src;
      });
    });

    // Also handle About section portrait image fallback
    const aboutImg = document.querySelector(".about-portrait-box img");
    if (aboutImg) {
      aboutImg.addEventListener("error", function handleAboutErr() {
        aboutImg.removeEventListener("error", handleAboutErr);
        aboutImg.src = buildRomanticPlaceholderSVG(7, "My Wifeyy 👑");
      });
    }
  }

  function openLightbox(index) {
    currentLightboxIndex = (index + ALBUM_PHOTOS.length) % ALBUM_PHOTOS.length;
    const modal = document.getElementById("album-lightbox");
    if (!modal) return;

    updateLightboxSlide();
    modal.classList.remove("hidden");
  }

  function closeLightbox() {
    const modal = document.getElementById("album-lightbox");
    if (!modal) return;
    playSubtleClickSound();
    modal.classList.add("hidden");
  }

  function updateLightboxSlide() {
    const counterEl = document.getElementById("lightbox-counter");
    const imgEl = document.getElementById("lightbox-img");
    const captionEl = document.getElementById("lightbox-caption");
    const frameEl = document.getElementById("lightbox-polaroid-frame");

    // Sync caption from DOM in case the user edited index.html captions
    const domCards = document.querySelectorAll(".polaroid-card");
    const domCard = domCards[currentLightboxIndex];
    const domCaption = domCard ? domCard.querySelector(".polaroid-caption") : null;
    const domImg = domCard ? domCard.querySelector("img") : null;

    const item = ALBUM_PHOTOS[currentLightboxIndex];
    const displayCaption = domCaption ? domCaption.textContent : item.caption;
    const displaySrc = (domImg && domImg.src) || item.resolvedSrc || item.src;

    if (counterEl) {
      counterEl.textContent = "Photo " + (currentLightboxIndex + 1) + " of " + ALBUM_PHOTOS.length;
    }

    if (frameEl) {
      frameEl.style.opacity = "0.4";
      frameEl.style.transform = "scale(0.96)";
      setTimeout(function () {
        frameEl.style.opacity = "1";
        frameEl.style.transform = "scale(1)";
      }, 90);
    }

    if (imgEl) {
      imgEl.src = displaySrc;
      imgEl.alt = displayCaption;
      imgEl.onerror = function () {
        imgEl.onerror = null;
        imgEl.src = buildRomanticPlaceholderSVG(currentLightboxIndex, displayCaption);
      };
    }

    if (captionEl) {
      captionEl.textContent = displayCaption;
    }
  }

  function nextLightboxPhoto() {
    playSubtleClickSound();
    currentLightboxIndex = (currentLightboxIndex + 1) % ALBUM_PHOTOS.length;
    updateLightboxSlide();
  }

  function prevLightboxPhoto() {
    playSubtleClickSound();
    currentLightboxIndex = (currentLightboxIndex - 1 + ALBUM_PHOTOS.length) % ALBUM_PHOTOS.length;
    updateLightboxSlide();
  }

  function initAlbumAndLightbox() {
    const cards = document.querySelectorAll(".polaroid-card");
    cards.forEach(function (card, idx) {
      card.addEventListener("click", function (ev) {
        playSubtleClickSound();
        spawnClickHeartBurst(ev.clientX || window.innerWidth / 2, ev.clientY || window.innerHeight / 2, "💖");
        openLightbox(idx);
      });

      card.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          playSubtleClickSound();
          openLightbox(idx);
        }
      });
    });

    const closeBtn = document.getElementById("lightbox-close-btn");
    const backdrop = document.getElementById("lightbox-backdrop");
    const prevBtn = document.getElementById("lightbox-prev-btn");
    const nextBtn = document.getElementById("lightbox-next-btn");

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (backdrop) backdrop.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", prevLightboxPhoto);
    if (nextBtn) nextBtn.addEventListener("click", nextLightboxPhoto);

    document.addEventListener("keydown", function (ev) {
      const modal = document.getElementById("album-lightbox");
      if (!modal || modal.classList.contains("hidden")) return;

      if (ev.key === "Escape") {
        closeLightbox();
      } else if (ev.key === "ArrowRight") {
        nextLightboxPhoto();
      } else if (ev.key === "ArrowLeft") {
        prevLightboxPhoto();
      }
    });
  }

  /* ========================================================================
     12. FINAL SURPRISE GIFT BOX & FULL-LENGTH VIDEO + MUSIC SYNC
     ======================================================================== */
  function triggerGiftBoxOpen() {
    if (isGiftOpened) return;
    isGiftOpened = true;

    playCorrectDateSound();

    const giftBtn = document.getElementById("unwrap-gift-btn");
    const giftStage = document.getElementById("gift-box-stage");
    const cinemaStage = document.getElementById("cinema-video-stage");

    if (giftBtn) {
      giftBtn.classList.add("box-opening");
    }

    triggerScreenFlash();
    createCelebrationExplosion({ count: 75, balloons: true });
    triggerShootingStarShower(6);

    setTimeout(function () {
      if (giftStage) giftStage.classList.add("hidden");
      if (cinemaStage) {
        cinemaStage.classList.remove("hidden");
      }
    }, 780);
  }

  window.triggerGiftBoxOpen = triggerGiftBoxOpen;

  function initSurpriseVideoAndMusicSync() {
    const giftBtn = document.getElementById("unwrap-gift-btn");
    if (giftBtn) {
      giftBtn.addEventListener("click", triggerGiftBoxOpen);
    }

    const video = document.getElementById("surprise-video");
    const syncStatus = document.getElementById("video-music-sync-status");
    const localVideoInput = document.getElementById("local-video-input");

    if (!video) return;

    // Allow user to preview any MP4 file from their computer immediately
    if (localVideoInput) {
      localVideoInput.addEventListener("change", function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const blobUrl = URL.createObjectURL(file);
        video.src = blobUrl;
        video.load();
        if (syncStatus) {
          syncStatus.textContent = "🎬 Loaded \"" + file.name + "\" — Press Play to watch full length!";
        }
      });
    }

    // CRITICAL REQUIREMENT:
    // When video starts playing -> remember if background music was playing, then pause background music immediately.
    video.addEventListener("play", function () {
      if (!video.dataset.currentlyWatching) {
        wasMusicPlayingBeforeVideo = isMusicPlaying && !userManuallyMutedMusic;
        video.dataset.currentlyWatching = "true";
      }
      if (isMusicPlaying) {
        pauseBackgroundMusic(false);
      }
      if (syncStatus) {
        syncStatus.textContent = "🎬 Movie playing — Background birthday music is paused so you can hear every word.";
      }
    });

    // If user pauses the video before it finishes -> do NOT automatically resume background music.
    video.addEventListener("pause", function () {
      if (!video.ended) {
        if (syncStatus) {
          syncStatus.textContent = "⏸️ Movie paused — Background music remains paused until the movie finishes.";
        }
      }
    });

    // When video finishes -> resume background music ONLY if it was playing before the video started.
    video.addEventListener("ended", function () {
      delete video.dataset.currentlyWatching;
      if (wasMusicPlayingBeforeVideo && !userManuallyMutedMusic) {
        startBackgroundMusic();
        if (syncStatus) {
          syncStatus.textContent = "🎵 Our movie finished — Background birthday music has gently resumed ❤️";
        }
      } else {
        if (syncStatus) {
          syncStatus.textContent = "❤️ Hope you loved our little movie, my Wifeyy!";
        }
      }
    });
  }

  /* ========================================================================
     13. MOBILE HAMBURGER MENU & GLOBAL INTERACTIONS
     ======================================================================== */
  function initNavigationAndButtons() {
    const hamBtn = document.getElementById("hamburger-btn");
    const mobileDrawer = document.getElementById("mobile-nav-drawer");
    const floatMusicBtn = document.getElementById("floating-music-btn");
    const navMusicBtn = document.getElementById("nav-music-btn");

    if (hamBtn && mobileDrawer) {
      hamBtn.addEventListener("click", function () {
        playSubtleClickSound();
        const isHidden = mobileDrawer.classList.contains("hidden");
        mobileDrawer.classList.toggle("hidden", !isHidden);
        hamBtn.classList.toggle("open", isHidden);
        hamBtn.setAttribute("aria-expanded", isHidden ? "true" : "false");
      });
    }

    if (floatMusicBtn) {
      floatMusicBtn.addEventListener("click", toggleBackgroundMusic);
    }

    if (navMusicBtn) {
      navMusicBtn.addEventListener("click", toggleBackgroundMusic);
    }

    // Subtle heart/sparkle ripple when clicking romantic buttons or nav items
    document.addEventListener("click", function (ev) {
      const btn = ev.target.closest(".romantic-btn, .nav-item, .chapter-portal-card");
      if (btn && ev.clientX && ev.clientY) {
        spawnClickHeartBurst(ev.clientX, ev.clientY, "✨");
      }
    });
  }

  /* ========================================================================
     14. INITIALIZE EVERYTHING ON DOM READY
     ======================================================================== */
  document.addEventListener("DOMContentLoaded", function () {
    initStarrySkyCanvas();
    initHeartRain();
    initImageFallbacks();
    initAgeLock();
    initDateLock();
    initAlbumAndLightbox();
    initSurpriseVideoAndMusicSync();
    initNavigationAndButtons();
  });
})();
