import { useState } from 'react';
import { Activity, BarChart3, Boxes, CheckCircle2, Server, Workflow } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { PipelineRuns } from '@/components/devops/PipelineRuns';
import { AnsibleInfrastructure, RunPipelineHint } from '@/components/devops/AnsibleInfrastructure';
import { ConceptsGrid } from '@/components/devops/ConceptsGrid';
import { pipelineRuns, ansibleHosts, bai6Concepts, bai7Concepts } from '@/data/devops';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Activity;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-stone-500 dark:text-stone-400">{label}</span>
        <div className={`rounded-lg p-2 ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{sub}</p>
    </div>
  );
}

const jenkinsfileSnippet = `pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        APP_NAME = 'coffee-home-blend'
        IMAGE_NAME = 'ghcr.io/hungg212/coffee-home-blend'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Install') {
            steps { sh 'npm ci' }
        }
        stage('Build') {
            steps { sh 'npm run build' }
        }
        stage('Test') {
            steps { sh 'npm run test' }
            post {
                always {
                    junit testResults: 'test-results/**/*.xml'
                }
            }
        }
        stage('Package') {
            steps { sh 'docker build -t $IMAGE_NAME:$BRANCH_NAME .' }
        }
        stage('Deploy') {
            when { expression { env.BRANCH_NAME == 'main' } }
            steps { sh 'docker push $IMAGE_NAME:latest' }
        }
    }
}`;

const playbookSnippet = `- name: Cài đặt và cấu hình web server
  hosts: webservers
  become: true

  roles:
    - role: common
    - role: nginx

  tasks:
    - name: Tạo thư mục triển khai ứng dụng
      ansible.builtin.file:
        path: '{{ app_root }}'
        state: directory
        mode: '0755'

    - name: Đặt cấu hình nginx cho ứng dụng
      ansible.builtin.template:
        src: templates/nginx-app.conf.j2
        dest: /etc/nginx/conf.d/coffee-home-blend.conf
      notify: Restart nginx

    - name: Kiểm tra máy chủ web hoạt động
      ansible.builtin.uri:
        url: "http://127.0.0.1:{{ app_health_path }}"
      register: health_check
      until: health_check is succeeded`;

const inventorySnippet = `[webservers]
dev-web-01    ansible_host=192.168.56.101
staging-web-01 ansible_host=10.0.1.20
prod-web-01   ansible_host=10.0.2.10
prod-web-02   ansible_host=10.0.2.11

[webservers:vars]
ansible_ssh_private_key_file=~/.ssh/id_ed25519
domain=coffee-home-blend.vn

[webservers:prod]
prod-web-01
prod-web-02

