import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import BranchSelection from './pages/BranchSelection';
import POS from './pages/POS';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/branch" element={<BranchSelection />} />
        
        {/* Main App routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/pos" replace />} />
          <Route path="pos" element={<POS />} />
          <Route path="dashboard" element={<div className="state-container"><div className="state-title">Dashboard (Coming Soon)</div></div>} />
          <Route path="kitchen" element={<div className="state-container"><div className="state-title">Kitchen (Coming Soon)</div></div>} />
          <Route path="inventory" element={<div className="state-container"><div className="state-title">Inventory (Coming Soon)</div></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
