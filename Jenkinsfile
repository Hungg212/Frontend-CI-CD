pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        HUSKY         = '0'
        CI            = 'true'
        APP_NAME      = 'coffee-home-blend'
        // Thư mục deploy trên server (sẽ dùng cho nginx + ansible)
        DEPLOY_DIR    = '/var/www/coffee-home-blend'
    }

    triggers {
        // Poll SCM mỗi 5 phút nếu repo không có webhook GitHub
        pollSCM('H/5 * * * *')
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
                sh 'npm ci'
                sh 'node -v && npm -v'
            }
        }

        stage('Type Check') {
            steps { sh 'npm run type-check' }
        }

        stage('Lint') {
            steps { sh 'npm run lint' }
        }

        stage('Test') {
            steps { sh 'npm run test' }
        }

        stage('Build') {
            steps {
                // Vite đọc VITE_* từ env lúc build
                sh 'npm run build'
                sh 'du -sh dist && ls -lh dist/assets | head -15'
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Deploy to Staging') {
            when { branch 'main' }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        rsync -avz --delete \
                            -e "ssh -o StrictHostKeyChecking=no" \
                            dist/ ubuntu@${STAGING_HOST}:${DEPLOY_DIR}/
                    """
                }
            }
        }
    }

    post {
        success { echo "✅ Build thành công! Commit: ${env.GIT_COMMIT}" }
        failure { echo "❌ Build thất bại! Commit: ${env.GIT_COMMIT}" }
    }
}
