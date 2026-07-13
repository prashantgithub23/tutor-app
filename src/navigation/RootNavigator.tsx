import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../lib/AuthContext";

import AuthScreen from "../screens/auth/AuthScreen";
import TutorScheduleScreen from "../screens/tutor/TutorScheduleScreen";
import TutorAttendanceScreen from "../screens/tutor/TutorAttendanceScreen";
// import TutorHomeworkScreen, TutorStudentAttendanceScreen once built (same pattern as above)
import ParentHomeScreen from "../screens/parent/ParentHomeScreen";
// import ParentHomeworkScreen, ParentAttendanceScreen once built (same pattern as above)

const TutorStack = createNativeStackNavigator();
const ParentTabs = createBottomTabNavigator();

function TutorNavigator() {
  return (
    <TutorStack.Navigator>
      <TutorStack.Screen name="Schedule" component={TutorScheduleScreen} />
      <TutorStack.Screen name="MarkAttendance" component={TutorAttendanceScreen} options={{ title: "Attendance" }} />
    </TutorStack.Navigator>
  );
}

function ParentNavigator() {
  return (
    <ParentTabs.Navigator>
      <ParentTabs.Screen name="Home" component={ParentHomeScreen} />
      {/* Add Homework and Attendance tabs here once those screens are built */}
    </ParentTabs.Navigator>
  );
}

export default function RootNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading) return null; // swap in a splash/loading screen

  return (
    <NavigationContainer>
      {!session || !profile ? (
        <AuthScreen />
      ) : profile.role === "tutor" ? (
        <TutorNavigator />
      ) : (
        <ParentNavigator />
      )}
    </NavigationContainer>
  );
}
