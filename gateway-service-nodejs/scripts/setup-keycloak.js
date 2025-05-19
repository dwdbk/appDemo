const { KeycloakAdminClient } = require('@keycloak/keycloak-admin-client');
require('dotenv').config();

const keycloakConfig = {
  baseUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8085/auth',
  realmName: process.env.KEYCLOAK_REALM || 'opera-realm',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'admin-cli',
  username: process.env.KEYCLOAK_ADMIN || 'admin',
  password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
};

const clientConfig = {
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'opera-gateway',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'your-client-secret',
  redirectUris: [
    process.env.APP_URL ? `${process.env.APP_URL}/*` : 'http://localhost:8080/*',
  ],
  webOrigins: [
    process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  ].flat(),
};

async function setupKeycloak() {
  const client = new KeycloakAdminClient({
    baseUrl: keycloakConfig.baseUrl,
    realmName: 'master',
  });

  try {
    // Authenticate
    await client.auth({
      username: keycloakConfig.username,
      password: keycloakConfig.password,
      grantType: 'password',
      clientId: keycloakConfig.clientId,
    });

    console.log('Successfully authenticated with Keycloak');

    // Create or update realm
    const realmExists = (await client.realms.findOne({ realm: keycloakConfig.realmName })) !== null;
    
    if (!realmExists) {
      await client.realms.create({
        realm: keycloakConfig.realmName,
        enabled: true,
        displayName: 'Opera Realm',
        sslRequired: 'external',
        registrationAllowed: true,
        loginWithEmailAllowed: true,
        duplicateEmailsAllowed: false,
        resetPasswordAllowed: true,
        editUsernameAllowed: false,
        bruteForceProtected: true,
      });
      console.log(`Created realm: ${keycloakConfig.realmName}`);
    } else {
      console.log(`Realm ${keycloakConfig.realmName} already exists`);
    }

    // Set realm
    client.setConfig({
      realmName: keycloakConfig.realmName,
    });

    // Create or update client
    const clients = await client.clients.find({ clientId: clientConfig.clientId });
    let clientId;

    if (clients.length === 0) {
      const createdClient = await client.clients.create({
        clientId: clientConfig.clientId,
        name: 'Opera Gateway',
        description: 'Opera Gateway Service',
        enabled: true,
        publicClient: false,
        bearerOnly: false,
        standardFlowEnabled: true,
        implicitFlowEnabled: false,
        directAccessGrantsEnabled: true,
        serviceAccountsEnabled: true,
        authorizationServicesEnabled: true,
        redirectUris: clientConfig.redirectUris,
        webOrigins: clientConfig.webOrigins,
        protocol: 'openid-connect',
        fullScopeAllowed: true,
        clientAuthenticatorType: 'client-secret',
        secret: clientConfig.clientSecret,
      });
      clientId = createdClient.id;
      console.log(`Created client: ${clientConfig.clientId}`);
    } else {
      clientId = clients[0].id;
      await client.clients.update(
        { id: clientId },
        {
          redirectUris: clientConfig.redirectUris,
          webOrigins: clientConfig.webOrigins,
          secret: clientConfig.clientSecret,
        }
      );
      console.log(`Updated client: ${clientConfig.clientId}`);
    }

    console.log('Keycloak setup completed successfully!');
  } catch (error) {
    console.error('Error setting up Keycloak:', error);
    process.exit(1);
  }
}

setupKeycloak();
