const authConfig = {
    domain: 'rtest.authz.cloudentity.io', // e.g. 'example.demo.cloudentity.com.' Recommended; always generates URLs with 'https' protocol.
     // baseUrl: optional alternative to 'domain.' Protocol required, e.g. 'https://example.demo.cloudentity.com.'
     // In situations where protocol may dynamically resolve to 'http' rather than 'https' (for example in dev mode), use 'baseUrl' rather than 'domain'.
     tenantId: 'rtest',
     authorizationServerId: 'ce-dev-playground-integrations',
     clientId: 'c7e6u0eer3qh0m4pggig',
     redirectUri: 'http://localhost:3000/',
     silentAuthRedirectUri: 'window.location.href' + '/silent', // optional setting to redirect to a different endpoint following successful silent auth flow
     userInfoUri: 'https://rtest.authz.cloudentity.io/rtest/ce-dev-playground-integrations/userinfo', // optional, for fetching user info via API
     scopes: ['profile', 'email', 'openid'], // 'revoke_tokens' scope must be present for 'logout' action to revoke token! Without it, token will only be deleted from browser's local storage.
     letClientSetAccessToken: true,
     accessTokenName: 'ins_demo_access_token', // optional; defaults to '{tenantId}_{authorizationServerId}_access_token'
     idTokenName: 'ins_demo_id_token', // optional; defaults to '{tenantId}_{authorizationServerId}_id_token'
 
 };

 export default authConfig; 

 