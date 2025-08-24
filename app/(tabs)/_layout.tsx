import { Tabs } from "expo-router";
import { Home, Utensils, Activity, ShoppingBag, User, Target, Heart, Calendar } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
// import { useAuth } from "@/hooks/auth-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";

function ProfileButton() {
  // const { user, signOut } = useAuth();
  const router = useRouter();

  // if (!user) {
    return (
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.profileButtonText}>Sign In</Text>
      </TouchableOpacity>
    );
  // }

  // return (
  //   <TouchableOpacity 
  //     style={styles.profileButton}
  //     onPress={() => router.push('/profile')}
  //   >
  //     <User size={20} color={colors.cardBackground} />
  //   </TouchableOpacity>
  // );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#6b7280",
        headerShown: true,
        headerRight: () => <ProfileButton />,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.cardBackground,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "SnapCarb",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: ({ color, size }) => <Utensils color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="dr-davis-products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          title: "Challenge",
          tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="supplements"
        options={{
          title: "Supplements",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 16,
  },
  profileButtonText: {
    color: colors.cardBackground,
    fontWeight: '600',
    fontSize: 14,
  },
});