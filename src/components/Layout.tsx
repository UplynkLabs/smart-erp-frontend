import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <>
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="screen-section active" style={{ height: 'calc(100vh - 60px)', overflow: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
