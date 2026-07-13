import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/lib/AuthContext";
import { registerForPushNotifications } from "./src/lib/pushNotifications";
import RootNavigator from "./src/navigation/RootNavigator";

function PushRegistration() {
  const { profile } = useAuth();
  useEffect(() => {
    if (profile) registerForPushNotifications(profile.id);
  }, [profile]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <PushRegistration />
      <StatusBar style="auto" />
      <RootNavigator />
    </AuthProvider>
  );
}
