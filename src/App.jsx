import { Routes, Route, Navigate } from 'react-router-dom';
import Home         from './pages/Home';
import ProjectPage  from './pages/ProjectPage';
import NotebookPage from './pages/NotebookPage';
import { PROJECTS } from './data/projects';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {PROJECTS.map(p => (
        <Route key={p.slug} path={`/${p.slug}`} element={<ProjectPage project={p} />} />
      ))}

      {PROJECTS.filter(p => p.notebookSection).map(p => (
        <Route key={p.slug} path={`/${p.slug}/notebook`} element={<NotebookPage project={p} />} />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
