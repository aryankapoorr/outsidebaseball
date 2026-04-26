import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ComposurePage from './pages/ComposurePage';

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/composure" element={<ComposurePage />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
}
