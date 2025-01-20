interface Artifact {
  id: string;
  name: string;
}

export interface ArtifactSelectorProps {
  artifacts: Artifact[];
  onSelectArtifact: (id: string) => void;
}

export default function ArtifactSelector({ artifacts, onSelectArtifact }: ArtifactSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {artifacts.map((artifact) => (
        <button
          key={artifact.id}
          onClick={() => onSelectArtifact(artifact.id)}
          className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="block text-lg font-semibold">{artifact.name}</span>
        </button>
      ))}
    </div>
  );
}
