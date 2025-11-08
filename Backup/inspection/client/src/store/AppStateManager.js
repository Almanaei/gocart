import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';

// إنشاء سياق التطبيق
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// تعريف الحالة الأولية
const initialState = {
  loading: false,
  error: null,
  notifications: [],
  settings: {
    theme: 'light',
    language: 'ar',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    autoSave: true,
    cacheTimeout: 5 * 60 * 1000, // 5 دقائق
  },
  forms: {
    drafts: [],
    submitted: [],
    lastUpdated: null,
  },
  user: {
    isAuthenticated: false,
    data: null,
    permissions: [],
  },
  cache: new Map(),
};

// تعريف أنواع الإجراءات
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_FORMS: 'UPDATE_FORMS',
  SET_USER: 'SET_USER',
  UPDATE_CACHE: 'UPDATE_CACHE',
  CLEAR_CACHE: 'CLEAR_CACHE',
  SET_CACHE: 'SET_CACHE',
};

// دالة تخفيض الحالة
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case ActionTypes.UPDATE_FORMS:
      return {
        ...state,
        forms: {
          ...state.forms,
          ...action.payload,
          lastUpdated: new Date().toISOString(),
        },
      };

    case ActionTypes.SET_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case ActionTypes.UPDATE_CACHE:
      if (typeof action.payload.key === 'undefined') {
        // Handle the case when payload is the entire cache Map
        return {
          ...state,
          cache: action.payload
        };
      } else {
        // Handle the case when adding a single item to the cache
        const newCache = new Map(state.cache);
        newCache.set(action.payload.key, {
          data: action.payload.data,
          timestamp: Date.now(),
        });
        return {
          ...state,
          cache: newCache,
        };
      }

    case ActionTypes.SET_CACHE:
      return {
        ...state,
        cache: action.payload
      };

    case ActionTypes.CLEAR_CACHE:
      return {
        ...state,
        cache: new Map(),
      };

    default:
      return state;
  }
}

// مزود حالة التطبيق
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const intervalRef = useRef(null);
  
  // Store state values in refs to avoid dependency issues
  const cacheRef = useRef(state.cache);
  const cacheTimeoutRef = useRef(state.settings.cacheTimeout);
  
  // Update refs when state changes
  useEffect(() => {
    cacheRef.current = state.cache;
  }, [state.cache]);
  
  useEffect(() => {
    cacheTimeoutRef.current = state.settings.cacheTimeout;
  }, [state.settings.cacheTimeout]);

  // دوال مساعدة للتعامل مع الحالة
  const setLoading = useCallback((isLoading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    dispatch({
      type: ActionTypes.ADD_NOTIFICATION,
      payload: { ...notification, id },
    });
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
  }, []);

  const updateSettings = useCallback((settings) => {
    dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings });
  }, []);

  const updateForms = useCallback((forms) => {
    dispatch({ type: ActionTypes.UPDATE_FORMS, payload: forms });
  }, []);

  const setUser = useCallback((user) => {
    dispatch({ type: ActionTypes.SET_USER, payload: user });
  }, []);

  const updateCache = useCallback((key, data) => {
    dispatch({
      type: ActionTypes.UPDATE_CACHE,
      payload: { key, data },
    });
  }, []);

  const clearCache = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_CACHE });
  }, []);

  // تنظيف الذاكرة المؤقتة تلقائياً - using useRef to prevent re-renders
  React.useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Setup new interval
    const cleanupInterval = () => {
      let hasExpiredItems = false;
      const now = Date.now();
      const currentCache = cacheRef.current;
      const timeout = cacheTimeoutRef.current;
      
      // First check if we have any expired items
      currentCache.forEach((value) => {
        if (now - value.timestamp > timeout) {
          hasExpiredItems = true;
        }
      });
      
      // Only proceed if we found expired items
      if (hasExpiredItems) {
        const newCache = new Map();
        
        // Keep only non-expired items
        currentCache.forEach((value, key) => {
          if (now - value.timestamp <= timeout) {
            newCache.set(key, value);
          }
        });
        
        // Dispatch action to update cache
        dispatch({
          type: ActionTypes.SET_CACHE, 
          payload: newCache
        });
      }
    };
    
    // Initial cleanup
    cleanupInterval();
    
    // Set interval for periodic cleanup
    intervalRef.current = setInterval(cleanupInterval, 60000); // Check every minute
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty dependency array is correct now as we use refs

  const value = {
    state,
    setLoading,
    setError,
    addNotification,
    removeNotification,
    updateSettings,
    updateForms,
    setUser,
    updateCache,
    clearCache,
  };

  return (
    <AppStateContext.Provider value={value}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// Hooks مخصصة للوصول إلى الحالة
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppStateProvider');
  }
  return context;
}

// تصدير الثوابت والأنواع
export { ActionTypes }; 