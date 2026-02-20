# ---- Build Stage ----
FROM golang:1.23-alpine AS build
RUN apk add --no-cache git
WORKDIR /app
COPY go.mod ./
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

# ---- Run Stage ----
FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=build /server .
COPY migrations ./migrations
EXPOSE 3006
CMD ["./server"]
