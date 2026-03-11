import type { PFElementMeta, ModelTier } from "@/babylon/types";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

interface PropertyPanelProps {
  selectedMesh: AbstractMesh | null;
  selectedElement: PFElementMeta | null;
  tier: ModelTier;
}

export function PropertyPanel({ selectedMesh, selectedElement, tier }: PropertyPanelProps) {
  if (!selectedMesh) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-neutral-700 px-3 py-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Properties
          </h3>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-neutral-500">Select a mesh to view properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-700 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Properties
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* Mesh info (always available) */}
        <Section title="Mesh">
          <PropertyRow label="Name" value={selectedMesh.name || "(unnamed)"} />
          <PropertyRow label="Vertices" value={selectedMesh.getTotalVertices().toLocaleString()} />
          <PropertyRow
            label="Triangles"
            value={Math.floor(selectedMesh.getTotalIndices() / 3).toLocaleString()}
          />
          <PropertyRow label="Visible" value={selectedMesh.isEnabled() ? "Yes" : "No"} />
          {selectedMesh.material && (
            <PropertyRow label="Material" value={selectedMesh.material.name} />
          )}
        </Section>

        {/* Position */}
        <Section title="Position">
          <PropertyRow label="X" value={selectedMesh.position.x.toFixed(3)} />
          <PropertyRow label="Y" value={selectedMesh.position.y.toFixed(3)} />
          <PropertyRow label="Z" value={selectedMesh.position.z.toFixed(3)} />
        </Section>

        {/* Bounding box */}
        {selectedMesh.getBoundingInfo() && (
          <Section title="Bounds">
            <PropertyRow
              label="Size"
              value={formatVector(selectedMesh.getBoundingInfo().boundingBox.extendSize.scale(2))}
            />
          </Section>
        )}

        {/* Element metadata (Tier 2) */}
        {tier >= 2 && selectedElement && (
          <>
            <Section title="Element">
              <PropertyRow label="ID" value={selectedElement.id} />
              <PropertyRow label="Type" value={selectedElement.type} />
              <PropertyRow label="Name" value={selectedElement.name} />
              {selectedElement.discipline && (
                <PropertyRow label="Discipline" value={selectedElement.discipline.toUpperCase()} />
              )}
              {selectedElement.storeyId && (
                <PropertyRow label="Storey" value={selectedElement.storeyId} />
              )}
              {selectedElement.systemId && (
                <PropertyRow label="System" value={selectedElement.systemId} />
              )}
            </Section>

            {Object.keys(selectedElement.properties).length > 0 && (
              <Section title="Custom Properties">
                {Object.entries(selectedElement.properties).map(([key, value]) => (
                  <PropertyRow key={key} label={key} value={String(value)} />
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        {title}
      </h4>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="shrink-0 text-neutral-500">{label}</span>
      <span className="min-w-0 truncate text-right text-neutral-300" title={value}>
        {value}
      </span>
    </div>
  );
}

function formatVector(v: { x: number; y: number; z: number }): string {
  return `${v.x.toFixed(2)} x ${v.y.toFixed(2)} x ${v.z.toFixed(2)}`;
}
