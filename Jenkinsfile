pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        // Tắt husky vì CI không cần git hooks
        HUSKY = '0'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --pretty="%h %an %s"'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Cache ~/.npm để lần build sau cài nhanh hơn
                cache(cachePath: '~/.npm', cacheId: 'npm-coffee-home-blend') {
                    sh 'npm ci --no-audit --no-fund'
                }
                sh 'node -v && npm -v'
            }
        }

        stage('Type Check') {
            steps {
                echo ">>> Kiểm tra kiểu dữ liệu TypeScript"
                sh 'npm run type-check'
            }
        }

        stage('Lint') {
            steps {
                echo ">>> Kiểm tra chất lượng code"
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                echo ">>> Chạy unit test"
                sh 'npm run test'
            }
        }

        stage('Build') {
            steps {
                echo ">>> Build production bundle"
                sh 'npm run build'
                sh 'du -sh dist && ls -lh dist/assets | head -15'
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo ">>> Lưu trữ kết quả build"
                archiveArtifacts artifacts: 'dist/**', fingerprint: true, allowEmptyArchive: false
            }
        }
    }

    post {
        success {
            echo "✅ Build thành công! Commit: ${env.GIT_COMMIT}"
        }
        failure {
            echo "❌ Build thất bại! Commit: ${env.GIT_COMMIT}"
        }
        always {
            cleanWs()
        }
    }
}
