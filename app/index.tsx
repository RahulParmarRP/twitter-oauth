import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ✅ Load client ID from config
const oAuthClientId = Constants.expoConfig?.extra?.twitterClientId || "";
const hasClientId = Boolean(oAuthClientId);

// Redirect URI → must match Twitter app settings
const redirectUri = AuthSession.makeRedirectUri({ scheme: "twitteroauth" });
console.log("📌 Using Redirect URI:", redirectUri);

const discovery = {
  authorizationEndpoint: "https://twitter.com/i/oauth2/authorize",
  tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
};

export default function TwitterAuth() {
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(
      hasClientId
        ? `✅ Client ID loaded: ${oAuthClientId}`
        : "❌ No Client ID found in config"
    );
  }, []);

  const handleLogin = async () => {
    console.log("🟡 Login button pressed");

    if (!hasClientId) {
      Alert.alert("Config Error", "Twitter Client ID is missing!");
      console.error("❌ Cannot continue: Missing client ID");
      return;
    }

    if (loading) {
      console.log("⚠️ Login already in progress, ignoring press");
      return;
    }

    setLoading(true);

    try {
      console.log("🚀 Creating auth request with:", {
        clientId: oAuthClientId,
        redirectUri,
      });

      const authRequest = new AuthSession.AuthRequest({
        clientId: oAuthClientId,
        redirectUri,
        scopes: ["tweet.read", "users.read", "tweet.write", "offline.access"],
        responseType: "code",
        usePKCE: true,
      });

      console.log("🌐 Prompting Twitter login...");
      const res = await authRequest.promptAsync(discovery);
      console.log("✅ Auth response:", res);

      if (res.type === "success" && res.params.code) {
        console.log("🔑 Received code:", res.params.code);

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
        console.log("✅ Token Response:", tokenResponse);
      } else {
        console.warn("⚠️ Auth cancelled or failed:", res);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Login Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login with Twitter</Text>
        )}
      </Pressable>

      {!hasClientId && (
        <Text style={styles.warning}>⚠️ Missing Twitter Client ID in config</Text>
      )}

      {token && (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text>Access Token: {token.accessToken}</Text>
          <Text>Expires In: {token.expiresIn} seconds</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // center vertically
    alignItems: "center", // center horizontally
    padding: 20,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#1DA1F2",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  warning: {
    marginTop: 10,
    color: "red",
    textAlign: "center",
  },
});
