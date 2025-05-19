package com.opera.shows.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Component
@ControllerAdvice
public class GlobalExceptionHandler extends DataFetcherExceptionResolverAdapter {
    
    @Override
    protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {
        if (ex instanceof EntityNotFoundException) {
            return toGraphQLError(ex, "Not Found", ErrorType.NOT_FOUND, env);
        } else if (ex instanceof DataIntegrityViolationException) {
            return toGraphQLError(ex, "Data integrity violation", ErrorType.BAD_REQUEST, env);
        } else if (ex instanceof IllegalArgumentException) {
            return toGraphQLError(ex, "Invalid input", ErrorType.BAD_REQUEST, env);
        } else if (ex instanceof IllegalStateException) {
            return toGraphQLError(ex, "Invalid operation", ErrorType.BAD_REQUEST, env);
        }
        
        // For all other exceptions, return INTERNAL_ERROR
        return toGraphQLError(ex, "An unexpected error occurred", ErrorType.INTERNAL_ERROR, env);
    }
    
    private GraphQLError toGraphQLError(Throwable ex, String message, ErrorType errorType, DataFetchingEnvironment env) {
        Map<String, Object> extensions = new HashMap<>();
        
        // Add more details for debugging (in production, you might want to limit this)
        if (ex != null) {
            extensions.put("error", ex.getClass().getSimpleName());
            extensions.put("message", ex.getMessage());
        }
        
        return GraphqlErrorBuilder.newError(env)
                .message(message)
                .errorType(errorType)
                .extensions(extensions)
                .build();
    }
}
