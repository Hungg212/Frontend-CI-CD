import { useState } from 'react';
import { Server, Terminal, PlayCircle, ServerCog, Boxes, Network } from 'lucide-react';
import { ansibleHosts, playbooks, type AnsibleHost } from '@/data/devops';

const envBadge: Record<AnsibleHost['environment'], string> = {
  dev: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  staging: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  prod: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const envLabel: Record<AnsibleHost['environment'], string> = {
  dev: 'Dev',
  staging: 'Staging',
  prod: 'Prod',
};

const nginxBadge: Record<AnsibleHost['nginx'], string> = {
  running: 'text-green-600 dark:text-green-400',
  stopped: 'text-red-600 dark:text-red-400',
  'not installed': 'text-stone-400 dark:text-stone-500',
};

function HostRow({ host }: { host: AnsibleHost }) {
  return (
    <tr className="border-b border-stone-100 last:border-0 dark:border-zinc-700/50">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-stone-400" />
          <span className="font-medium text-stone-900 dark:text-stone-100">{host.name}</span>
        </div>
      </td>
      <td className="py-3 pr-4 font-mono text-xs text-stone-500 dark:text-stone-400">{host.ip}</td>
      <td className="py-3 pr-4">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${envBadge[host.environment]}`}
        >
          {envLabel[host.environment]}
        </span>
      </td>
      <td className="py-3 pr-4 text-xs text-stone-500 dark:text-stone-400">{host.os}</td>
      <td className={`py-3 pr-4 text-xs font-medium ${nginxBadge[host.nginx]}`}>{host.nginx}</td>
      <td className="py-3 text-xs text-stone-400">{host.lastRun}</td>
    </tr>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — bỏ qua
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-stone-900 dark:border-zinc-700">
      <div className="flex items-center justify-between border-b border-stone-700 px-4 py-2">
        <span className="font-mono text-xs text-stone-400">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded px-2 py-0.5 text-xs text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
        >
          {copied ? 'Đã copy' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-stone-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function AnsibleInfrastructure() {
  return (
    <div className="space-y-6">
      {/* Inventory */}
      <div className="rounded-xl border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-3 dark:border-zinc-700">
          <ServerCog className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <h3 className="font-display text-sm font-semibold">Inventory — máy chủ web</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500 dark:border-zinc-700 dark:text-stone-400">
                <th className="px-4 py-2 font-medium">Host</th>
                <th className="px-4 py-2 font-medium">IP</th>
                <th className="px-4 py-2 font-medium">Môi trường</th>
                <th className="px-4 py-2 font-medium">OS</th>
                <th className="px-4 py-2 font-medium">Nginx</th>
                <th className="px-4 py-2 font-medium">Playbook gần nhất</th>
              </tr>
            </thead>
            <tbody>
              {ansibleHosts.map((host) => (
                <HostRow key={host.name} host={host} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Playbooks */}
      <div className="grid gap-4 lg:grid-cols-2">
        {playbooks.map((pb) => (
          <div
            key={pb.file}
            className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="mb-2 flex items-start gap-3">
              <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                <Boxes className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-sm font-semibold">{pb.name}</h4>
                <p className="font-mono text-xs text-stone-500 dark:text-stone-400">{pb.file}</p>
              </div>
            </div>
            <p className="mb-3 text-xs text-stone-600 dark:text-stone-400">{pb.purpose}</p>
            <div className="mb-3 flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1">
                <Network className="h-3.5 w-3.5" />
                hosts: {pb.hosts}
              </span>
            </div>
            <div className="rounded-lg bg-stone-100 p-2.5 dark:bg-zinc-900">
              <code className="block break-all font-mono text-[11px] text-stone-700 dark:text-stone-300">
                {pb.command}
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* Quick commands */}
      <CodeBlock
        label="Các lệnh Ansible thường dùng"
        code={`# Kiểm tra kết nối SSH tới toàn bộ máy chủ
ansible webservers -i inventory/dev.ini -m ping

# Xem trước thay đổi, không áp dụng (dry-run)
ansible-playbook playbooks/webserver.yml -i inventory/dev.ini --check --diff

# Áp dụng cấu hình lên Dev
ansible-playbook playbooks/webserver.yml -i inventory/dev.ini

# Áp dụng lên Production, chỉ chạy nhóm task nginx
ansible-playbook playbooks/webserver.yml -i inventory/prod.ini -t nginx,web

# Cài đặt collection cần thiết
ansible-galaxy collection install community.general community.docker`}
      />

      <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Triển khai đa môi trường
          </p>
          <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
            Cùng một playbook, chỉ đổi file inventory là áp dụng được cho Dev lẫn Prod. Cấu hình đã
            kiểm thử ở Dev được tái sử dụng nguyên vẹn cho môi trường Production.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RunPipelineHint() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-600 dark:bg-zinc-800 dark:text-stone-400">
      <PlayCircle className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
      <span>Webhook từ GitHub sẽ tự kích hoạt Jenkins khi có commit lên nhánh chính.</span>
    </div>
  );
}
