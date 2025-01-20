import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
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

const ArtifactView: React.FC<{ artifacts: Artifact[] }> = ({ artifacts }) => {
  const { artifactId } = useParams();
  const navigate = useNavigate();
  const selectedArtifact = artifacts.find(artifact => artifact.id === artifactId);

  useEffect(() => {
    if (!selectedArtifact) {
      navigate("/", { replace: true });
    }
  }, [selectedArtifact, navigate]);

  if (!selectedArtifact) {
    return null;
  }

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/')}
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        ← Back to Menu
      </button>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedArtifact.name}</h2>
      <div className="bg-gray-100 p-4 rounded-lg">
        <selectedArtifact.component />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const navigate = useNavigate();

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
    navigate(`/artifact/${artifactId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <main className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Select an Artifact</h2>
                  <ArtifactSelector artifacts={artifacts} onSelectArtifact={handleArtifactSelect} />
                </div>
              } 
            />
            <Route 
              path="/artifact/:artifactId" 
              element={<ArtifactView artifacts={artifacts} />} 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AppWrapper: React.FC = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

export default AppWrapper;