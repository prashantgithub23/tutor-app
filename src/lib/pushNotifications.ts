import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Call this once after login (e.g. in App.tsx) so absence alerts can reach the device.
export async function registerForPushNotifications(profileId: string) {
  if (!Device.isDevice) return; // push tokens require a physical device, not the simulator

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  const { data: token } = await Notifications.getExpoPushTokenAsync();

  await supabase
    .from("push_tokens")
    .upsert({ profile_id: profileId, expo_push_token: token }, { onConflict: "profile_id,expo_push_token" });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
}
