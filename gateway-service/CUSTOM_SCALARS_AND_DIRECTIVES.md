# Custom Scalar Types and Directives

This document provides detailed information about the custom scalar types and directives available in the GraphQL Gateway Service.

## Table of Contents

1. [Custom Scalar Types](#custom-scalar-types)
   - [DateTime](#datetime)
   - [LocalDate](#localdate)
   - [UUID](#uuid)
   - [URL](#url)
   - [JSON](#json)

2. [Custom Directives](#custom-directives)
   - [@uppercase](#uppercase)
   - [@auth](#auth)
   - [@cacheControl](#cachecontrol)

3. [Implementation Details](#implementation-details)
   - [Adding New Scalar Types](#adding-new-scalar-types)
   - [Creating Custom Directives](#creating-custom-directives)
   - [Testing Custom Types and Directives](#testing-custom-types-and-directives)

## Custom Scalar Types

### DateTime

Handles date and time values in ISO-8601 format.

**Example Schema Definition:**
```graphql
scalar DateTime

type Performance {
  id: ID!
  startTime: DateTime!
  endTime: DateTime!
}
```

**Example Query:**
```graphql
query GetPerformance($id: ID!) {
  performance(id: $id) {
    id
    startTime  # Returns: "2025-05-19T20:00:00Z"
    endTime    # Returns: "2025-05-19T22:30:00Z"
  }
}
```

### LocalDate

Handles date-only values (without time).

**Example Schema Definition:**
```graphql
scalar LocalDate

type Event {
  id: ID!
  date: LocalDate!
  description: String
}
```

**Example Query:**
```graphql
query GetEvent($id: ID!) {
  event(id: $id) {
    id
    date  # Returns: "2025-05-19"
  }
}
```

### UUID

Handles UUID strings.

**Example Schema Definition:**
```graphql
scalar UUID

type User {
  id: UUID!
  name: String!
  email: String
}
```

**Example Query:**
```graphql
query GetUser($id: UUID!) {
  user(id: $id) {
    id     # Returns: "123e4567-e89b-12d3-a456-426614174000"
    name
  }
}
```

### URL

Validates and handles URL strings.

**Example Schema Definition:**
```graphql
scalar URL

type Resource {
  id: ID!
  url: URL!
  type: String!
}
```

### JSON

Handles arbitrary JSON objects.

**Example Schema Definition:**
```graphql
scalar JSON

type Configuration {
  id: ID!
  settings: JSON!
  version: String!
}
```

## Custom Directives

### @uppercase

Converts string fields to uppercase.

**Example Schema Definition:**
```graphql
directive @uppercase on FIELD_DEFINITION

type Query {
  greeting: String @uppercase
  user(id: ID!): User
}

type User {
  id: ID!
  name: String @uppercase
  email: String
}
```

**Example Query:**
```graphql
query {
  greeting  # Returns: "HELLO, WORLD!"
  user(id: "1") {
    name     # Returns: "JOHN DOE" if stored as "John Doe"
    email    # Not affected by @uppercase
  }
}
```

### @auth

Implements role-based access control.

**Example Schema Definition:**
```graphql
directive @auth(role: String!) on FIELD_DEFINITION

type Query {
  adminDashboard: Dashboard! @auth(role: "ADMIN")
  userProfile: Profile! @auth(role: "USER")
  publicData: String
}
```

**Example Usage:**
```graphql
# This query will only work if the user has the ADMIN role
query GetAdminData {
  adminDashboard {
    metrics
    users
  }
}
```

### @cacheControl

Controls HTTP caching behavior.

**Example Schema Definition:**
```graphql
directive @cacheControl(
  maxAge: Int!
  scope: CacheControlScope = PUBLIC
) on FIELD_DEFINITION | OBJECT | INTERFACE

enum CacheControlScope {
  PUBLIC
  PRIVATE
}

type Query {
  publicContent: String @cacheControl(maxAge: 3600, scope: PUBLIC)
  privateData: String @cacheControl(maxAge: 300, scope: PRIVATE)
}
```

**Headers Set:**
- For public content: `Cache-Control: public, max-age=3600`
- For private data: `Cache-Control: private, max-age=300`

## Implementation Details

### Adding New Scalar Types

1. Create a new class that implements `graphql.schema.Coercing<T, S>`:

```java
public class CustomScalarType {
    public static final GraphQLScalarType CUSTOM = GraphQLScalarType.newScalar()
            .name("Custom")
            .description("Custom scalar type description")
            .coercing(new Coercing<CustomType, String>() {
                @Override
                public String serialize(Object dataFetcherResult) {
                    // Convert CustomType to String
                    return dataFetcherResult.toString();
                }

                @Override
                public CustomType parseValue(Object input) {
                    // Convert String to CustomType
                    return CustomType.fromString((String) input);
                }


                @Override
                public CustomType parseLiteral(Object input) {
                    if (input instanceof StringValue) {
                        return CustomType.fromString(((StringValue) input).getValue());
                    }
                    return null;
                }
            })
            .build();
}
```

2. Register the scalar in `GraphQLConfig`:

```java
@Configuration
public class GraphQLConfig {
    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
                .scalar(CustomScalarType.CUSTOM);
    }
}
```

### Creating Custom Directives

1. Implement the `SchemaDirectiveWiring` interface:

```java
public class CustomDirective implements SchemaDirectiveWiring {
    @Override
    public GraphQLFieldDefinition onField(SchemaDirectiveWiringEnvironment<GraphQLFieldDefinition> env) {
        GraphQLFieldDefinition field = env.getElement();
        GraphQLFieldsContainer parentType = env.getFieldsContainer();
        
        // Get the original data fetcher
        DataFetcher<?> originalFetcher = env.getCodeRegistry().getDataFetcher(parentType, field);
        
        // Create a new data fetcher that wraps the original
        DataFetcher<?> customFetcher = DataFetcherFactories.wrapDataFetcher(
            originalFetcher,
            (dataFetchingEnvironment, value) -> {
                // Apply custom logic here
                if (value instanceof String) {
                    return "Processed: " + value;
                }
                return value;
            }
        );
        
        // Update the code registry
        env.getCodeRegistry().dataFetcher(parentType, field, customFetcher);
        return field;
    }
}
```

2. Register the directive in `GraphQLConfig`:

```java
@Configuration
public class GraphQLConfig {
    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
                .directive("custom", new CustomDirective());
    }
}
```

3. Add the directive to your schema:

```graphql
directive @custom on FIELD_DEFINITION

type Query {
  someField: String @custom
}
```

### Testing Custom Types and Directives

1. **Unit Tests**:

```java
@SpringBootTest
public class CustomScalarTest {
    
    @Autowired
    private GraphQL graphQL;
    
    @Test
    public void testCustomScalar() {
        String query = "{ someField }"
        ExecutionResult result = graphQL.execute(query);
        
        // Assert the result
        assertThat(result.getErrors()).isEmpty();
        // Add more assertions
    }
}
```

2. **Integration Tests**:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
public class CustomDirectiveIntegrationTest {
    
    @Autowired
    private WebTestClient webTestClient;
    
    @Test
    public void testDirective() {
        String query = "{ someField @custom }"
        
        webTestClient.post()
            .uri("/graphql")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("{\"query\":\"" + query + "\"}")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.data.someField").isEqualTo("expected value");
    }
}
```

## Best Practices

1. **Documentation**: Always document your custom types and directives with examples.
2. **Validation**: Add proper validation in your coercing methods.
3. **Error Handling**: Provide meaningful error messages for parsing failures.
4. **Performance**: Be mindful of performance when implementing complex directives.
5. **Testing**: Write comprehensive tests for all custom types and directives.

## Troubleshooting

1. **Type System Errors**: Ensure all custom types are properly registered in the schema.
2. **Directive Not Applied**: Verify the directive is correctly registered in `GraphQLConfig`.
3. **Parsing Issues**: Check the input format matches what your scalar expects.
4. **Null Values**: Handle null values appropriately in your coercing methods.
