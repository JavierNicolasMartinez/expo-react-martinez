import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth";

type Mode = "login" | "register";

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function passwordStrength(p: string): number {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

const STRENGTH_COLORS = ["#ccc", "#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#30D158"];
const STRENGTH_LABELS = ["", "Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"];

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  secure?: boolean;
  showPw?: boolean;
  onTogglePw?: () => void;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words" | "sentences";
  returnKeyType?: "next" | "done";
  onSubmit?: () => void;
  id: string;
  focused: string | null;
  onFocus: (id: string | null) => void;
}

function Field({
  label, value, onChange, placeholder, error, secure, showPw, onTogglePw,
  keyboardType = "default", autoCapitalize = "none", returnKeyType, onSubmit,
  id, focused, onFocus,
}: FieldProps) {
  const active = focused === id;
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <View style={[f.row, active && f.rowActive, !!error && f.rowError]}>
        <TextInput
          style={f.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#b0b8c8"
          secureTextEntry={secure && !showPw}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmit}
          onFocus={() => onFocus(id)}
          onBlur={() => onFocus(null)}
        />
        {secure && (
          <TouchableOpacity onPress={onTogglePw} style={f.eye}>
            <Ionicons
              name={showPw ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={active ? "#007AFF" : "#aab4c8"}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && (
        <View style={f.errRow}>
          <Ionicons name="alert-circle" size={13} color="#FF3B30" />
          <Text style={f.errText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#4a5568", marginBottom: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f8fc",
    borderWidth: 1.5,
    borderColor: "#dde3ee",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  rowActive: { borderColor: "#007AFF", backgroundColor: "#eef4ff" },
  rowError: { borderColor: "#FF3B30", backgroundColor: "#fff5f5" },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: "#1a1a2e" },
  eye: { padding: 6 },
  errRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  errText: { fontSize: 12, color: "#FF3B30", flex: 1 },
});

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [focused, setFocused] = useState<string | null>(null);

  // Login state
  const [lEmail, setLEmail] = useState("");
  const [lPass, setLPass] = useState("");
  const [showLP, setShowLP] = useState(false);
  const [lEmailErr, setLEmailErr] = useState("");
  const [lPassErr, setLPassErr] = useState("");

  // Register state
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPass, setRPass] = useState("");
  const [rConfirm, setRConfirm] = useState("");
  const [showRP, setShowRP] = useState(false);
  const [showRC, setShowRC] = useState(false);
  const [rNameErr, setRNameErr] = useState("");
  const [rEmailErr, setREmailErr] = useState("");
  const [rPassErr, setRPassErr] = useState("");
  const [rConfirmErr, setRConfirmErr] = useState("");

  // Tab animation
  const [tabsW, setTabsW] = useState(0);
  const btnW = (tabsW - 8) / 2;
  const slideX = useSharedValue(0);
  const fadeOpacity = useSharedValue(1);

  const pillAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const formAnim = useAnimatedStyle(() => ({
    opacity: fadeOpacity.value,
  }));

  function switchMode(next: Mode) {
    if (next === mode) return;
    Haptics.selectionAsync();
    fadeOpacity.value = withTiming(0, { duration: 130 }, () => {
      runOnJS(setMode)(next);
      fadeOpacity.value = withTiming(1, { duration: 180 });
    });
    slideX.value = withSpring(next === "register" ? btnW : 0, {
      damping: 20,
      stiffness: 200,
    });
  }

  function handleLogin() {
    let ok = true;
    if (!isValidEmail(lEmail)) { setLEmailErr("Email inválido"); ok = false; } else setLEmailErr("");
    if (lPass.length < 6) { setLPassErr("Mínimo 6 caracteres"); ok = false; } else setLPassErr("");
    if (!ok) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    login(lEmail);
    router.replace("/(tabs)");
  }

  function handleRegister() {
    let ok = true;
    if (rName.trim().length < 2) { setRNameErr("Nombre muy corto"); ok = false; } else setRNameErr("");
    if (!isValidEmail(rEmail)) { setREmailErr("Email inválido"); ok = false; } else setREmailErr("");
    if (rPass.length < 6) { setRPassErr("Mínimo 6 caracteres"); ok = false; } else setRPassErr("");
    if (rConfirm !== rPass) { setRConfirmErr("No coinciden"); ok = false; } else setRConfirmErr("");
    if (!ok) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    register(rName.trim(), rEmail);
    router.replace("/(tabs)");
  }

  const strength = passwordStrength(rPass);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.header}>
            <View style={s.logoBox}>
              <Text style={s.logoEmoji}>🔐</Text>
            </View>
            <Text style={s.title}>
              {mode === "login" ? "Bienvenido" : "Crear cuenta"}
            </Text>
            <Text style={s.subtitle}>
              {mode === "login"
                ? "Ingresá para continuar"
                : "Completá tus datos para registrarte"}
            </Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            {/* Tab switcher */}
            <View
              style={s.tabs}
              onLayout={(e) => setTabsW(e.nativeEvent.layout.width)}
            >
              <Animated.View
                style={[s.pill, { width: Math.max(btnW, 0) }, pillAnim]}
              />
              <TouchableOpacity style={s.tab} onPress={() => switchMode("login")}>
                <Text style={[s.tabTxt, mode === "login" && s.tabOn]}>
                  Iniciar sesión
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.tab} onPress={() => switchMode("register")}>
                <Text style={[s.tabTxt, mode === "register" && s.tabOn]}>
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>

            {/* Animated form area */}
            <Animated.View style={formAnim}>
              {mode === "login" ? (
                <View>
                  <Field
                    label="Correo electrónico"
                    value={lEmail}
                    onChange={setLEmail}
                    placeholder="tu@email.com"
                    error={lEmailErr}
                    keyboardType="email-address"
                    returnKeyType="next"
                    id="lEmail"
                    focused={focused}
                    onFocus={setFocused}
                  />
                  <Field
                    label="Contraseña"
                    value={lPass}
                    onChange={setLPass}
                    placeholder="••••••••"
                    error={lPassErr}
                    secure
                    showPw={showLP}
                    onTogglePw={() => setShowLP((v) => !v)}
                    returnKeyType="done"
                    onSubmit={handleLogin}
                    id="lPass"
                    focused={focused}
                    onFocus={setFocused}
                  />
                  <TouchableOpacity style={s.forgot}>
                    <Text style={s.forgotTxt}>¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>
                  <Pressable
                    style={({ pressed }) => [s.btn, pressed && s.btnPressed]}
                    onPress={handleLogin}
                  >
                    <Text style={s.btnTxt}>Iniciar sesión</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={s.ico} />
                  </Pressable>
                  <View style={s.switchRow}>
                    <Text style={s.switchTxt}>¿No tenés cuenta? </Text>
                    <TouchableOpacity onPress={() => switchMode("register")}>
                      <Text style={s.switchLink}>Registrate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <Field
                    label="Nombre completo"
                    value={rName}
                    onChange={setRName}
                    placeholder="Juan Pérez"
                    error={rNameErr}
                    autoCapitalize="words"
                    returnKeyType="next"
                    id="rName"
                    focused={focused}
                    onFocus={setFocused}
                  />
                  <Field
                    label="Correo electrónico"
                    value={rEmail}
                    onChange={setREmail}
                    placeholder="tu@email.com"
                    error={rEmailErr}
                    keyboardType="email-address"
                    returnKeyType="next"
                    id="rEmail"
                    focused={focused}
                    onFocus={setFocused}
                  />
                  <Field
                    label="Contraseña"
                    value={rPass}
                    onChange={setRPass}
                    placeholder="Mínimo 6 caracteres"
                    error={rPassErr}
                    secure
                    showPw={showRP}
                    onTogglePw={() => setShowRP((v) => !v)}
                    returnKeyType="next"
                    id="rPass"
                    focused={focused}
                    onFocus={setFocused}
                  />
                  {rPass.length > 0 && (
                    <View style={s.strengthWrap}>
                      <View style={s.bars}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <View
                            key={i}
                            style={[
                              s.bar,
                              {
                                backgroundColor:
                                  i <= strength
                                    ? STRENGTH_COLORS[strength]
                                    : "#dde3ee",
                              },
                            ]}
                          />
                        ))}
                      </View>
                      <Text
                        style={[s.strengthTxt, { color: STRENGTH_COLORS[strength] }]}
                      >
                        {STRENGTH_LABELS[strength]}
                      </Text>
                    </View>
                  )}
                  <Field
                    label="Confirmar contraseña"
                    value={rConfirm}
                    onChange={setRConfirm}
                    placeholder="Repetí tu contraseña"
                    error={rConfirmErr}
                    secure
                    showPw={showRC}
                    onTogglePw={() => setShowRC((v) => !v)}
                    returnKeyType="done"
                    onSubmit={handleRegister}
                    id="rConfirm"
                    focused={focused}
                    onFocus={setFocused}
                  />
                  <Pressable
                    style={({ pressed }) => [s.btn, s.btnGreen, pressed && s.btnPressed]}
                    onPress={handleRegister}
                  >
                    <Text style={s.btnTxt}>Crear cuenta</Text>
                    <Ionicons name="checkmark" size={20} color="#fff" style={s.ico} />
                  </Pressable>
                  <View style={s.switchRow}>
                    <Text style={s.switchTxt}>¿Ya tenés cuenta? </Text>
                    <TouchableOpacity onPress={() => switchMode("login")}>
                      <Text style={s.switchLink}>Iniciá sesión</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#EBF0FF" },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 44,
  },
  header: { alignItems: "center", marginBottom: 28 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#4060cc",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  logoEmoji: { fontSize: 36 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a1a2e",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, color: "#6a7891", marginTop: 6, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#3a50aa",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#EBF0FF",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  pill: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabTxt: { fontSize: 14, fontWeight: "600", color: "#8898aa" },
  tabOn: { color: "#007AFF" },
  btn: {
    backgroundColor: "#007AFF",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  btnGreen: { backgroundColor: "#34C759", shadowColor: "#34C759" },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  btnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  ico: { marginLeft: 8 },
  forgot: { alignSelf: "flex-end", marginTop: -4, marginBottom: 18 },
  forgotTxt: { fontSize: 13, color: "#007AFF", fontWeight: "500" },
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  switchTxt: { fontSize: 14, color: "#8898aa" },
  switchLink: { fontSize: 14, color: "#007AFF", fontWeight: "700" },
  strengthWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: -6,
    marginBottom: 14,
  },
  bars: { flexDirection: "row", gap: 4, flex: 1 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  strengthTxt: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 72,
    textAlign: "right",
  },
});
