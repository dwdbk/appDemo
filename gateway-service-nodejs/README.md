# Gateway Service (Node.js)

A high-performance, production-ready Node.js API Gateway service that handles authentication, request routing, service aggregation, and observability for a microservices architecture.

## 🌟 Features

- **Authentication & Authorization**
  - JWT-based authentication with Keycloak
  - Role-based access control (RBAC)
  - Token validation and refresh

- **API Gateway**
  - Dynamic request routing to microservices
  - Request/Response transformation
  - GraphQL and REST API support
  - WebSocket support

- **Security**
  - CORS with fine-grained control
  - Rate limiting and throttling
  - Request validation
  - Helmet security headers
  - CSRF protection

- **Observability**
  - Request/Response logging
  - Distributed tracing with OpenTelemetry
  - Metrics collection (Prometheus)
  - Structured logging (JSON format)
  - Health check endpoints

- **Performance**
  - Response caching with Redis
  - Connection pooling
  - Request/Response compression
  - Load balancing

- **DevOps**
  - Docker and Kubernetes ready
  - Multi-stage builds
  - Health checks
  - Graceful shutdown

- **Monitoring & Alerting**
  - Prometheus metrics endpoint
  - Grafana dashboards
  - Alert manager integration
  - Log aggregation with ELK stack

## 🚀 Prerequisites

- Node.js 18+ and npm 8+
- Docker 20.10+ and Docker Compose 2.0+
- Keycloak 20+ (or compatible OIDC provider)
- Redis 7+ (for caching and rate limiting)
- PostgreSQL 14+ (for Keycloak and services)

## 🛠️ Tech Stack

- **Runtime**: Node.js 18 LTS
- **Framework**: Express.js
- **Authentication**: Keycloak, JWT, OAuth 2.0, OpenID Connect
- **Database**: PostgreSQL, Redis
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions (example config included)
- **Testing**: Jest, Supertest, Mocha, Chai
- **Code Quality**: ESLint, Prettier, Husky, lint-staged
- **Documentation**: OpenAPI (Swagger), JSDoc

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/gateway-service-nodejs.git
   cd gateway-service-nodejs
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development environment**
   ```bash
   # Start all services (Keycloak, Redis, etc.)
   docker-compose -f docker-compose.dev.yml up -d
   
   # Start the gateway service in development mode
   npm run dev
   ```

### Production Deployment

1. **Build the Docker image**
   ```bash
   docker build -t gateway-service:latest .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Kubernetes (using the provided manifests)**
   ```bash
   kubectl apply -f k8s/
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Application environment | `development` | No |
| `PORT` | Server port | `8080` | No |
| `APP_URL` | Base URL of the application | `http://localhost:8080` | No |
| `LOG_LEVEL` | Logging level | `info` | No |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | `*` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `900000` (15 min) | No |
| `RATE_LIMIT_MAX` | Max requests per window | `100` | No |

### Keycloak Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `KEYCLOAK_AUTH_SERVER_URL` | Keycloak server URL | - | Yes |
| `KEYCLOAK_REALM` | Keycloak realm | - | Yes |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID | - | Yes |
| `KEYCLOAK_CLIENT_SECRET` | Keycloak client secret | - | Yes |
| `KEYCLOAK_PUBLIC_KEY` | Keycloak realm public key | - | No |

### Redis Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | - |

### Monitoring Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PROMETHEUS_ENABLED` | Enable Prometheus metrics | `true` |
| `PROMETHEUS_PATH` | Metrics endpoint | `/metrics` |
| `PROMETHEUS_PORT` | Metrics port | `9090` |
| `JAEGER_ENABLED` | Enable Jaeger tracing | `false` |
| `JAEGER_ENDPOINT` | Jaeger collector endpoint | `http://jaeger:14268/api/traces` |

## 📊 Monitoring & Observability

### Metrics (Prometheus)

The service exposes metrics at `/metrics` endpoint. Available metrics include:

- HTTP request duration
- HTTP request count
- Error rates
- Response sizes
- Memory usage
- Event loop lag
- GC statistics

### Logging

Logs are structured in JSON format and include:

- Request/response details
- Error stacks
- Correlation IDs
- User context
- Performance metrics

### Tracing

Distributed tracing is available when `JAEGER_ENABLED=true`:

```bash
# Start Jaeger locally
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:1.40
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test:unit

# Integration tests
npm test:integration

# E2E tests
npm test:e2e

# Test coverage
npm run test:coverage
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check for security vulnerabilities
npm audit
```

## 🚀 Deployment

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Scale services
docker-compose up -d --scale gateway=3

# View logs
docker-compose logs -f
```

### Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# View pods
kubectl get pods -n gateway

# View services
kubectl get svc -n gateway

# View logs
kubectl logs -l app=gateway -n gateway -f
```

## 📚 API Documentation

### OpenAPI (Swagger)

Access the interactive API documentation at:
- `/swagger-ui/` - Swagger UI
- `/v3/api-docs` - OpenAPI JSON

### GraphiQL

Access the GraphiQL interface at `/graphiql`

## 🔐 Security

### Authentication Flows

1. **Client Credentials**
   - For service-to-service authentication
   - Get token: `POST /auth/realms/{realm}/protocol/openid-connect/token`

2. **Authorization Code**
   - For web applications
   - Initiate: `GET /auth/realms/{realm}/protocol/openid-connect/auth`
   - Callback: `POST /auth/realms/{realm}/protocol/openid-connect/token`

3. **Refresh Token**
   - `POST /auth/realms/{realm}/protocol/openid-connect/token` with `grant_type=refresh_token`

### Rate Limiting

- Global rate limit: 100 requests per 15 minutes per IP
- Authentication endpoints: 10 requests per minute per IP
- API endpoints: 1000 requests per minute per authenticated user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Keycloak](https://www.keycloak.org/)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)
- [Docker](https://www.docker.com/)
- [Kubernetes](https://kubernetes.io/)

## License

MIT
