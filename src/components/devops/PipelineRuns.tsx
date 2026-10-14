import { useState } from 'react';
import { ChevronDown, GitCommitHorizontal, GitBranch, User, Clock, Layers } from 'lucide-react';
import { pipelineRuns, type PipelineRun } from '@/data/devops';
import { StatusBadge, StatusDot } from './StatusBadge';

function RunCard({ run }: { run: PipelineRun }) {
  const [expanded, setExpanded] = useState(run.id === 1);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white transition-all hover:border-amber-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-amber-700">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <StatusDot status={run.status} />
          <span className="font-mono text-sm font-semibold text-stone-900 dark:text-stone-100">
            {run.buildNumber}
          </span>
          <span className="truncate text-sm text-stone-500 dark:text-stone-400">
            {run.stages[run.stages.length - 1]?.name}
          </span>
        </div>

        <div className="hidden items-center gap-4 text-xs text-stone-500 md:flex dark:text-stone-400">
          <span className="flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5" />
            {run.branch}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <GitCommitHorizontal className="h-3.5 w-3.5" />
            {run.commit}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {run.author}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {run.duration}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-stone-200 bg-stone-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <Clock className="h-3.5 w-3.5" />
              Bắt đầu: {run.startedAt}
            </span>
            <StatusBadge status={run.status} />
          </div>

          {/* Pipeline flow */}
          <div className="space-y-0">
            {run.stages.map((stage, index) => (
              <div key={stage.name} className="flex gap-4">
                {/* Rail */}
                <div className="flex flex-col items-center">
                  <StatusDot status={stage.status} />
                  {index < run.stages.length - 1 && (
                    <span
                      className={`w-0.5 flex-1 ${
                        stage.status === 'failed'
                          ? 'bg-red-300 dark:bg-red-900'
                          : 'bg-stone-300 dark:bg-zinc-700'
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {stage.name}
                    </span>
                    <span className="text-xs text-stone-400">{stage.duration}</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>

          {run.stages.some((s) => s.status === 'failed') && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
              <Layers className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-xs text-red-800 dark:text-red-300">
                Build <span className="font-mono font-semibold">{run.buildNumber}</span> dừng ở
                stage{' '}
                <span className="font-semibold">
                  {run.stages.find((s) => s.status === 'failed')?.name}
                </span>{' '}
                — đã được sửa và build lại ở lần chạy sau.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PipelineRuns() {
  return (
    <div className="space-y-3">
      {pipelineRuns.map((run) => (
        <RunCard key={run.id} run={run} />
      ))}
    </div>
  );
}
