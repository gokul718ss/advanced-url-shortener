import { useState, useEffect, useCallback, useRef } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';

/* ====================================
   THEME & PERSONALIZATION HOOKS
   ==================================== */

/**
 * useTheme - Manage dark/light mode and accent colors
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accentColor') || 'primary';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.body.className = `${newTheme}-mode`;
      return newTheme;
    });
  }, []);

  const updateAccentColor = useCallback((color) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
  }, []);

  useEffect(() => {
    document.body.className = `${theme}-mode`;
  }, [theme]);

  return { theme, toggleTheme, accentColor, updateAccentColor };
};

/* ====================================
   LOCAL STORAGE HOOKS
   ==================================== */

/**
 * useLocalStorage - Easily manage localStorage
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

/* ====================================
   ANIMATION HOOKS
   ==================================== */

/**
 * useAnimationOnScroll - Trigger animations when element enters viewport
 */
export const useAnimationOnScroll = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (options.once) {
          observer.unobserve(entry.target);
        }
      } else if (!options.once) {
        setIsVisible(false);
      }
    }, {
      threshold: options.threshold || 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isVisible];
};

/**
 * useSmoothNumber - Animate number changes smoothly
 */
export const useSmoothNumber = (value, duration = 1000) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let animationFrameId;
    let startTime;
    const startValue = displayValue;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setDisplayValue(Math.floor(startValue + (value - startValue) * progress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return displayValue;
};

/**
 * useParallax - Create parallax scroll effect
 */
export const useParallax = (speed = 0.5) => {
  const ref = useRef(null);
  const scrollY = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = ref.current;
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const distance = window.scrollY - elementTop;
        scrollY.set(distance * speed);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY, speed]);

  return [ref, scrollY];
};

/* ====================================
   KEYBOARD SHORTCUTS HOOK
   ==================================== */

/**
 * useKeyboardShortcuts - Handle keyboard shortcuts globally
 */
export const useKeyboardShortcuts = (shortcuts = {}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = `${e.ctrlKey || e.metaKey ? 'ctrl+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`;
      
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

/* ====================================
   DEBOUNCE & THROTTLE HOOKS
   ==================================== */

/**
 * useDebounce - Debounce a value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useThrottle - Throttle a function call
 */
export const useThrottle = (callback, delay = 500) => {
  const lastCallRef = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastCallRef.current >= delay) {
      lastCallRef.current = Date.now();
      callback(...args);
    }
  }, [callback, delay]);
};

/* ====================================
   WINDOW SIZE & RESPONSIVE HOOKS
   ==================================== */

/**
 * useWindowSize - Get window size
 */
export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

/**
 * useDeviceType - Detect device type (mobile, tablet, desktop)
 */
export const useDeviceType = () => {
  const { width } = useWindowSize();

  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/* ====================================
   PERFORMANCE MONITORING HOOKS
   ==================================== */

/**
 * usePerformanceMetrics - Monitor performance metrics
 */
export const usePerformanceMetrics = (componentName) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      console.log(`${componentName} - FCP:`, navigationTiming?.domContentLoadedEventEnd);
    }
  }, [componentName]);
};

/**
 * useRenderCount - Count component re-renders (for debugging)
 */
export const useRenderCount = (componentName) => {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current++;
    console.log(`${componentName} rendered ${renderCountRef.current} times`);
  });

  return renderCountRef.current;
};

/* ====================================
   FETCH & API HOOKS
   ==================================== */

/**
 * useFetch - Fetch data with loading and error states
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options]);

  return { data, loading, error };
};

/**
 * usePaginatedFetch - Fetch paginated data
 */
export const usePaginatedFetch = (url, pageSize = 10) => {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${url}?page=${page}&limit=${pageSize}`);
        const data = await response.json();
        
        setAllData(prev => [...prev, ...data.items]);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error('Pagination error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [url, page, pageSize]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  return { data: allData, loading, hasMore, loadMore, page };
};

/* ====================================
   NOTIFICATION / TOAST HOOK
   ==================================== */

/**
 * useNotification - Global notification system
 */
export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const close = useCallback(() => {
    setNotification(null);
  }, []);

  return { notification, show, close };
};

/* ====================================
   FORM STATE HOOK
   ==================================== */

/**
 * useForm - Manage form state and validation
 */
export const useForm = (initialValues = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
    reset,
  };
};

/* ====================================
   COPY TO CLIPBOARD HOOK
   ==================================== */

/**
 * useCopyToClipboard - Copy text to clipboard
 */
export const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  }, []);

  return { copied, copy };
};

/* ====================================
   PREVIOUS VALUE HOOK
   ==================================== */

/**
 * usePrevious - Get previous value
 */
export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/* ====================================
   MOUNT EFFECT HOOK
   ==================================== */

/**
 * useMount - Run effect only on mount
 */
export const useMount = (effect) => {
  useEffect(effect, []);
};

/**
 * useUnmount - Run effect on unmount
 */
export const useUnmount = (effect) => {
  useEffect(() => {
    return effect;
  }, []);
};

/* ====================================
   SEARCH & FILTER HOOK
   ==================================== */

/**
 * useSearch - Search through array of items
 */
export const useSearch = (items, searchFields = []) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(items);

  useEffect(() => {
    if (!query.trim()) {
      setResults(items);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = items.filter(item =>
      searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return String(value).toLowerCase().includes(lowercaseQuery);
      })
    );

    setResults(filtered);
  }, [query, items, searchFields]);

  return { query, setQuery, results };
};

export default {
  useTheme,
  useLocalStorage,
  useAnimationOnScroll,
  useSmoothNumber,
  useParallax,
  useKeyboardShortcuts,
  useDebounce,
  useThrottle,
  useWindowSize,
  useDeviceType,
  usePerformanceMetrics,
  useRenderCount,
  useFetch,
  usePaginatedFetch,
  useNotification,
  useForm,
  useCopyToClipboard,
  usePrevious,
  useMount,
  useUnmount,
  useSearch,
};
