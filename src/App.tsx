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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Claude Artifacts
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Explore interactive artifacts and components
          </p>
        </header>

        <main className="bg-white shadow-2xl rounded-lg overflow-hidden">
          {selectedArtifact ? (
            <div className="p-6">
              <button 
                onClick={() => setSelectedArtifact(null)}
                className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ← Back to Menu
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedArtifact.name}</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <selectedArtifact.component />
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select an Artifact</h2>
              <ArtifactSelector artifacts={artifacts} onSelectArtifact={handleArtifactSelect} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;