import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ComposurePage from './pages/ComposurePage';
import ComposureNotebookPage from './pages/ComposureNotebookPage';

export default function App() {
  return (
    <Routes>
      <Route path="/"                    element={<Home />} />
      <Route path="/composure"           element={<ComposurePage />} />
      <Route path="/composure/notebook"  element={<ComposureNotebookPage />} />
      <Route path="*"                    element={<Navigate to="/" replace />} />
    </Routes>
  );
}
