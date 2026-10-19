import { useState } from 'react';
import {
  Server,
  Terminal,
  PlayCircle,
  ServerCog,
  Boxes,
  Network,
  Database,
  Globe,
  Rocket,
  GitBranch,
  Archive,
  History,
} from 'lucide-react';
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
          {host.name.includes('db') ? (
            <Database className="h-4 w-4 text-amber-500" />
          ) : (
            <Server className="h-4 w-4 text-stone-400" />
          )}
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
      <td className={`py-3 pr-4 text-xs font-medium ${nginxBadge[host.nginx]}`}>
        {host.nginx}
      </td>
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

// === Thông tin cấu trúc thư mục Ansible ===
const ansibleStructure = `infra/ansible/
├── ansible.cfg                      # Cấu hình chung
├── requirements.yml                 # Galaxy collections
├── inventories/
│   ├── dev.ini                      # Dev environment
│   ├── staging.ini                  # Staging
│   └── prod.ini                     # Production
├── group_vars/
│   ├── all.yml                      # Biến toàn cục
│   ├── webservers.yml               # Nhóm web
│   └── dbservers.yml                # Nhóm DB
├── playbooks/
│   ├── site.yml                     # Bootstrap toàn bộ
│   ├── deploy-backend.yml           # Deploy app
│   ├── rollback.yml                 # Quay về bản cũ
│   └── health-check.yml             # Kiểm tra tổng thể
└── roles/
    ├── common/                      # Setup cơ bản
    ├── nodejs/                      # Node 20 + PM2
    ├── postgres/                    # PostgreSQL 16
    ├── nginx/                       # Reverse proxy
    └── deploy-app/                  # Rolling deploy`;

