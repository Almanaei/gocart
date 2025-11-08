import React from 'react';

function Layout({ children }) {
  console.log('Layout component rendering');
  return (
    <div>
      <header style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
        {/* Header content */}
      </header>
      <main>{children}</main>
    </div>
  );
}

export default Layout;