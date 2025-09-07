import * as AuthSession from "expo-auth-session";
import React, { useState } from "react";
import { Button, Text, View } from "react-native";

// Twitter OAuth config
const oAuthClientId = "YOUR_TWITTER_CLIENT_ID";
const redirectUri = AuthSession.makeRedirectUri({ scheme: "twitteroauth" });

const discovery = {
  authorizationEndpoint: "https://twitter.com/i/oauth2/authorize",
  tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
};

export default function TwitterAuth() {
  const [token, setToken] = useState<AuthSession.TokenResponse | null>(null);

  // start auth flow
  const handleLogin = async () => {
    const authRequest = new AuthSession.AuthRequest({
      clientId: oAuthClientId,
      redirectUri,
      scopes: ["tweet.read", "users.read", "tweet.write", "offline.access"],
      responseType: "code",
      usePKCE: true,
    });

    // Load endpoints
    await authRequest.promptAsync(discovery).then(async (res) => {
      if (res.type === "success" && res.params.code) {
        // Exchange code for access token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: oAuthClientId,
            code: res.params.code,
            redirectUri,
            extraParams: {
              code_verifier: authRequest.codeVerifier || "",
            },
          },
          discovery
        );
        setToken(tokenResponse);
        console.log("Token Response:", tokenResponse);
      }
    });
  };

  const handleRefresh = async () => {
    if (!token?.refreshToken) return;
    const refreshed = await AuthSession.refreshAsync(
      {
        clientId: oAuthClientId,
        refreshToken: token.refreshToken,
      },
      discovery
    );
    setToken(refreshed);
    console.log("Refreshed Token:", refreshed);
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Login with Twitter" onPress={handleLogin} />
      <Button title="Refresh Token" onPress={handleRefresh} />

      {token && (
        <View style={{ marginTop: 20 }}>
          <Text>Access Token: {token.accessToken}</Text>
          <Text>Refresh Token: {token.refreshToken}</Text>
          <Text>Expires In: {token.expiresIn} seconds</Text>
        </View>
      )}
    </View>
  );
}
