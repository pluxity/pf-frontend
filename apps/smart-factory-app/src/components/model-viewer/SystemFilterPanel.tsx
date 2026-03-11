import type { ModelTier, PFDiscipline } from "@/babylon/types";

interface SystemFilterPanelProps {
  tier: ModelTier;
  storeys: { id: string; name: string; elevation: number }[];
  systems: { id: string; name: string; type: string; storeyId: string | null }[];
  storeyVisibility: Record<string, boolean>;
  systemVisibility: Record<string, boolean>;
  disciplineVisibility: Record<PFDiscipline, boolean>;
  onStoreyToggle: (storeyId: string, visible: boolean) => void;
  onSystemToggle: (systemId: string, visible: boolean) => void;
  onDisciplineToggle: (discipline: PFDiscipline, visible: boolean) => void;
  onIsolateStorey: (storeyId: string) => void;
  onShowAllStoreys: () => void;
}

const DISCIPLINE_LABELS: Record<PFDiscipline, { label: string; color: string }> = {
  arc: { label: "Architectural", color: "bg-blue-500" },
  mep: { label: "MEP", color: "bg-green-500" },
  str: { label: "Structural", color: "bg-orange-500" },
};

const SYSTEM_TYPE_ICONS: Record<string, string> = {
  hvac: "\u2744\uFE0F",
  plumbing: "\u{1F6BF}",
  electrical: "\u26A1",
  "fire-protection": "\u{1F525}",
  custom: "\u2699\uFE0F",
};

export function SystemFilterPanel({
  tier,
  storeys,
  systems,
  storeyVisibility,
  systemVisibility,
  disciplineVisibility,
  onStoreyToggle,
  onSystemToggle,
  onDisciplineToggle,
  onIsolateStorey,
  onShowAllStoreys,
}: SystemFilterPanelProps) {
  if (tier < 1) {
    return (
      <div className="px-3 py-4 text-center text-xs text-neutral-500">
        Tier 1+ required for filtering.
        <br />
        Use pf: node naming in your GLB.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-700 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Filters</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Disciplines */}
        <FilterSection title="Disciplines">
          {(
            Object.entries(DISCIPLINE_LABELS) as [PFDiscipline, { label: string; color: string }][]
          ).map(([disc, config]) => (
            <ToggleRow
              key={disc}
              label={config.label}
              active={disciplineVisibility[disc]}
              color={config.color}
              onToggle={() => onDisciplineToggle(disc, !disciplineVisibility[disc])}
            />
          ))}
        </FilterSection>

        {/* Storeys */}
        {storeys.length > 0 && (
          <FilterSection
            title="Storeys"
            action={
              <button className="text-[10px] text-brand hover:underline" onClick={onShowAllStoreys}>
                Show All
              </button>
            }
          >
            {storeys.map((storey) => (
              <div key={storey.id} className="flex items-center gap-1">
                <ToggleRow
                  label={storey.name}
                  active={storeyVisibility[storey.id] ?? true}
                  onToggle={() => onStoreyToggle(storey.id, !(storeyVisibility[storey.id] ?? true))}
                />
                <button
                  className="shrink-0 rounded px-1 text-[10px] text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300"
                  onClick={() => onIsolateStorey(storey.id)}
                  title="Isolate this storey"
                >
                  Solo
                </button>
              </div>
            ))}
          </FilterSection>
        )}

        {/* Systems */}
        {systems.length > 0 && (
          <FilterSection title="Systems">
            {systems.map((sys) => (
              <ToggleRow
                key={sys.id}
                label={`${SYSTEM_TYPE_ICONS[sys.type] ?? ""} ${sys.name}`}
                active={systemVisibility[sys.id] ?? true}
                onToggle={() => onSystemToggle(sys.id, !(systemVisibility[sys.id] ?? true))}
              />
            ))}
          </FilterSection>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function FilterSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-neutral-800 px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {title}
        </h4>
        {action}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  active,
  color,
  onToggle,
}: {
  label: string;
  active: boolean;
  color?: string;
  onToggle: () => void;
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded px-1.5 py-0.5 text-left text-xs transition-colors ${
        active ? "text-neutral-200" : "text-neutral-600"
      } hover:bg-neutral-800`}
      onClick={onToggle}
    >
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-sm ${
          active ? (color ?? "bg-neutral-400") : "bg-neutral-700"
        }`}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}
