import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ar_EG from 'antd/locale/ar_EG';
import Layout from './components/Layout';
import Home from './components/Home';
import FormsList from './components/forms/FormsList';
import FormEditor from './components/forms/FormEditor';
import Settings from './components/settings/Settings';
import './i18n'; // Import i18n configuration
import './styles/App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider
      direction="rtl"
      locale={ar_EG}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          fontFamily: 'Cairo, Roboto, sans-serif',
        },
      }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forms" element={<FormsList />} />
          <Route path="/forms/new" element={<FormEditor />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </ConfigProvider>
  );
};

export default App; 