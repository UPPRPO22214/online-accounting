pipeline {
    agent any

    stages {
        stage('Build') {
            parallel {
                stage('Build backend auth') {
                    agent {
                        docker {
                            image 'golang:1.24'
                            args '-v $PWD/backend/auth:/app -w /app' 
                        }
                    }

                    steps {
                        sh 'go build -o main cmd/service/main.go'
                    }
                }

                stage('Build frontend') {
                    agent {
                        docker {
                            image 'oven/bun:1'
                            args '-v $PWD/frontend:/app -w /app'
                        }
                    }

                    steps {
                        sh 'bun run build'
                    }
                }
            }
        }
    }
}
