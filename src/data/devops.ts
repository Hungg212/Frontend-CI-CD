/**
 * Dữ liệu minh hoạ cho trang DevOps (Bài 6 — Jenkins, Bài 7 — Ansible).
 * Trong thực tế các giá trị này sẽ lấy từ Jenkins API / Ansible Tower.
 */

export type StageStatus = 'success' | 'failed' | 'running' | 'pending';

export interface PipelineStage {
  name: string;
  status: StageStatus;
  duration: string;
  description: string;
}

export interface PipelineRun {
  id: number;
  buildNumber: string;
  branch: string;
  commit: string;
  author: string;
  status: StageStatus;
  startedAt: string;
  duration: string;
  stages: PipelineStage[];
}

export const pipelineRuns: PipelineRun[] = [
  {
    id: 1,
    buildNumber: '#128',
    branch: 'main',
    commit: 'aa09ec1',
    author: 'hungg212',
    status: 'success',
    startedAt: '21/09/2026 17:46',
    duration: '3 phút 12 giây',
    stages: [
      { name: 'Checkout', status: 'success', duration: '8s', description: 'Lấy mã nguồn từ Git' },
      {
        name: 'Install',
        status: 'success',
        duration: '1m 04s',
        description: 'npm ci — cài dependencies',
      },
      { name: 'Build', status: 'success', duration: '48s', description: 'tsc -b && vite build' },
      {
        name: 'Lint & Type-check',
        status: 'success',
        duration: '21s',
        description: 'ESLint + TypeScript',
      },
      { name: 'Test', status: 'success', duration: '32s', description: 'Vitest — unit test' },
      { name: 'Package', status: 'success', duration: '19s', description: 'docker build' },
    ],
  },
  {
    id: 2,
    buildNumber: '#127',
    branch: 'main',
    commit: 'a8cfb92',
    author: 'hungg212',
    status: 'failed',
    startedAt: '21/09/2026 17:35',
    duration: '1 phút 04 giây',
    stages: [
      { name: 'Checkout', status: 'success', duration: '7s', description: 'Lấy m�� nguồn từ Git' },
      {
        name: 'Install',
        status: 'success',
        duration: '1m 02s',
        description: 'npm ci — cài dependencies',
      },
      { name: 'Build', status: 'success', duration: '44s', description: 'tsc -b && vite build' },
      {
        name: 'Lint & Type-check',
        status: 'success',
        duration: '19s',
        description: 'ESLint + TypeScript',
      },
      { name: 'Test', status: 'success', duration: '29s', description: 'Vitest — unit test' },
      {
        name: 'Package',
        status: 'failed',
        duration: '12s',
        description: 'docker build — lỗi build image',
      },
    ],
  },
  {
    id: 3,
    buildNumber: '#126',
    branch: 'develop',
    commit: '4f2b8c1',
    author: 'minhtran',
    status: 'success',
    startedAt: '21/09/2026 16:20',
    duration: '2 phút 51 giây',
    stages: [
      { name: 'Checkout', status: 'success', duration: '9s', description: 'Lấy mã nguồn từ Git' },
      {
        name: 'Install',
        status: 'success',
        duration: '58s',
        description: 'npm ci — cài dependencies',
      },
      { name: 'Build', status: 'success', duration: '46s', description: 'tsc -b && vite build' },
      {
        name: 'Lint & Type-check',
        status: 'success',
        duration: '20s',
        description: 'ESLint + TypeScript',
      },
      { name: 'Test', status: 'success', duration: '30s', description: 'Vitest — unit test' },
    ],
  },
];

export interface AnsibleHost {
  name: string;
  ip: string;
  environment: 'dev' | 'staging' | 'prod';
  os: string;
  nginx: 'running' | 'stopped' | 'not installed';
  lastRun: string;
}

export const ansibleHosts: AnsibleHost[] = [
  {
    name: 'dev-web-01',
    ip: '192.168.56.101',
    environment: 'dev',
    os: 'Ubuntu 22.04',
    nginx: 'running',
    lastRun: '5 phút trước',
  },
  {
    name: 'staging-web-01',
    ip: '10.0.1.20',
    environment: 'staging',
    os: 'Ubuntu 22.04',
    nginx: 'running',
    lastRun: '2 giờ trước',
  },
  {
    name: 'prod-web-01',
    ip: '10.0.2.10',
    environment: 'prod',
    os: 'Ubuntu 24.04',
    nginx: 'running',
    lastRun: '1 ngày trước',
  },
  {
    name: 'prod-web-02',
    ip: '10.0.2.11',
    environment: 'prod',
    os: 'Ubuntu 24.04',
    nginx: 'stopped',
    lastRun: '1 ngày trước',
  },
];

export interface PlaybookInfo {
  file: string;
  name: string;
  purpose: string;
  hosts: string;
  command: string;
}

