package com.opera.gateway.config;

import com.apollographql.federation.graphqljava.Federation;
import com.apollographql.federation.graphqljava.SchemaTransformer;
import graphql.schema.GraphQLSchema;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

@Configuration
public class GraphQLConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> {
            // Add any custom scalar types or directives here
        };
    }

    @Bean
    public GraphQLSchema customSchema(GraphQLSchema schema) {
        return Federation.transform(schema)
                .fetchEntities(env -> null) // Will be implemented with data fetchers
                .resolveEntityType(env -> null) // Will be implemented with type resolvers
                .build();
    }
}
