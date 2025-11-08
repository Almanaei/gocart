import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// الحالة الأولية
const initialState = {
  forms: [],
  currentForm: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    date: null,
    inspector: null
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

// إجراءات غير متزامنة
export const fetchForms = createAsyncThunk(
  'forms/fetchForms',
  async ({ page = 1, limit = 10, filters = {} }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get('/api/forms', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit, ...filters }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createForm = createAsyncThunk(
  'forms/createForm',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post('/api/forms', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateForm = createAsyncThunk(
  'forms/updateForm',
  async ({ id, formData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`/api/forms/${id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteForm = createAsyncThunk(
  'forms/deleteForm',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const saveFormDraft = createAsyncThunk(
  'forms/saveFormDraft',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post('/api/forms/draft', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const submitForm = createAsyncThunk(
  'forms/submitForm',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post('/api/forms/submit', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// شريحة النماذج
const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // إعادة تعيين الصفحة عند تغيير الفلاتر
    },
    setCurrentForm: (state, action) => {
      state.currentForm = action.payload;
    },
    clearCurrentForm: (state) => {
      state.currentForm = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // جلب النماذج
    builder
      .addCase(fetchForms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forms = action.payload.forms;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total
        };
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'خطأ في جلب النماذج';
      })
      // إنشاء نموذج
      .addCase(createForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forms.unshift(action.payload);
        state.currentForm = action.payload;
      })
      .addCase(createForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'خطأ في إنشاء النموذج';
      })
      // تحديث نموذج
      .addCase(updateForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateForm.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.forms.findIndex(form => form.id === action.payload.id);
        if (index !== -1) {
          state.forms[index] = action.payload;
        }
        state.currentForm = action.payload;
      })
      .addCase(updateForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'خطأ في تحديث النموذج';
      })
      // حذف نموذج
      .addCase(deleteForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forms = state.forms.filter(form => form.id !== action.payload);
        if (state.currentForm?.id === action.payload) {
          state.currentForm = null;
        }
      })
      .addCase(deleteForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'خطأ في حذف النموذج';
      })
      // حفظ مسودة النموذج
      .addCase(saveFormDraft.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveFormDraft.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentForm = action.payload;
        const index = state.forms.findIndex(form => form.id === action.payload.id);
        if (index !== -1) {
          state.forms[index] = action.payload;
        } else {
          state.forms.unshift(action.payload);
        }
      })
      .addCase(saveFormDraft.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'خطأ في حفظ مسودة النموذج';
      })
      // تقديم النموذج
      .addCase(submitForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentForm = action.payload;
        const index = state.forms.findIndex(form => form.id === action.payload.id);
        if (index !== -1) {
          state.forms[index] = action.payload;
        } else {
          state.forms.unshift(action.payload);
        }
      })
      .addCase(submitForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'خطأ في تقديم النموذج';
      });
  }
});

export const { setFilters, setCurrentForm, clearCurrentForm, clearError } = formsSlice.actions;
export default formsSlice.reducer; 