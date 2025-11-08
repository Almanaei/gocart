import { createSlice } from '@reduxjs/toolkit';

// الحالة الأولية
const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  language: localStorage.getItem('language') || 'ar',
  sidebarOpen: true,
  notifications: [],
  modals: {
    createForm: false,
    editForm: false,
    deleteForm: false,
    changePassword: false
  },
  loading: {
    global: false,
    forms: false,
    auth: false
  }
};

// شريحة واجهة المستخدم
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // إدارة السمة
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },

    // إدارة اللغة
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },

    // إدارة الشريط الجانبي
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    // إدارة الإشعارات
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // إدارة النوافذ المنبثقة
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },

    // إدارة حالة التحميل
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    }
  }
});

// دالة عرض الإشعارات
export const showNotification = (notification) => (dispatch) => {
  const id = Date.now();
  dispatch(addNotification({ id, ...notification }));
  
  // إزالة الإشعار تلقائيًا بعد مدة معينة
  setTimeout(() => {
    dispatch(removeNotification(id));
  }, notification.duration || 5000);
};

// تصدير الإجراءات
export const {
  toggleTheme,
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  setGlobalLoading
} = uiSlice.actions;

// تصدير المحدد
export const selectTheme = state => state.ui.theme;
export const selectLanguage = state => state.ui.language;
export const selectSidebarOpen = state => state.ui.sidebarOpen;
export const selectNotifications = state => state.ui.notifications;
export const selectModals = state => state.ui.modals;
export const selectLoading = state => state.ui.loading;

export default uiSlice.reducer; 