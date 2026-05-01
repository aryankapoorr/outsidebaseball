import { createContext, useContext } from 'react';

const ProjectContext = createContext(null);

export function ProjectProvider({ config, children }) {
  return <ProjectContext.Provider value={config}>{children}</ProjectContext.Provider>;
}

export function useProjectConfig() {
  return useContext(ProjectContext);
}
