I've successfully set up Keycloak authentication for your gateway service. Here's a summary of the changes made:

Keycloak JWT Configuration:
Created KeycloakJwtConfig to handle JWT authentication with Keycloak
Configured JWT token conversion with proper role mapping
Security Configuration:
Updated SecurityConfig to use the new JWT configuration
Configured CORS for cross-origin requests
Set up OAuth2 login and resource server
Protected endpoints based on authentication status
Authentication Controller:
Added /api/auth/user endpoint to retrieve current user information
Included user details like username, email, roles, and token
Application Configuration:
Updated application.yml with Keycloak and OAuth2 settings
Added JWT resource server configuration
Configured proper scopes and token validation
Documentation:
Created README-AUTH.md with setup and testing instructions
Included examples for testing with curl
To test the authentication:

Ensure Keycloak is running at http://localhost:8085
Create a realm and client in Keycloak as described in the README
Start the gateway service
Access /api/auth/user to test authentication
Use the provided curl commands to test with tokens
The service is now secured with Keycloak authentication, and you can access user information through the /api/auth/user endpoint. The setup includes proper CORS configuration and token relay to downstream services.