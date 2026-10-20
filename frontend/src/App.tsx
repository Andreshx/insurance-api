import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './shared/components/Layout';
import { CustomerListPage } from './features/customers/pages/CustomerListPage';
import { CustomerCreatePage } from './features/customers/pages/CustomerCreatePage';
import { CustomerDetailPage } from './features/customers/pages/CustomerDetailPage';
import { PolicyListPage } from './features/policies/pages/PolicyListPage';
import { PolicyCreatePage } from './features/policies/pages/PolicyCreatePage';
import { PolicyDetailPage } from './features/policies/pages/PolicyDetailPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/customers" replace />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/create" element={<CustomerCreatePage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/policies" element={<PolicyListPage />} />
        <Route path="/policies/create" element={<PolicyCreatePage />} />
        <Route path="/policies/:customerId/create" element={<PolicyCreatePage />} />
        <Route path="/policies/:id" element={<PolicyDetailPage />} />
      </Route>
    </Routes>
  );
}
