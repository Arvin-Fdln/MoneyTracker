// screens/AddExpenseScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform
} from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "categories"));
      const cats = [];
      snap.forEach((doc) => {
        const d = doc.data();
        if (d.type === "expense" || d.type === "both") {
          cats.push({ id: doc.id, ...d });
        }
      });
      setCategories(cats);
      if (cats.length > 0) setSelectedCategory(cats[0].name);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        type: "expense",
        amount: parseFloat(amount),
        description: description.trim(),
        category: selectedCategory,
        date: date,
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Expense added successfully!", [
        { text: "Add Another", onPress: () => { setAmount(""); setDescription(""); } },
        { text: "Back to Menu", onPress: () => navigation.navigate("MainMenu") },
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to save expense. Please try again.");
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
        <View style={styles.headerBadge}>
          <Text style={styles.headerIcon}>💸</Text>
          <Text style={styles.headerText}>Enter Expense Details</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Amount (₱) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#aaa"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Lunch at canteen"
            placeholderTextColor="#aaa"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, selectedCategory === cat.name && styles.catChipSelected]}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <Text>{cat.icon} {cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#aaa"
            value={date}
            onChangeText={setDate}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Saving..." : "✅ Add Expense"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0faf4" },
  scroll: { padding: 16, paddingBottom: 32 },
  headerBadge: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#FAECE7", borderRadius: 12, padding: 14, marginBottom: 16,
  },
  headerIcon: { fontSize: 28, marginRight: 10 },
  headerText: { fontSize: 18, fontWeight: "bold", color: "#993C1D" },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  label: { fontSize: 14, color: "#555", marginBottom: 6, marginTop: 14, fontWeight: "500" },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 12, fontSize: 15, color: "#333", backgroundColor: "#fafafa",
  },
  catScroll: { marginBottom: 4 },
  catChip: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: "#f5f5f5",
  },
  catChipSelected: { backgroundColor: "#FAECE7", borderColor: "#D85A30" },
  button: {
    backgroundColor: "#D85A30", padding: 15, borderRadius: 10,
    alignItems: "center", marginTop: 24,
  },
  buttonDisabled: { backgroundColor: "#F0997B" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: { alignItems: "center", marginTop: 12 },
  cancelText: { color: "#888", fontSize: 14 },
});
