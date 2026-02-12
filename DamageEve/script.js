/**
 * Interactive Hit Portfolio
 * -------------------------------------------------
 * タップ / 右クリックで殴られ動画 + ランダム効果音 + ランダムボイスを再生
 * 動画終了後はアイドル画像に戻る
 * 再生中に再度操作すると、即座にリスタート
 */

(function () {
  'use strict';

  // ===== DOM要素 =====
  const stage = document.getElementById('stage');
  const video = document.getElementById('hitVideo');

  // ===== 音声アセット配列 =====
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

  // ===== 音量設定（0.0 〜 1.0） =====
  const NOISE_VOLUME = 0.2;  // 効果音（デフォルト1.0 → 少し下げる）
  const VOICE_VOLUME = 0.8;  // ボイス（デフォルト1.0 → 少し上げ気味）

  // ===== 現在再生中の音声を追跡 =====
  let currentNoise = null;
  let currentVoice = null;
  let isPlaying = false;

  // ===== ランダム選択関数 =====

  /**
   * 3種の効果音からランダムに1つ選んで返す
   * @returns {HTMLAudioElement}
   */
  function getRandomHitNoise() {
    const index = Math.floor(Math.random() * hitNoises.length);
    return hitNoises[index];
  }

  /**
   * 3種のボイスからランダムに1つ選んで返す
   * @returns {HTMLAudioElement}
   */
  function getRandomHitVoice() {
    const index = Math.floor(Math.random() * hitVoices.length);
    return hitVoices[index];
  }

  // ===== 音声停止ヘルパー =====

  /**
   * 指定のAudio要素を停止してリセット
   * @param {HTMLAudioElement|null} audio
   */
  function stopAudio(audio) {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * 再生中の全音声を停止
   */
  function stopAllAudio() {
    stopAudio(currentNoise);
    stopAudio(currentVoice);
    currentNoise = null;
    currentVoice = null;
  }

  // ===== 視覚エフェクト =====

  /**
   * 画面シェイク + フラッシュエフェクトを発火
   */
  function triggerHitEffect() {
    // 既存のアニメーションをリセット（連打対応）
    stage.classList.remove('stage--shaking', 'stage--flash');

    // 強制リフロー（クラス除去→即再付与のため）
    void stage.offsetWidth;

    // シェイク開始
    stage.classList.add('stage--shaking');

    // フラッシュ（白い閃光）
    stage.classList.add('stage--flash');
    setTimeout(function () {
      stage.classList.remove('stage--flash');
    }, 80);

    // シェイク終了後にクラス除去
    stage.addEventListener('animationend', function onEnd() {
      stage.classList.remove('stage--shaking');
      stage.removeEventListener('animationend', onEnd);
    });
  }

  // ===== メイン処理：殴打 =====

  /**
   * 殴打処理：動画再生 + ランダム効果音 + ランダムボイス
   */
  function handleHit() {
    // 1. 再生中なら停止してリセット
    if (isPlaying) {
      video.pause();
      stopAllAudio();
    }

    // 2. 動画を先頭に戻して再生
    video.currentTime = 0;
    video.classList.add('active');

    var playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        // 自動再生がブロックされた場合のフォールバック
        // ユーザー操作トリガーなので通常は発生しない
      });
    }

    isPlaying = true;

    // 3. ランダムで効果音とボイスを選択・再生
    currentNoise = getRandomHitNoise();
    currentVoice = getRandomHitVoice();

    currentNoise.currentTime = 0;
    currentVoice.currentTime = 0;
    currentNoise.volume = NOISE_VOLUME;
    currentVoice.volume = VOICE_VOLUME;

    currentNoise.play().catch(function () {});
    currentVoice.play().catch(function () {});

    // 4. 視覚エフェクト
    triggerHitEffect();
  }

  // ===== 動画終了時：アイドル画像に戻る =====

  video.addEventListener('ended', function () {
    video.classList.remove('active');
    isPlaying = false;
    currentNoise = null;
    currentVoice = null;
  });

  // ===== イベントリスナー =====

  // タッチ操作用フラグ（タッチ後のclickイベントの二重発火を防止）
  let touchHandled = false;

  // タップ（モバイル）-- touchstartで反応して低遅延を実現
  stage.addEventListener('touchstart', function (e) {
    e.preventDefault();
    touchHandled = true;
    handleHit();

    // 短時間後にフラグリセット
    setTimeout(function () {
      touchHandled = false;
    }, 400);
  }, { passive: false });

  // クリック（デスクトップ左クリック）
  stage.addEventListener('click', function (e) {
    // タッチ操作後のゴーストクリックを無視
    if (touchHandled) return;
    handleHit();
  });

  // 右クリック
  stage.addEventListener('contextmenu', function (e) {
    e.preventDefault(); // デフォルトメニュー抑制
    // タッチ操作後のゴーストイベントを無視
    if (touchHandled) return;
    handleHit();
  });

  // ===== プリロード確認 =====

  // 全音声の事前読み込みを促す
  hitNoises.forEach(function (audio) { audio.load(); });
  hitVoices.forEach(function (audio) { audio.load(); });

  // 動画のプリロード
  video.load();

})();
