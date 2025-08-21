// PWA Utilities
export class PWAUtils {
  static isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  static isInstallable() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  static async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.showUpdateNotification();
              }
            });
          }
        });
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  static showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #2196f3;
        color: white;
        padding: 1rem;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        <span>Nueva versión disponible</span>
        <button onclick="window.location.reload()" style="
          background: white;
          color: #2196f3;
          border: none;
          padding: 0.5rem 1rem;
          margin-left: 1rem;
          border-radius: 4px;
          cursor: pointer;
        ">
          Actualizar
        </button>
        <button onclick="this.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 0.5rem 1rem;
          margin-left: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
        ">
          Más tarde
        </button>
      </div>
    `;
    document.body.appendChild(updateBanner);
  }

  static async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  static async subscribeToPushNotifications(registration) {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        )
      });
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscription)
      });
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  static urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  static showInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install banner
      this.showInstallBanner(deferredPrompt);
    });
  }

  static showInstallBanner(deferredPrompt) {
    const installBanner = document.createElement('div');
    installBanner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 10000;
        border: 1px solid #e0e0e0;
      ">
        <div style="display: flex; align-items: center;">
          <img src="/logo192.png" width="40" height="40" style="margin-right: 1rem;">
          <div>
            <div style="font-weight: bold; color: #333;">Instalar TechStore Cuba</div>
            <div style="color: #666; font-size: 0.9rem;">Acceso rápido desde tu pantalla de inicio</div>
          </div>
        </div>
        <div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: transparent;
            border: 1px solid #ccc;
            padding: 0.5rem 1rem;
            margin-right: 0.5rem;
            border-radius: 4px;
            cursor: pointer;
          ">
            Ahora no
          </button>
          <button id="install-button" style="
            background: #2196f3;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
          ">
            Instalar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(installBanner);
    
    const installButton = installBanner.querySelector('#install-button');
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
      }
      installBanner.remove();
    });
  }

  static enableOfflineSupport() {
    // Store important data for offline use
    window.addEventListener('online', () => {
      console.log('App is online');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      this.showOfflineNotification();
    });
  }

  static showOfflineNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff9800;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        📡 Modo offline activado
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  static async syncOfflineData() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      
      // Sync cart
      await registration.sync.register('background-sync-cart');
      
      // Sync orders
      await registration.sync.register('background-sync-orders');
    }
  }

  static async addToHomeScreen() {
    // For iOS Safari
    if (this.isIOS() && !this.isStandalone()) {
      this.showIOSInstallInstructions();
    }
  }

  static isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  static showIOSInstallInstructions() {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 300px;
          text-align: center;
        ">
          <h3 style="margin-bottom: 1rem;">Instalar en iOS</h3>
          <p style="margin-bottom: 1rem;">
            1. Toca el botón compartir 📤<br>
            2. Selecciona "Añadir a pantalla de inicio"<br>
            3. Toca "Añadir"
          </p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #2196f3;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
          ">
            Entendido
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
}

// Initialize PWA features
export const initializePWA = async () => {
  // Register service worker
  await PWAUtils.registerServiceWorker();
  
  // Show install prompt
  PWAUtils.showInstallPrompt();
  
  // Enable offline support
  PWAUtils.enableOfflineSupport();
  
  // Request notification permission for authenticated users
  if (localStorage.getItem('token')) {
    await PWAUtils.requestNotificationPermission();
  }
};