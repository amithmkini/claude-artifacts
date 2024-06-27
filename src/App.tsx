import React, { useState, useEffect } from 'react';
import ArtifactSelector from '@/components/artifact-selector';

interface Artifact {
  id: string;
  name: string;
  component: React.ComponentType;
}

function formatArtifactName(filename: string): string {
  const nameParts = filename.replace('.tsx', '').split('-');
  return nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

const App: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  useEffect(() => {
    const loadArtifacts = async () => {
      const artifactModules = import.meta.glob<{ default: React.ComponentType }>('./artifacts/*.tsx');
      
      const loadedArtifacts = await Promise.all(
        Object.entries(artifactModules).map(async ([path, importFunc]) => {
          const module = await importFunc();
          const filename = path.split('/').pop() || '';
          const name = formatArtifactName(filename);
          return {
            id: filename.replace('.tsx', ''),
            name: name,
            component: module.default,
          };
        })
      );

      setArtifacts(loadedArtifacts);
    };

    loadArtifacts();
  }, []);

  const handleArtifactSelect = (artifactId: string) => {
    setSelectedArtifact(artifacts.find(artifact => artifact.id === artifactId) || null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Artifact Viewer App</h1>
      {selectedArtifact ? (
        <div>
          <button 
            onClick={() => setSelectedArtifact(null)}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Menu
          </button>
          <selectedArtifact.component />
        </div>
      ) : (
        <ArtifactSelector artifacts={artifacts} onSelectArtifact={handleArtifactSelect} />
      )}
    </div>
  );
};

export default App;