FROM golang:1.25

WORKDIR /app

COPY . .

RUN go build -o auth ./cmd/main.go

EXPOSE 50051

CMD ["./auth"]
