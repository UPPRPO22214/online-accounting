pipeline {
    agent any

    environment {
        GOCACHE = '/tmp/go-build-cache'
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
                        sh 'cd backend/auth && go build -o main cmd/service/main.go'
                    }
                }

                stage('Build frontend') {
                    agent {
                        docker {
                            image 'oven/bun:latest'
                        }
                    }

                    steps {
                        sh 'cd frontend && bun run build'
                    }
                }
            }
        }
    }
}
