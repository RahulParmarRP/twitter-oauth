import * as AuthSession from "expo-auth-session";
import React, { useState } from "react";
import { Alert, Button, Text, View } from "react-native";

// Twitter OAuth config
const oAuthClientId = "Qkh4VWFaaThIbVpMZ2R1emJQbWI6MTpjaQ";
const redirectUri = AuthSession.makeRedirectUri({ scheme: "twitteroauth" });

const discovery = {
  authorizationEndpoint: "https://twitter.com/i/oauth2/authorize",
  tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
};

export default function TwitterAuth() {
  const [token, setToken] = useState<AuthSession.TokenResponse | null>(null);

  const handleLogin = async () => {
    try {
      const authRequest = new AuthSession.AuthRequest({
        clientId: oAuthClientId,
        redirectUri,
        scopes: ["tweet.read", "users.read", "tweet.write", "offline.access"],
        responseType: "code",
        usePKCE: true,
      });

      const res = await authRequest.promptAsync(discovery);

      if (res.type === "success" && res.params.code) {
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
        if ("error" in tokenResponse) {
          const errorMessage = (tokenResponse as any).error_description || tokenResponse.error || "Token exchange failed";
          Alert.alert("Error", errorMessage);
        } else {
          setToken(tokenResponse);
          console.log("Token Response:", tokenResponse);
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Login failed";
      Alert.alert("Login Error", errorMessage);
    }
  };

  const handleRefresh = async () => {
    if (!token?.refreshToken) return;
    try {
      const refreshed = await AuthSession.refreshAsync(
        {
          clientId: oAuthClientId,
          refreshToken: token.refreshToken,
        },
        discovery
      );
      setToken(refreshed);
      console.log("Refreshed Token:", refreshed);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Token refresh failed";
      Alert.alert("Refresh Error", errorMessage);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Login with Twitter" onPress={handleLogin} />

      <Button title="Refresh Token" onPress={handleRefresh} disabled={!token?.refreshToken} />
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
