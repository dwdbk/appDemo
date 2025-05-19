# Opera Management System

A microservices-based system for managing opera shows, built with Spring Boot, GraphQL, and Apollo Federation.

## Architecture

The system consists of three main services:

1. **API Gateway** (Port 8080)
   - Routes requests to appropriate services
   - Implements GraphQL Federation
   - Handles cross-cutting concerns (auth, caching, etc.)

2. **Opera Service** (Port 8081)
   - Manages operas, acts, scenes, and characters
   - Handles opera-related data and metadata

3. **Shows Service** (Port 8082)
   - Manages show schedules and performances
   - Handles ticketing and availability

## Features

- **GraphQL API** with Apollo Federation
- **Custom Scalar Types** for rich data handling
- **Custom Directives** for cross-cutting concerns
- **Database Migrations** with Liquibase
- **Containerized** with Docker
- **API Documentation** with GraphQL Playground

## Prerequisites

- Java 17 or higher
- Maven 3.6.3 or higher
- PostgreSQL 13 or higher
- Docker (optional, for containerized deployment)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd appdemo
```

### 2. Set Up Databases

Create the required PostgreSQL databases:

```sql
CREATE DATABASE opera_db;
CREATE DATABASE shows_db;
```

### 3. Configure Application Properties

Update the database credentials in each service's `application.yml` if needed.

### 4. Build and Run Services

Run each service in a separate terminal:

```bash
# Build all services
mvn clean install

# Run Opera Service
cd opera-service
mvn spring-boot:run

# In a new terminal
cd shows-service
mvn spring-boot:run

# In another terminal
cd gateway-service
mvn spring-boot:run
```

### 5. Access the Application

- **GraphQL Playground**: http://localhost:8080/playground
- **Opera Service API**: http://localhost:8080/opera/graphql
- **Shows Service API**: http://localhost:8080/shows/graphql

## GraphQL Federation

The system uses Apollo Federation to combine multiple GraphQL services into a single API. The gateway service acts as the federated gateway.

### Example Federated Query

```graphql
query GetOperaWithShows($operaId: ID!) {
  opera(id: $operaId) {
    id
    title
    composer
    shows {
      id
      startTime
      endTime
      venue
      singers {
        id
        firstName
        lastName
        role
      }
    }
  }
}
```

## Custom Scalar Types

The system includes several custom scalar types:

- `DateTime` - For date and time values
- `LocalDate` - For date-only values
- `UUID` - For universally unique identifiers
- `URL` - For URL strings
- `JSON` - For arbitrary JSON objects

## Custom Directives

### @uppercase
Converts string fields to uppercase.

**Example:**
```graphql
type Query {
  userName: String @uppercase
}
```

### @auth
Implements role-based access control.

**Example:**
```graphql
type Query {
  adminData: String @auth(role: "ADMIN")
  userProfile: UserProfile @auth(role: "USER")
}
```

### @cacheControl
Controls HTTP caching behavior.

**Example:**
```graphql
type Query {
  publicData: String @cacheControl(maxAge: 3600, public: true)
  privateData: String @cacheControl(maxAge: 300)
}
```

## Database Migrations

Database schema changes are managed using Liquibase. Migration files are located in the `src/main/resources/db/changelog` directory of each service.

### Running Migrations

Migrations are automatically applied when the application starts. To manually apply migrations:

```bash
mvn liquibase:update
```

## Deployment

### Docker

Build and run using Docker Compose:

```bash
docker-compose up --build
```

### Kubernetes

Deploy to Kubernetes using the provided manifests in the `k8s` directory.

## Testing

Run tests for all services:

```bash
mvn test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Spring Boot Team
- Apollo GraphQL Team
- PostgreSQL Team
