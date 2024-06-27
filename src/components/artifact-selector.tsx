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
          className="p-4 bg-gray-100 rounded shadow hover:bg-gray-200 transition-colors"
        >
          {artifact.name}
        </button>
      ))}
    </div>
  );
}
