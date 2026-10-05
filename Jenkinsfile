pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        HUSKY = '0'
        CI = 'true'
        npm_config_audit = 'false'
        npm_config_fund = 'false'
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
                echo ">>> Cài dependencies (npm ci)"
                sh 'npm ci'
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
    }
}
