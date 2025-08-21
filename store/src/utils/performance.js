// Utilidades para optimizar el rendimiento de la aplicación

// Debounce function para optimizar búsquedas
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function para optimizar eventos de scroll
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading para imágenes
export const lazyLoadImage = (imgElement, src) => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    imageObserver.observe(imgElement);
  } else {
    // Fallback para navegadores que no soportan IntersectionObserver
    imgElement.src = src;
  }
};

// Memoización simple para funciones costosas
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

// Optimización de listas largas con virtualización básica
export const createVirtualizedList = (items, itemHeight, containerHeight) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  
  return {
    getVisibleRange: (scrollTop) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, items.length);
      return { startIndex, endIndex };
    },
    getVisibleItems: (scrollTop) => {
      const { startIndex, endIndex } = this.getVisibleRange(scrollTop);
      return items.slice(startIndex, endIndex);
    },
    totalHeight,
    itemHeight
  };
};

// Preload de recursos críticos
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Optimización de re-renders con React.memo
export const shouldComponentUpdate = (prevProps, nextProps, keys = []) => {
  if (keys.length === 0) {
    return JSON.stringify(prevProps) !== JSON.stringify(nextProps);
  }
  
  return keys.some(key => prevProps[key] !== nextProps[key]);
};

// Cache de datos en localStorage con expiración
export const cacheData = (key, data, expirationHours = 24) => {
  const item = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + (expirationHours * 60 * 60 * 1000)
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getCachedData = (key) => {
  try {
    const item = JSON.parse(localStorage.getItem(key));
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    return null;
  }
};

// Optimización de eventos con delegación
export const delegateEvent = (container, selector, eventType, handler) => {
  container.addEventListener(eventType, (event) => {
    const target = event.target.closest(selector);
    if (target && container.contains(target)) {
      handler.call(target, event);
    }
  });
};

// Medición de rendimiento
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name} took ${end - start} milliseconds`);
  }
  
  return result;
};

// Optimización de imágenes
export const optimizeImage = (src, width, quality = 0.8) => {
  // En una aplicación real, aquí podrías usar un servicio de CDN
  // como Cloudinary, ImageKit, etc.
  return `${src}?w=${width}&q=${quality}`;
};

// Lazy loading de componentes
export const lazyLoadComponent = (importFunc) => {
  // Esta función requiere React para funcionar
  // Se debe usar en componentes que tengan acceso a React
  return (props) => {
    // Implementación básica sin React.lazy
    return null;
  };
};