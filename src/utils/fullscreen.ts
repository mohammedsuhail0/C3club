// Cross-browser Fullscreen utility strictly for mobile view
let isRequesting = false;
let hasRequested = false;

if (typeof document !== 'undefined') {
  const resetIfExited = () => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      mozFullScreenElement?: Element;
      msFullscreenElement?: Element;
    };
    const isFs = Boolean(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
    if (!isFs) {
      hasRequested = false;
    }
  };

  document.addEventListener('fullscreenchange', resetIfExited, { passive: true });
  document.addEventListener('webkitfullscreenchange', resetIfExited, { passive: true });
}

export function requestMobileFullscreen() {
  if (typeof document === 'undefined') return;
  if (isRequesting || hasRequested) return;

  const doc = document as Document & {
    webkitFullscreenElement?: Element;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
  };

  const isAlreadyFullscreen = Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );

  if (isAlreadyFullscreen) {
    hasRequested = true;
    return;
  }

  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };

  isRequesting = true;
  hasRequested = true;

  try {
    if (el.requestFullscreen) {
      el.requestFullscreen()
        .catch(() => {
          hasRequested = false;
        })
        .finally(() => {
          isRequesting = false;
        });
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
      isRequesting = false;
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
      isRequesting = false;
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
      isRequesting = false;
    } else {
      isRequesting = false;
      hasRequested = false;
    }
  } catch {
    isRequesting = false;
    hasRequested = false;
  }
}

export function exitFullscreenIfActive() {
  if (typeof document === 'undefined') return;

  const doc = document as Document & {
    webkitFullscreenElement?: Element;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  };

  const isFullscreen = Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );

  if (!isFullscreen) return;

  try {
    if (doc.exitFullscreen) {
      doc.exitFullscreen().catch(() => {});
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  } catch {}
}
