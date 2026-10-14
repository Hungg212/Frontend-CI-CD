import {
  GitBranch,
  Package,
  Rocket,
  ListTree,
  FileCode2,
  Blocks,
  Workflow,
  ListChecks,
  TestTube2,
  type LucideIcon,
} from 'lucide-react';
import type { Concept } from '@/data/devops';

const icons: Record<Concept['icon'], LucideIcon> = {
  git: GitBranch,
  build: Package,
  test: TestTube2,
  deploy: Rocket,
  inventory: ListTree,
  playbook: FileCode2,
  module: Blocks,
  role: Workflow,
};

function ConceptCard({ concept }: { concept: Concept }) {
  const Icon = icons[concept.icon];

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-3 flex items-start gap-3">
        <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
          <Icon className="h-4 w-4 text-amber-700 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <h4 className="font-display text-sm font-semibold">{concept.term}</h4>
          <p className="text-xs text-stone-500 dark:text-stone-400">{concept.description}</p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {concept.details.map((detail) => (
          <li key={detail} className="flex gap-2 text-xs text-stone-600 dark:text-stone-400">
            <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-500" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConceptsGrid({ concepts }: { concepts: Concept[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {concepts.map((concept) => (
        <ConceptCard key={concept.term} concept={concept} />
      ))}
    </div>
  );
}