[webservers:dev]
dev-web-01`;

function CodeViewer({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900">
        <span className="font-mono text-xs font-medium text-stone-600 dark:text-stone-400">
          {title}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded px-2 py-0.5 text-xs text-stone-500 transition-colors hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-zinc-800"
        >
          {copied ? 'Đã copy' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-96 overflow-auto bg-stone-900 p-4 font-mono text-xs leading-relaxed text-stone-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function WorkflowDiagram() {
  const steps = [
    { label: 'Developer commit', detail: 'Git repository' },
    { label: 'Jenkins webhook', detail: 'phát hiện thay đổi' },
    { label: 'Build', detail: 'npm run build' },
    { label: 'Test', detail: 'vitest + lint' },
    { label: 'Deploy', detail: 'staging / production' },
  ];

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
        <Workflow className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        Quy trình CI/CD
      </h3>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center gap-3">
            <div className="flex-1 rounded-lg border border-stone-200 bg-stone-50 p-3 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-medium text-stone-900 dark:text-stone-100">{step.label}</p>
              <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">{step.detail}</p>
            </div>
            {index < steps.length - 1 && (
              <span className="hidden text-stone-300 sm:block dark:text-zinc-600">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDevOps() {
  const successCount = pipelineRuns.filter((r) => r.status === 'success').length;
  const runningHosts = ansibleHosts.filter((h) => h.nginx === 'running').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
          DevOps
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Theo dõi pipeline CI/CD (Bài 6 — Jenkins) và hạ tầng cấu hình tự động (Bài 7 — Ansible)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Build gần nhất"
          value={pipelineRuns[0].buildNumber}
          sub={`${pipelineRuns[0].duration} trên ${pipelineRuns[0].branch}`}
          icon={Activity}
          tone="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          label="Tỉ lệ thành công"
          value={`${Math.round((successCount / pipelineRuns.length) * 100)}%`}
          sub={`${successCount}/${pipelineRuns.length} build gần đây`}
          icon={CheckCircle2}
          tone="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          label="Máy chủ đang chạy"
          value={`${runningHosts}/${ansibleHosts.length}`}
          sub="Nginx hoạt động bình thường"
          icon={Server}
          tone="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          label="Playbook"
          value="2"
          sub="webserver.yml · deploy.yml"
          icon={Boxes}
          tone="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList className="flex-wrap">
          <TabsTrigger value="pipeline">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Pipeline
            </span>
          </TabsTrigger>
          <TabsTrigger value="infrastructure">
            <span className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" />
              Hạ tầng
            </span>
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Kiến thức
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ── Pipeline (Bài 6) ── */}
        <TabsContent value="pipeline">
          <div className="space-y-6">
            <WorkflowDiagram />
            <RunPipelineHint />

            <div>
              <h2 className="mb-3 font-display text-lg font-semibold">Lịch sử build</h2>
              <PipelineRuns />
            </div>

            <div>
              <h2 className="mb-3 font-display text-lg font-semibold">Jenkinsfile</h2>
              <CodeViewer title="Jenkinsfile" code={jenkinsfileSnippet} />
            </div>
          </div>
        </TabsContent>

        {/* ── Hạ tầng (Bài 7) ── */}
        <TabsContent value="infrastructure">
          <div className="space-y-6">
            <AnsibleInfrastructure />

            <div>
              <h2 className="mb-3 font-display text-lg font-semibold">File cấu hình mẫu</h2>
              <div className="grid gap-4">
                <CodeViewer title="ansible/inventory/dev.ini" code={inventorySnippet} />
                <CodeViewer title="ansible/playbooks/webserver.yml" code={playbookSnippet} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Kiến thức ── */}
        <TabsContent value="knowledge">
          <div className="space-y-8">
            <section>
              <h2 className="mb-1 font-display text-lg font-semibold">
                Bài 6 — CI/CD cơ bản với Jenkins
              </h2>
              <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
                Tự động hóa build, test và deploy; giảm lỗi thao tác thủ công, tăng tốc độ phát
                hành.
              </p>
              <ConceptsGrid concepts={bai6Concepts} />
            </section>

            <section>
              <h2 className="mb-1 font-display text-lg font-semibold">
                Bài 7 — Tự động hóa cấu hình với Ansible
              </h2>
              <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
                Quản lý cấu hình, triển khai ứng dụng và điều phối hệ thống — không cần cài agent.
              </p>
              <ConceptsGrid concepts={bai7Concepts} />
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-900 dark:text-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Lợi ích của CI/CD
                </h3>
                <ul className="space-y-1 text-xs text-green-800 dark:text-green-300">
                  <li>• Tự động hóa build, test, deploy</li>
                  <li>• Giảm lỗi do thao tác thủ công</li>
                  <li>• Tăng tốc độ phát hành sản phẩm</li>
                </ul>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                  <Server className="h-4 w-4" />
                  Lợi ích của Ansible
                </h3>
                <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-300">
                  <li>• Tự động hóa quy trình triển khai và quản lý cấu hình</li>
                  <li>• Giảm lỗi cấu hình thủ công</li>
                  <li>• Dễ quản lý nhiều máy chủ cùng lúc</li>
                  <li>• Tái sử dụng cấu hình cho nhiều môi trường</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
