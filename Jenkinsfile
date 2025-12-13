pipeline {
    agent any

    environment {
        GOCACHE = '/tmp/go-build-cache'
        SONARQUBE_URL = 'http://84.237.53.137:8009'
        SONARQUBE_TOKEN = credentials('2e132c76-a1b4-4f0e-ab4f-93c9dc12d2d1')
    }

    stages {
        stage('Build') {
            parallel {
                stage('Build backend auth') {
                    agent {
                        docker {
                            image 'golang:1.24'
                        }
                    }

                    steps {
                        sh 'cd backend && go build -o main cmd/main.go'
                    }
                }

                stage('Build frontend') {
                    agent {
                        docker {
                            image 'oven/bun:1'
                        }
                    }

                    steps {
                        sh 'cd frontend && bun install --frozen-lockfile'
                        sh 'cd frontend && bun run build'
                    }
                }
            }
        }

        stage('Sonar Analysis') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli:latest'
                }
            }

            steps {
                script {
                    sh """
                        cd backend &&
                        sonar-scanner \\
                        -Dsonar.projectKey=backend-auth \\
                        -Dsonar.sources=auth \\
                        -Dsonar.host.url=${SONARQUBE_URL} \\
                        -Dsonar.login=${SONARQUBE_TOKEN}
                    """
                }

                script {
                    sh """
                        cd frontend &&
                        sonar-scanner \\
                        -Dsonar.projectKey=frontend \\
                        -Dsonar.sources=src \\
                        -Dsonar.host.url=${SONARQUBE_URL} \\
                        -Dsonar.login=${SONARQUBE_TOKEN}
                    """
                }
            }
        }
    }
}
