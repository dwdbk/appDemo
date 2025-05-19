# API Gateway Service

This is the API Gateway service for the Opera Management System, built with Spring Cloud Gateway and Apollo Federation.

## Features

- **Custom Scalar Types**
  - `DateTime` - For date and time values
  - `LocalDate` - For date-only values
  - `UUID` - For universally unique identifiers
  - `URL` - For URL strings
  - `JSON` - For arbitrary JSON objects

- **Custom Directives**
  - `@uppercase` - Transforms string fields to uppercase
  - `@auth(role: String!)` - Implements role-based access control
  - `@cacheControl(maxAge: Int!, public: Boolean)` - Controls HTTP caching behavior

## Custom Scalar Types

The gateway includes several custom scalar types to handle specific data formats:

### 1. DateTime
Handles date and time values in ISO-8601 format.

**Example:**
```graphql
scalar DateTime

type Performance {
  id: ID!
  startTime: DateTime!
  endTime: DateTime!
}
```

### 2. LocalDate
Handles date-only values (without time).

**Example:**
```graphql
scalar LocalDate

type Event {
  id: ID!
  date: LocalDate!
}
```

### 3. UUID
Handles UUID strings.

**Example:**
```graphql
scalar UUID

type User {
  id: UUID!
  name: String!
}
```

## Custom Directives

### 1. @uppercase
Converts string fields to uppercase.

**Example:**
```graphql
type Query {
  userName: String @uppercase
}
```

### 2. @auth
Implements role-based access control.

**Example:**
```graphql
type Query {
  adminData: String @auth(role: "ADMIN")
  userProfile: UserProfile @auth(role: "USER")
}
```

### 3. @cacheControl
Controls HTTP caching behavior.

**Example:**
```graphql
type Query {
  publicData: String @cacheControl(maxAge: 3600, public: true)
  privateData: String @cacheControl(maxAge: 300)
}
```

## Extending with Custom Types and Directives

To add new custom scalar types or directives:

1. **For Scalar Types**:
   - Create a class that implements `graphql.schema.Coercing`
   - Register it in `GraphQLConfig`

2. **For Directives**:
   - Create a class that implements `graphql.schema.idl.SchemaDirectiveWiring`
   - Register it in `GraphQLConfig`
   - Add the directive definition to your schema

Example of a custom scalar type implementation:

```java
public class LocalDateScalar {
    public static final GraphQLScalarType LOCAL_DATE = GraphQLScalarType.newScalar()
            .name("LocalDate")
            .description("Local Date scalar")
            .coercing(new Coercing<LocalDate, String>() {
                // Implementation details...
            })
            .build();
}
```

Example of a custom directive implementation:

```java
public class UppercaseDirective implements SchemaDirectiveWiring {
    @Override
    public GraphQLFieldDefinition onField(SchemaDirectiveWiringEnvironment<GraphQLFieldDefinition> env) {
        // Implementation details...
    }
}
```

## Prerequisites

- Java 17 or higher
- Maven 3.6.3 or higher
- PostgreSQL 13 or higher
- Node.js 14+ (for GraphQL Playground)

## Services

The gateway connects the following services:

1. **Opera Service** - Manages operas, acts, scenes, characters, music, and decors
   - Port: 8081
   - GraphQL Endpoint: http://localhost:8081/graphql

2. **Shows Service** - Manages shows and singers
   - Port: 8082
   - GraphQL Endpoint: http://localhost:8082/graphql

3. **Gateway Service** - API Gateway with Apollo Federation
   - Port: 8080
   - GraphQL Playground: http://localhost:8080/playground

## Running the Services

### 1. Start PostgreSQL

Make sure PostgreSQL is running and create the following databases:

```sql
CREATE DATABASE opera_db;
CREATE DATABASE shows_db;
```

### 2. Build and Run the Services

Open separate terminal windows for each service and run:

```bash
# Opera Service
cd opera-service
mvn spring-boot:run

# Shows Service
cd shows-service
mvn spring-boot:run

# Gateway Service
cd gateway-service
mvn spring-boot:run
```

### 3. Access the Services

- **GraphQL Playground**: http://localhost:8080/playground
- **Opera Service API**: http://localhost:8080/opera/**
- **Shows Service API**: http://localhost:8080/shows/**

## GraphQL Federation

The gateway uses Apollo Federation to combine the schemas from both services. Here's an example query that fetches data from both services:

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

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | Database URL | `jdbc:postgresql://localhost:5432/opera_db` or `shows_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `postgres` |
| `SERVER_PORT` | Service port | `8080` (gateway), `8081` (opera), `8082` (shows) |

## Development

### Building the Project

```bash
mvn clean install
```

### Running Tests

```bash
mvn test
```

### Code Style

The project uses Google Java Format. You can format the code using:

```bash
mvn spotless:apply
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
