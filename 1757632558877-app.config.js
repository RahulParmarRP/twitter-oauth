import "dotenv/config";

const config = {
  expo: {
    name: "twitter-oauth",
    slug: "twitter-oauth",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "twitteroauth", // Custom scheme for Android/iOS OAuth
    extra: {
      twitterClientId: process.env.TWITTER_OAUTH2_CLIENT_ID || "",
      eas: {
        projectId: "5a3d01c9-be4e-41fd-bfcd-7f7591cac538",
      },
    },
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.rahulparmar.twitteroauth", // 👈 meas secret:delete <id>
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "twitteroauth",
              host: "redirect",
              pathPrefix: "/",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-secure-store",
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};

export default config;
