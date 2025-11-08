import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import formsReducer from './slices/formsSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    forms: formsReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // تجاهل بعض الإجراءات غير القابلة للتسلسل
        ignoredActions: ['auth/login/fulfilled', 'forms/uploadPhotos/fulfilled'],
        // تجاهل بعض المسارات في الحالة
        ignoredPaths: ['forms.currentForm.photos']
      }
    })
});

export default store; 