export function AnsibleInfrastructure() {
  return (
    <div className="space-y-6">
      {/* Architecture overview */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="mb-3 flex items-center gap-2">
          <ServerCog className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <h3 className="font-display text-sm font-semibold text-stone-900 dark:text-stone-100">
            Kiến trúc triển khai
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-4">
          <div className="flex items-center gap-2 rounded-lg bg-white/60 p-2 dark:bg-zinc-800/60">
            <GitBranch className="h-4 w-4 text-stone-500" />
            <span>GitHub → Jenkins</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/60 p-2 dark:bg-zinc-800/60">
            <Archive className="h-4 w-4 text-stone-500" />
            <span>Build → tar.gz</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/60 p-2 dark:bg-zinc-800/60">
            <Rocket className="h-4 w-4 text-amber-500" />
            <span>Ansible → VPS</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/60 p-2 dark:bg-zinc-800/60">
            <Globe className="h-4 w-4 text-green-500" />
            <span>Nginx → Users</span>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="rounded-xl border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-3 dark:border-zinc-700">
          <ServerCog className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <h3 className="font-display text-sm font-semibold">Inventory — máy chủ</h3>
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
                <th className="px-4 py-2 font-medium">Deploy gần nhất</th>
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

      {/* Roles */}
      <div className="rounded-xl border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-3 dark:border-zinc-700">
          <Boxes className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <h3 className="font-display text-sm font-semibold">Roles (tái sử dụng)</h3>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: 'common',
              desc: 'APT update, tạo user deploy, UFW, fail2ban, swap, timezone',
              icon: '🛠️',
            },
            {
              name: 'nodejs',
              desc: 'Node.js 20 + PM2, cấu hình systemd cho deploy user',
              icon: '🟩',
            },
            {
              name: 'postgres',
              desc: 'PostgreSQL 16, tạo user/DB, tuning, backup tự động',
              icon: '🐘',
            },
            {
              name: 'nginx',
              desc: 'Reverse proxy, rate limit, gzip, security headers, JSON logs',
              icon: '🌐',
            },
            {
              name: 'deploy-app',
              desc: 'Rolling release: upload → extract → symlink → PM2 reload → smoke test',
              icon: '🚀',
            },
          ].map((role) => (
            <div
              key={role.name}
              className="rounded-lg border border-stone-200 bg-stone-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg">{role.icon}</span>
                <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {role.name}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">{role.desc}</p>
            </div>
          ))}
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

      {/* Ansible Structure */}
      <CodeBlock label="Cấu trúc thư mục Ansible (dự án thật)" code={ansibleStructure} />

      {/* Quick commands */}
      <CodeBlock
        label="Các lệnh Ansible thường dùng"
        code={`# Cài collections cần thiết
ansible-galaxy collection install -r requirements.yml

# Kiểm tra kết nối SSH tới toàn bộ máy chủ
ansible webservers -i inventories/dev.ini -m ping

# Bootstrap lần đầu (cài Node, PostgreSQL, Nginx)
ansible-playbook -i inventories/dev.ini playbooks/site.yml --ask-vault-pass

# Xem trước thay đổi, không áp dụng (dry-run)
ansible-playbook -i inventories/prod.ini playbooks/deploy-backend.yml \\
  -e "app_artifact=./backend.tar.gz" --check --diff

# Deploy lên dev
ansible-playbook -i inventories/dev.ini playbooks/deploy-backend.yml \\
  -e "app_artifact=./backend-abc1234.tar.gz" \\
  -e "app_version=v1.2.0"

# Deploy lên production (rolling 50% servers một lúc)
ansible-playbook -i inventories/prod.ini playbooks/deploy-backend.yml \\
  -e "app_artifact=./backend-abc1234.tar.gz" \\
  -e "app_version=v1.2.0"

# Health check toàn hệ thống
ansible-playbook -i inventories/prod.ini playbooks/health-check.yml

# Rollback về release trước
ansible-playbook -i inventories/prod.ini playbooks/rollback.yml`}
      />

      {/* Tạo vault secrets */}
      <CodeBlock
        label="Tạo vault cho secrets"
        code={`# 1. Tạo file vault mã hoá
ansible-vault create group_vars/all/vault.yml

# 2. Trong file vault, thêm:
#   vault_pg_password: "strong-db-password-123"
#   vault_jwt_secret: "random-64-char-jwt-secret"
#   vault_cors_origin: "https://coffeehome.vn"

# 3. Trong group_vars/all.yml tham chiếu:
#   pg_password: "{{ vault_pg_password }}"
#   jwt_secret:  "{{ vault_jwt_secret }}"

# 4. Chạy playbook kèm vault
ansible-playbook -i inventories/prod.ini playbooks/site.yml --ask-vault-pass

# 5. Sửa vault
ansible-vault edit group_vars/all/vault.yml`}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
          <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-xs font-medium text-green-900 dark:text-green-200">
              Rolling deploy
            </p>
            <p className="mt-0.5 text-[11px] text-green-700 dark:text-green-300">
              Zero-downtime: cập nhật 50% server một lần, tự động smoke-test
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
          <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
              Idempotent
            </p>
            <p className="mt-0.5 text-[11px] text-blue-700 dark:text-blue-300">
              Chạy lại playbook nhiều lần vẫn cho kết quả như nhau
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-purple-200 bg-purple-50 p-3 dark:border-purple-900 dark:bg-purple-950/30">
          <History className="mt-0.5 h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
          <div>
            <p className="text-xs font-medium text-purple-900 dark:text-purple-200">
              Rollback nhanh
            </p>
            <p className="mt-0.5 text-[11px] text-purple-700 dark:text-purple-300">
              Giữ 5 bản release gần nhất, quay về bất cứ lúc nào
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Triển khai đa môi trường
          </p>
          <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
            Cùng một playbook, chỉ đổi file inventory là áp dụng được cho Dev, Staging lẫn Prod.
            Cấu hình đã kiểm thử ở Dev được tái sử dụng nguyên vẹn cho Production.
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
      <span>
        Webhook từ GitHub sẽ tự kích hoạt Jenkins khi có commit lên <code>main</code> /{' '}
        <code>develop</code>.
      </span>
    </div>
  );
}
