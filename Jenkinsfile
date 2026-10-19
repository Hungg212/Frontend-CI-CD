// Coffee Home Blend — Frontend CI/CD Pipeline
// Build static (Vite) → upload lên Nginx root

pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        HUSKY            = '0'
        CI               = 'true'
        APP_NAME         = 'coffee-home-blend-frontend'
        IMAGE_TAG        = "${env.GIT_COMMIT?.take(7) ?: 'latest'}"
        ANSIBLE_REPO     = 'https://github.com/Hungg212/coffee-home-blend-infra.git'
        ANSIBLE_DIR      = 'infra/ansible'
        DEPLOY_ENV       = 'dev'           // dev | staging | prod
        SSH_USER         = 'deploy'
        STATIC_DIR       = '/var/www/coffee-home-blend'
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --pretty="%h %an %s"'
            }
        }

        stage('Install') {
            steps {
                sh 'node -v && npm -v'
                sh 'npm ci'
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
                sh 'npm run build'
                sh 'du -sh dist && ls -lh dist/assets | head -15'
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Deploy Static (via Ansible)') {
            when { anyOf { branch 'main'; branch 'develop' } }
            steps {
                dir('infra-ansible') {
                    git branch: 'main', url: ANSIBLE_REPO, credentialsId: 'github-ssh'
                }
                sshagent(['vps-ssh-key']) {
                    sh """
                        set -e
                        cd ${ANSIBLE_DIR}
                        ansible-playbook -i inventories/${DEPLOY_ENV}.ini \
                            playbooks/deploy-frontend.yml \
                            -e "static_artifact=${WORKSPACE}/dist \
                                static_target=${STATIC_DIR} \
                                deploy_user=${SSH_USER}" \
                            --diff
                    """
                }
            }
        }
    }

    post {
        success { echo "✅ Frontend deployed! Commit: ${env.GIT_COMMIT} → env=${DEPLOY_ENV}" }
        failure { echo "❌ Frontend pipeline thất bại! Commit: ${env.GIT_COMMIT}" }
        always  { cleanWs(deleteDirs: true, patterns: [[pattern: 'node_modules/**', type: 'INCLUDE']]) }
    }
}
