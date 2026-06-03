// screens/LoginScreen.js
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigation handled automatically by onAuthStateChanged in App.js
    } catch (error) {
      let msg = "Login failed. Please try again.";
      if (error.code === "auth/user-not-found") msg = "No account found with this email.";
      if (error.code === "auth/wrong-password") msg = "Incorrect password.";
      if (error.code === "auth/invalid-email") msg = "Invalid email format.";
      Alert.alert("Login Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo Area */}
        <View style={styles.logoArea}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.appName}>Money Tracker</Text>
          <Text style={styles.tagline}>Budget Keeper</Text>
        </View>

        {/* Login Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Signing in..." : "Login"}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.newUserText}>New user?</Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerButtonText}>Register Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0faf4" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoArea: { alignItems: "center", marginBottom: 32 },
  logo: { fontSize: 64 },
  appName: { fontSize: 28, fontWeight: "bold", color: "#1D9E75", marginTop: 8 },
  tagline: { fontSize: 14, color: "#888", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#1D9E75", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 14, color: "#555", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#1D9E75",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { backgroundColor: "#9FE1CB" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 20 },
  newUserText: { textAlign: "center", color: "#888", marginBottom: 10, fontSize: 14 },
  registerButton: {
    borderWidth: 2,
    borderColor: "#1D9E75",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  registerButtonText: { color: "#1D9E75", fontSize: 15, fontWeight: "bold" },
});
