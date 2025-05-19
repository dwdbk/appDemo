# Keycloak Authentication Setup

This guide explains how to set up and test the Keycloak authentication in the gateway service.

## Prerequisites

1. Keycloak server running (default: http://localhost:8085)
2. A realm created in Keycloak (default: `opera-realm`)
3. A client created in the realm with:
   - Client ID: `opera-gateway`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:8080/*`
   - Web Origins: `*`
   - Enabled: `ON`

## Configuration

Update the following environment variables in `application.yml` or set them as system environment variables:

```yaml
KEYCLOAK_AUTH_SERVER_URL: http://localhost:8085/auth
KEYCLOAK_REALM: opera-realm
KEYCLOAK_CLIENT_ID: opera-gateway
KEYCLOAK_CLIENT_SECRET: your-client-secret
```

## Testing the Authentication

1. Start the gateway service
2. Access the following endpoints:

### Public Endpoints (No Authentication Required)
- `GET /actuator/health` - Health check
- `GET /actuator/info` - Application info
- `GET /swagger-ui/` - Swagger UI
- `GET /v3/api-docs` - OpenAPI documentation
- `GET /graphiql` - GraphiQL interface
- `GET /graphql` - GraphQL endpoint

### Protected Endpoints (Authentication Required)
- `GET /api/auth/user` - Get current user info
- Any other endpoint not listed above

### Login/Logout
- `GET /oauth2/authorization/keycloak` - Initiate login
- `GET /logout` - Logout

## Testing with curl

1. Get an access token:
```bash
curl -X POST 'http://localhost:8085/realms/opera-realm/protocol/openid-connect/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=opera-gateway' \
  --data-urlencode 'client_secret=your-client-secret' \
  --data-urlencode 'grant_type=password' \
  --data-urlencode 'username=user' \
  --data-urlencode 'password=password'
```

2. Use the access token to access protected endpoints:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:8080/api/auth/user
```

## Troubleshooting

1. If you get CORS errors, ensure the Keycloak client has the correct Web Origins setting (`*` for development)
2. If authentication fails, check the logs for detailed error messages
3. Verify that the Keycloak server is accessible from the gateway service
4. Ensure the client secret matches the one in Keycloak

## Security Considerations

1. Never commit sensitive information like client secrets to version control
2. Use HTTPS in production
3. Configure proper CORS settings for production
4. Rotate client secrets regularly
5. Implement proper token expiration and refresh mechanisms
