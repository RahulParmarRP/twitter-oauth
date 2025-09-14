// App.tsx
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import React, { useEffect } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";

// ✅ Load client ID from config
const oAuthClientId = Constants.expoConfig?.extra?.twitterClientId || "";
const hasClientId = Boolean(oAuthClientId);

// ✅ URIs
const defaultRedirectUri = AuthSession.makeRedirectUri(); // Expo Go default
// const defaultRedirectUri = AuthSession.makeRedirectUri({
//   scheme: "twitteroauth",
//   path: "redirect",
//   preferLocalhost: false,
//   isTripleSlashed: false,
// });

// Twitter OAuth discovery
const discovery = {
  authorizationEndpoint: "https://x.com/i/oauth2/authorize",
  tokenEndpoint: "https://api.x.com/2/oauth2/token",
};

export default function App() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: oAuthClientId,
      redirectUri: defaultRedirectUri,
      usePKCE: true,
      scopes: ["tweet.read", "users.read", "offline.access"],
    },
    discovery
  );

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === "success" && response.params?.code) {
        console.log("✅ Got auth code:", response.params.code);
        console.log("🔗 Redirected back to:", defaultRedirectUri);

        // Exchange code for token
        const tokenResponse = await fetch(discovery.tokenEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code: response.params.code,
            grant_type: "authorization_code",
            client_id: oAuthClientId,
            redirect_uri: defaultRedirectUri,
            code_verifier: request?.codeVerifier || "",
          }).toString(),
        });

        console.log("Token response status:", tokenResponse.status);
        const data = await tokenResponse.json();
        console.log("🎉 Token data:", data);
      }
    };

    handleResponse();
  }, [response]);

  if (!hasClientId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>❌ Missing twitterClientId in app.config.ts</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Text style={{ fontSize: 12, color: "gray" }}>Default URI (Expo Go): {defaultRedirectUri}</Text>
      <Text style={{ fontSize: 12, color: "gray" }}>Custom URI (Standalone): {defaultRedirectUri}</Text>

      {request ? (
        <Button
          title="Login with Twitter"
          onPress={() => {
            console.log("🔑 Starting Twitter login flow...");
            console.log("👉 Using redirect URI:", defaultRedirectUri);
            promptAsync();
          }}
        />
      ) : (
        <ActivityIndicator size="large" color="#1DA1F2" />
      )}
    </View>
  );
}
