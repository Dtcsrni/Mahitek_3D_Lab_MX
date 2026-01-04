/**
 * Timelapse video playback controls.
 */

const PLAY_ICON = '>';
const PAUSE_ICON = '||';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData =
  typeof navigator !== 'undefined' && navigator.connection && navigator.connection.saveData;

const createSource = (video, src, type) => {
  if (!src) return;
  const source = document.createElement('source');
  source.src = src;
  source.type = type;
  video.appendChild(source);
};

const setButtonState = (button, isPlaying) => {
  if (!button) return;
  button.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
  button.setAttribute('aria-label', isPlaying ? 'Pausar video' : 'Reproducir video');
  button.textContent = isPlaying ? PAUSE_ICON : PLAY_ICON;
};

export function initTimelapseVideo() {
  const button = document.querySelector('[data-video-toggle]');
  if (!button) return;
  const container = button.closest('.process-timelapse-media');
  if (!container) return;
  const video = container.querySelector('video');
  if (!video) return;

  const loadSources = () => {
    if (video.dataset.loaded === 'true') return;
    const webm = video.dataset.srcWebm;
    const mp4 = video.dataset.srcMp4;

    createSource(video, webm, 'video/webm');
    createSource(video, mp4, 'video/mp4');

    video.dataset.loaded = 'true';
    video.load();
    if (!prefersReducedMotion && !saveData) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          /* autoplay might be blocked */
        });
      }
    }
  };

  const updateState = () => {
    setButtonState(button, !video.paused && !video.ended);
  };

  button.addEventListener('click', () => {
    loadSources();
    if (video.paused || video.ended) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          /* autoplay might be blocked */
        });
      }
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', updateState);
  video.addEventListener('pause', updateState);
  video.addEventListener('ended', updateState);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!saveData) {
              loadSources();
            }
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(video);
  } else if (!saveData) {
    loadSources();
  }

  if (prefersReducedMotion || saveData) {
    video.pause();
  }

  updateState();
}
