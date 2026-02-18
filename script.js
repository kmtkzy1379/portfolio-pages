/**
 * Portfolio Interactive Script
 * ─────────────────────────────────────────────────────────
 * - Eve 殴りインタラクション（DamageEve から統合）
 * - ヒットカウンター（100回で Easter Egg 発動）
 * - ナビゲーションバッジ + スクロールスパイ
 * - プロフィール Eve メッセージ切り替え
 * - ボタン SE（wallet_open / wallet_close）
 */
(function () {
  'use strict';

  /* ==========================================================
     DOM ELEMENTS
     ========================================================== */
  const hero          = document.getElementById('hero');
  const stage         = document.getElementById('stage');
  const video         = document.getElementById('hitVideo');
  const flashEl       = document.getElementById('heroFlash');
  const hitCountEl    = document.getElementById('hitCount');
  const counterFill   = document.getElementById('counterFill');
  const profileCard   = document.getElementById('profileCard');
  const profileNormal = document.getElementById('profileNormal');
  const profileEve    = document.getElementById('profileEve');
  const glitchOverlay = document.getElementById('glitchOverlay');

  /* ==========================================================
     AUDIO ELEMENTS
     ========================================================== */
  const hitNoises = [
    document.getElementById('hitNoise1'),
    document.getElementById('hitNoise2'),
    document.getElementById('hitNoise3'),
  ];
  const hitVoices = [
    document.getElementById('hitVoice1'),
    document.getElementById('hitVoice2'),
    document.getElementById('hitVoice3'),
  ];
  const micNoise   = document.getElementById('micNoise');
  const walletOpen = document.getElementById('walletOpen');

  /* ==========================================================
     CONSTANTS
     ========================================================== */
  const NOISE_VOLUME  = 0.2;
  const VOICE_VOLUME  = 0.8;
  const MIC_VOLUME    = 0.6;
  const SE_VOLUME     = 0.6;
  const HIT_GOAL      = 100;

  /* ==========================================================
     STATE
     ========================================================== */
  let hitCount       = 0;
  let eveMode        = false;
  let eveShown       = false;  // Eve メッセージが表示されたか
  let eveFullySeen   = false;  // ユーザーがしっかり読める状態になったか
  let eveDismissed   = false;  // Eve メッセージが永久に消えたか
  let isPlaying      = false;
  let currentNoise   = null;
  let currentVoice   = null;

  /* ==========================================================
     RANDOM SELECTION FUNCTIONS
     ========================================================== */

  /** 3種の効果音からランダムに1つ返す */
  function getRandomHitNoise() {
    return hitNoises[Math.floor(Math.random() * hitNoises.length)];
  }

  /** 3種のボイスからランダムに1つ返す */
  function getRandomHitVoice() {
    return hitVoices[Math.floor(Math.random() * hitVoices.length)];
  }

  /* ==========================================================
     AUDIO HELPERS
     ========================================================== */
  function stopAudio(audio) {
    if (audio) { audio.pause(); audio.currentTime = 0; }
  }

  function stopAllAudio() {
    stopAudio(currentNoise);
    stopAudio(currentVoice);
    currentNoise = null;
    currentVoice = null;
  }

  function playAudio(audio, volume) {
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(function () {});
  }

  /* ==========================================================
     HIT VISUAL EFFECTS
     ========================================================== */
  function triggerHitEffect() {
    hero.classList.remove('hero--shaking');
    void hero.offsetWidth;
    hero.classList.add('hero--shaking');

    flashEl.classList.add('hero__flash--active');
    setTimeout(function () {
      flashEl.classList.remove('hero__flash--active');
    }, 80);

    hero.addEventListener('animationend', function onEnd() {
      hero.classList.remove('hero--shaking');
      hero.removeEventListener('animationend', onEnd);
    });
  }

  /* ==========================================================
     HIT COUNTER
     ========================================================== */
  function updateCounter() {
    hitCountEl.textContent = hitCount;
    var pct = Math.min((hitCount / HIT_GOAL) * 100, 100);
    counterFill.style.width = pct + '%';

    if (hitCount >= HIT_GOAL && !eveMode) {
      trigger100Hit();
    }
  }

  /* ==========================================================
     100-HIT EASTER EGG
     ========================================================== */
  function trigger100Hit() {
    eveMode = true;
    counterFill.classList.add('counter__fill--complete');

    // Play mic noise
    micNoise.currentTime = 0;
    micNoise.volume = MIC_VOLUME;
    micNoise.play().catch(function () {});

    // Glitch effect
    glitchOverlay.classList.remove('active');
    void glitchOverlay.offsetWidth;
    glitchOverlay.classList.add('active');

    setTimeout(function () {
      glitchOverlay.classList.remove('active');
    }, 2000);

    // Start profile observer
    startProfileObserver();
  }

  /* ==========================================================
     MAIN HIT HANDLER
     ========================================================== */
  function handleHit() {
    // Stop if already playing
    if (isPlaying) {
      video.pause();
      stopAllAudio();
    }

    // Play video
    video.currentTime = 0;
    video.classList.add('active');
    video.play().catch(function () {});
    isPlaying = true;

    // Random audio
    currentNoise = getRandomHitNoise();
    currentVoice = getRandomHitVoice();
    playAudio(currentNoise, NOISE_VOLUME);
    playAudio(currentVoice, VOICE_VOLUME);

    // Visual effect
    triggerHitEffect();

    // Increment counter
    hitCount++;
    updateCounter();
  }

  /* ==========================================================
     VIDEO ENDED → Return to idle
     ========================================================== */
  video.addEventListener('ended', function () {
    video.classList.remove('active');
    isPlaying = false;
    currentNoise = null;
    currentVoice = null;
  });

  /* ==========================================================
     HERO EVENT LISTENERS — stage（イブ画像エリア）のみに判定
     ========================================================== */
  var touchHandled = false;

  stage.addEventListener('touchstart', function (e) {
    e.preventDefault();
    touchHandled = true;
    handleHit();
    setTimeout(function () { touchHandled = false; }, 400);
  }, { passive: false });

  stage.addEventListener('click', function () {
    if (touchHandled) return;
    handleHit();
  });

  stage.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    if (touchHandled) return;
    handleHit();
  });

  // hero 全体の右クリックメニューは抑制（UX のため）
  hero.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  /* ==========================================================
     PROFILE — Eve Message Toggle (IntersectionObserver)
     ========================================================== */
  function startProfileObserver() {
    var profileSection = document.getElementById('profile');
    if (!profileSection) return;

    // 3段階のしきい値で監視:
    //   0.15 → 表示開始（画面に15%入った）
    //   0.5  → しっかり見えた（50%以上見えた = 読めた判定）
    //   0    → 完全に画面外に出た
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!eveMode || eveDismissed) return;

        var ratio = entry.intersectionRatio;

        // Step 1: 画面に入ってきた → Eve メッセージを表示
        if (ratio >= 0.15 && !eveShown) {
          eveShown = true;
          profileNormal.classList.add('hidden');
          profileEve.classList.add('visible');
        }

        // Step 2: 十分に見えた → 「読んだ」とみなす
        if (ratio >= 0.5 && eveShown) {
          eveFullySeen = true;
        }

        // Step 3: 完全に画面外 & 既に読んだ → 永久に元に戻す
        if (ratio === 0 && eveFullySeen) {
          eveDismissed = true;
          profileNormal.classList.remove('hidden');
          profileEve.classList.remove('visible');
          observer.disconnect();
        }
      });
    }, { threshold: [0, 0.15, 0.5] });

    observer.observe(profileSection);
  }

  /* ==========================================================
     NAVIGATION — Smooth Scroll + Badge SE
     ========================================================== */
  var badges = document.querySelectorAll('.badge[data-target]');

  badges.forEach(function (badge) {
    badge.addEventListener('click', function (e) {
      e.preventDefault();
      playButtonSE();
      var targetId = badge.getAttribute('data-target');
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ==========================================================
     TABLE OF CONTENTS — Smooth Scroll + SE
     ========================================================== */
  document.querySelectorAll('.toc-item').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      playButtonSE();
      var targetId = item.getAttribute('href').replace('#', '');
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ==========================================================
     SCROLL SPY — Highlight active badge
     ========================================================== */
  function initScrollSpy() {
    var sections = [];
    badges.forEach(function (badge) {
      var id = badge.getAttribute('data-target');
      var el = document.getElementById(id);
      if (el) sections.push({ id: id, el: el, badge: badge });
    });

    if (sections.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.el === entry.target; });
        if (!match) return;

        if (entry.isIntersecting) {
          badges.forEach(function (b) { b.classList.remove('active'); });
          match.badge.classList.add('active');
        }
      });
    }, { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(function (s) { observer.observe(s.el); });
  }

  initScrollSpy();

  /* ==========================================================
     BUTTON SE — wallet_open on click
     ========================================================== */
  function playButtonSE() {
    if (!walletOpen) return;
    walletOpen.currentTime = 0;
    walletOpen.volume = SE_VOLUME;
    walletOpen.play().catch(function () {});
  }

  // Attach SE to all external link buttons
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('mousedown', function () {
      playButtonSE();
    });
  });

  /* ==========================================================
     ACCORDION — Toggle open/close
     ========================================================== */
  document.querySelectorAll('.accordion__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      playButtonSE();
      var accordion = btn.closest('.accordion');
      var isOpen = accordion.classList.contains('accordion--open');
      accordion.classList.toggle('accordion--open');
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ==========================================================
     TOC SORT — Ascending / Descending toggle
     ========================================================== */
  var tocSortBtn = document.getElementById('tocSortBtn');
  if (tocSortBtn) {
    var sortDesc = false;

    tocSortBtn.addEventListener('click', function () {
      playButtonSE();
      sortDesc = !sortDesc;
      tocSortBtn.classList.toggle('desc', sortDesc);

      var tocList = document.querySelector('.toc-list');
      var tocItems = Array.from(tocList.querySelectorAll('.toc-item'));
      tocItems.sort(function (a, b) {
        var aNum = parseInt(a.getAttribute('data-order'), 10);
        var bNum = parseInt(b.getAttribute('data-order'), 10);
        return sortDesc ? bNum - aNum : aNum - bNum;
      });
      tocItems.forEach(function (item) {
        tocList.appendChild(item);
      });

      var heroSection = document.getElementById('hero');
      var sections = Array.from(document.querySelectorAll('section[data-order]'));
      sections.sort(function (a, b) {
        var aNum = parseInt(a.getAttribute('data-order'), 10);
        var bNum = parseInt(b.getAttribute('data-order'), 10);
        return sortDesc ? bNum - aNum : aNum - bNum;
      });
      sections.forEach(function (section) {
        heroSection.parentNode.insertBefore(section, heroSection);
      });
    });
  }

  /* ==========================================================
     PRELOAD
     ========================================================== */
  hitNoises.forEach(function (a) { a.load(); });
  hitVoices.forEach(function (a) { a.load(); });
  video.load();
  if (micNoise) micNoise.load();

})();
