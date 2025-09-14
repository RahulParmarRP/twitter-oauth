import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";

// ✅ Define token type interface
interface TwitterToken {
  access_token: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
  refresh_token?: string;
}

// ✅ Load client ID from config
const oAuthClientId = Constants.expoConfig?.extra?.twitterClientId || "";
const hasClientId = Boolean(oAuthClientId);

// ✅ URIs
const defaultRedirectUri = AuthSession.makeRedirectUri(); // Expo Go default
const customRedirectUri = AuthSession.makeRedirectUri({
  scheme: "twitteroauth",
  path: "redirect",
  preferLocalhost: false,
  isTripleSlashed: false,
});

// Twitter OAuth discovery
const discovery = {
  authorizationEndpoint: "https://x.com/i/oauth2/authorize",
  tokenEndpoint: "https://api.x.com/2/oauth2/token",
};

export default function App() {
  const [token, setToken] = useState<TwitterToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setLoading(true);
        setError(null);
        console.log("✅ Got auth code:", response.params.code);
        console.log("🔗 Redirected back to:", defaultRedirectUri);

        try {
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

          if (data.access_token) {
            setToken(data as TwitterToken);
          } else {
            setError(data.error_description || "Failed to get token");
          }
        } catch (err) {
          setError("Network error occurred");
          console.error("Token exchange error:", err);
        } finally {
          setLoading(false);
        }
      } else if (response?.type === "error") {
        setError(response.params?.error_description || "Authentication failed");
      }
    };

    if (response) {
      handleResponse();
    }
  }, [response, request?.codeVerifier]); // Added missing dependency

  if (!hasClientId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "red", textAlign: "center", fontSize: 16 }}>
          ❌ Missing twitterClientId in app.config.ts
        </Text>
        <Text style={{ color: "gray", textAlign: "center", marginTop: 10, fontSize: 12 }}>
          Add your Twitter OAuth 2.0 Client ID to the configuration
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1DA1F2" }}>
        Twitter OAuth Demo
      </Text>
      
      {/* Client ID Info */}
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 12, color: "gray" }}>Client ID:</Text>
        <Text style={{ fontSize: 10, color: "gray", fontFamily: "monospace" }}>
          {oAuthClientId ? `${oAuthClientId.substring(0, 10)}...` : "Not configured"}
        </Text>
      </View>

      {/* Redirect URI Info */}
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 12, color: "gray" }}>Redirect URI (Expo Go):</Text>
        <Text style={{ fontSize: 10, color: "gray", fontFamily: "monospace", textAlign: "center" }}>
          {defaultRedirectUri}
        </Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 12, color: "gray" }}>Redirect URI (Standalone):</Text>
        <Text style={{ fontSize: 10, color: "gray", fontFamily: "monospace", textAlign: "center" }}>
          {customRedirectUri}
        </Text>
      </View>

      {/* Success State */}
      {token && (
        <View style={{ backgroundColor: "#d4edda", padding: 15, borderRadius: 8, width: "100%" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#155724", textAlign: "center" }}>
            ✅ Login Successful!
          </Text>
          <Text style={{ fontSize: 12, color: "#155724", marginTop: 5 }}>
            Access Token: {token.access_token.substring(0, 15)}...
          </Text>
          <Text style={{ fontSize: 12, color: "#155724" }}>
            Token Type: {token.token_type || "Bearer"}
          </Text>
          <Text style={{ fontSize: 12, color: "#155724" }}>
            Scopes: {token.scope || "tweet.read, users.read, offline.access"}
          </Text>
          {token.expires_in && (
            <Text style={{ fontSize: 12, color: "#155724" }}>
              Expires in: {Math.floor(token.expires_in / 60)} minutes
            </Text>
          )}
        </View>
      )}

      {/* Loading State */}
      {loading && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <ActivityIndicator size="small" color="#1DA1F2" />
          <Text style={{ color: "#1DA1F2" }}>Exchanging code for token...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={{ backgroundColor: "#f8d7da", padding: 15, borderRadius: 8, width: "100%" }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "#721c24", textAlign: "center" }}>
            ❌ Error
          </Text>
          <Text style={{ fontSize: 12, color: "#721c24", textAlign: "center", marginTop: 5 }}>
            {error}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {request && !loading ? (
        token ? (
          <View style={{ gap: 10 }}>
            <Button
              title="Login Again"
              onPress={() => {
                setToken(null);
                setError(null);
                promptAsync();
              }}
            />
            <Button
              title="Clear Session"
              onPress={() => {
                setToken(null);
                setError(null);
              }}
            />
          </View>
        ) : (
          <Button
            title="Login with Twitter"
            onPress={() => {
              console.log("🔑 Starting Twitter login flow...");
              console.log("👉 Using redirect URI:", defaultRedirectUri);
              setError(null);
              promptAsync();
            }}
          />
        )
      ) : (
        <ActivityIndicator size="large" color="#1DA1F2" />
      )}

      {/* Additional Info */}
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Text style={{ fontSize: 10, color: "gray", textAlign: "center" }}>
          Environment: {Constants.appOwnership === 'expo' ? 'Expo Go' : 'Standalone App'}
        </Text>
        <Text style={{ fontSize: 10, color: "gray", textAlign: "center" }}>
          Status: {response?.type || "Ready"}
        </Text>
      </View>
    </View>
  );
}