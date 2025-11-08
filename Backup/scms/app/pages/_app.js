import React, { useEffect } from 'react';
import '../styles/globals.css';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    document.body.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;