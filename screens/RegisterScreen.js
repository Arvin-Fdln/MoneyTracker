// screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", icon: "🍔", type: "expense" },
  { name: "Transportation", icon: "🚌", type: "expense" },
  { name: "Shopping", icon: "🛍️", type: "expense" },
  { name: "Utilities", icon: "💡", type: "expense" },
  { name: "Healthcare", icon: "🏥", type: "expense" },
  { name: "Entertainment", icon: "🎮", type: "expense" },
  { name: "Salary", icon: "💼", type: "income" },
  { name: "Freelance", icon: "💻", type: "income" },
  { name: "Business", icon: "📈", type: "income" },
  { name: "Other", icon: "📌", type: "both" },
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCred.user, { displayName: name.trim() });

      // Create default categories for the new user in Firestore
      const batch = DEFAULT_CATEGORIES.map((cat, i) =>
        setDoc(doc(db, "users", userCred.user.uid, "categories", `cat_${i}`), {
          ...cat,
          createdAt: new Date().toISOString(),
        })
      );
      await Promise.all(batch);
      // App.js onAuthStateChanged will automatically navigate to MainMenu
    } catch (error) {
      let msg = "Registration failed.";
      if (error.code === "auth/email-already-in-use") msg = "Email is already registered.";
      if (error.code === "auth/invalid-email") msg = "Invalid email format.";
      Alert.alert("Registration Error", msg);
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
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 6 characters"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor="#aaa"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Register"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0faf4" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
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
  title: { fontSize: 22, fontWeight: "bold", color: "#1D9E75", marginBottom: 16, textAlign: "center" },
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
  backButton: { alignItems: "center", marginTop: 16 },
  backButtonText: { color: "#1D9E75", fontSize: 14 },
});