export const playbooks: PlaybookInfo[] = [
  {
    file: 'playbooks/webserver.yml',
    name: 'Web Server Setup',
    purpose: 'Cài Nginx, cấu hình reverse proxy, deploy ứng dụng và kiểm tra /healthz',
    hosts: 'webservers',
    command: 'ansible-playbook playbooks/webserver.yml -i inventory/dev.ini',
  },
  {
    file: 'playbooks/deploy.yml',
    name: 'Container Deploy',
    purpose: 'Kéo image mới từ GHCR, khởi động lại container, xác nhận trạng thái',
    hosts: 'webservers',
    command: 'ansible-playbook playbooks/deploy.yml -i inventory/prod.ini',
  },
];

/** Các khái niệm chính trong bài 6 và bài 7 */
export interface Concept {
  term: string;
  description: string;
  details: string[];
  icon: 'git' | 'build' | 'test' | 'deploy' | 'inventory' | 'playbook' | 'module' | 'role';
}

export const bai6Concepts: Concept[] = [
  {
    term: 'CI — Continuous Integration',
    description: 'Tích hợp mã nguồn liên tục, phát hiện lỗi sớm',
    details: [
      'Developer commit code lên Git repository',
      'Jenkins phát hiện thay đổi qua webhook / polling',
      'Build + chạy test tự động ngay khi có commit',
      'Phát hiện lỗi sớm trước khi merge',
    ],
    icon: 'git',
  },
  {
    term: 'CD — Continuous Delivery / Deployment',
    description: 'Triển khai phần mềm nhanh chóng, an toàn',
    details: [
      'Artifact đã test được promote lên staging',
      'Deploy production tự động hoặc bằng một cú nhấp',
      'Thông báo kết quả cho nhóm phát triển',
    ],
    icon: 'deploy',
  },
  {
    term: 'Jenkins',
    description: 'Nền tảng tự động hóa mã nguồn mở',
    details: [
      'Miễn phí, mạnh mẽ, hệ sinh thái plugin rất lớn',
      'Hỗ trợ nhiều nền tảng: Linux, Windows, macOS',
      'Tích hợp pipeline dạng khai báo (Jenkinsfile)',
    ],
    icon: 'build',
  },
  {
    term: 'So sánh công cụ CI/CD',
    description: 'Jenkins, GitLab CI/CD, GitHub Actions, CircleCI',
    details: [
      'Jenkins: mã nguồn mở, nhiều plugin, tự quản lý',
      'GitLab CI/CD: tích hợp sẵn, quản lý qua gitlab-ci.yml',
      'GitHub Actions: chạy ngay trên GitHub, YAML workflow',
      'CircleCI, Travis CI: giải pháp SaaS',
    ],
    icon: 'test',
  },
];

export const bai7Concepts: Concept[] = [
  {
    term: 'Ansible',
    description: 'Công cụ tự động hóa cấu hình mã nguồn mở',
    details: [
      'Agentless — không cần cài phần mềm trên máy đích',
      'Kết nối bằng SSH',
      'Cấu hình bằng YAML (playbook)',
    ],
    icon: 'module',
  },
  {
    term: 'Inventory',
    description: 'Danh sách máy chủ cần quản lý',
    details: [
      'Khai báo host, nhóm host (webservers, prod…)',
      'Biến riêng cho từng máy: IP, user, port',
      'Tách file theo môi trường: dev.ini / prod.ini',
    ],
    icon: 'inventory',
  },
  {
    term: 'Playbook',
    description: 'File YAML định nghĩa tác vụ',
    details: [
      'Khai báo hosts, biến, quyền (become)',
      'Gọi role và định nghĩa task',
      'Chạy bằng: ansible-playbook <file>',
    ],
    icon: 'playbook',
  },
  {
    term: 'Modules',
    description: 'Thư viện chức năng sẵn có',
    details: [
      'apt, file, template, service, copy, uri…',
      'Mỗi module là một chức năng cụ thể',
      'Có sẵn trong Ansible, không cần viết code',
    ],
    icon: 'module',
  },
  {
    term: 'Roles',
    description: 'Tổ chức playbook thành cấu trúc dễ quản lý',
    details: [
      'tasks/ — các bước thực hiện',
      'handlers/ — hành động khi có thay đổi',
      'templates/ — file cấu hình có biến Jinja2',
      'defaults/ — biến mặc định',
    ],
    icon: 'role',
  },
  {
    term: 'Tasks',
    description: 'Các bước cần thực hiện trên máy đích',
    details: [
      'Idempotent — chạy lại nhiều lần vẫn đúng',
      'Có thể dùng tag để chọn nhóm chạy',
      'Báo cáo kết quả ok / changed / failed',
    ],
    icon: 'test',
  },
];
