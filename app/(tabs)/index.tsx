import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
    router.replace("/login");
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "¡Buenos días" : hour < 18 ? "¡Buenas tardes" : "¡Buenas noches";

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting},</Text>
            <Text style={s.name}>{user?.name} 👋</Text>
          </View>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Welcome card */}
        <View style={s.welcomeCard}>
          <Text style={s.welcomeTitle}>Bienvenido a la app</Text>
          <Text style={s.welcomeSubtitle}>
            Explorá las funcionalidades disponibles en las pestañas de abajo.
          </Text>
          <View style={s.badge}>
            <Ionicons name="checkmark-circle" size={14} color="#34C759" />
            <Text style={s.badgeText}>Sesión activa</Text>
          </View>
        </View>

        {/* Info section */}
        <Text style={s.sectionTitle}>Tu información</Text>
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={[s.infoIcon, { backgroundColor: "#EEF4FF" }]}>
              <Ionicons name="person-outline" size={20} color="#007AFF" />
            </View>
            <View style={s.infoText}>
              <Text style={s.infoLabel}>Nombre</Text>
              <Text style={s.infoValue}>{user?.name}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <View style={[s.infoIcon, { backgroundColor: "#F0FFF4" }]}>
              <Ionicons name="mail-outline" size={20} color="#34C759" />
            </View>
            <View style={s.infoText}>
              <Text style={s.infoLabel}>Correo electrónico</Text>
              <Text style={s.infoValue}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Hint */}
        <View style={s.hintCard}>
          <Ionicons name="compass-outline" size={24} color="#FF9500" />
          <Text style={s.hintText}>
            Tocá <Text style={s.hintBold}>Explore</Text> para ver más
            funcionalidades disponibles.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#EBF0FF" },
  scroll: { padding: 20, paddingTop: 16, paddingBottom: 40 },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: { fontSize: 16, color: "#6a7891", fontWeight: "500" },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a1a2e",
    letterSpacing: -0.5,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  // Welcome card
  welcomeCard: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
    marginBottom: 14,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  // Section title
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 12,
  },
  // Info card
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    shadowColor: "#3a50aa",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { flex: 1 },
  infoLabel: {
    fontSize: 12,
    color: "#8898aa",
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: { fontSize: 15, color: "#1a1a2e", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#f0f2f8", marginHorizontal: 14 },
  // Hint card
  hintCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#3a50aa",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  hintText: { flex: 1, fontSize: 14, color: "#6a7891", lineHeight: 20 },
  hintBold: { fontWeight: "700", color: "#1a1a2e" },
});
