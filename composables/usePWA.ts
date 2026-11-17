export const usePWA = () => {
  const registerSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('[PWA] Service Worker registered:', registration.scope);
        return registration;
      } catch (err) {
        console.error('[PWA] Service Worker registration failed:', err);
      }
    }
  };

  const installPrompt = useState<Event | null>('pwa-install-prompt', () => null);
  const isInstalled = useState('pwa-is-installed', () => false);

  const listenInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      installPrompt.value = e as unknown as Event;
    });
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true;
      installPrompt.value = null;
    });
  };

  const installApp = async () => {
    if (!installPrompt.value) return;
    const promptEvent = installPrompt.value as unknown as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
    };
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    installPrompt.value = null;
    return choice;
  };

  if (process.client) {
    registerSW();
    listenInstallPrompt();
  }

  return {
    installPrompt,
    isInstalled,
    installApp,
  };
};
