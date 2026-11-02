import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import BranchSelection from './pages/BranchSelection';
import POS from './pages/POS';
import Kitchen from './pages/Kitchen';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import ResourcePage from './pages/ResourcePage';
import { accountingModule, auditModule, customersModule, expensesModule, inventoryModule, payablesModule, purchasesModule, suppliersModule } from './pages/modules';
import { getTokens, hasSelectedBranch } from './services/api';

function RequireBranch({ children }: { children: React.ReactNode }) {
  if (!getTokens()) return <Navigate to="/login" replace />;
  if (!hasSelectedBranch()) return <Navigate to="/branch" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/branch" element={<BranchSelection />} />
        
        {/* Main App routes */}
        <Route path="/" element={<RequireBranch><Layout /></RequireBranch>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="inventory" element={<ResourcePage config={inventoryModule} />} />
          <Route path="customers" element={<ResourcePage config={customersModule} />} />
          <Route path="suppliers" element={<ResourcePage config={suppliersModule} />} />
          <Route path="purchases" element={<ResourcePage config={purchasesModule} />} />
          <Route path="payables" element={<ResourcePage config={payablesModule} />} />
          <Route path="expenses" element={<ResourcePage config={expensesModule} />} />
          <Route path="accounting" element={<ResourcePage config={accountingModule} />} />
          <Route path="audit" element={<ResourcePage config={auditModule} />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
