import React, { ReactNode } from 'react';
import { Layout as AntLayout } from 'antd';
import ResponsiveLayout from './layout/ResponsiveLayout';

const { Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <ResponsiveLayout>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
          {children}
        </Content>
      </ResponsiveLayout>
    </AntLayout>
  );
};

export default Layout; 