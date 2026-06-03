// screens/MainMenuScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, SafeAreaView
} from "react-native";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

const menuItems = [
  { label: "Add Income", icon: "💵", screen: "AddIncome", color: "#E1F5EE", border: "#1D9E75" },
  { label: "Add Expense", icon: "💸", screen: "AddExpense", color: "#FAECE7", border: "#D85A30" },
  { label: "View Transactions", icon: "📋", screen: "ViewTransactions", color: "#E6F1FB", border: "#378ADD" },
  { label: "View Summary", icon: "📊", screen: "ViewSummary", color: "#FAEEDA", border: "#BA7517" },
  { label: "Manage Categories", icon: "🗂️", screen: "ManageCategories", color: "#EEEDFE", border: "#7F77DD" },
];

export default function MainMenuScreen({ navigation }) {
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const user = auth.currentUser;

  useEffect(() => {
    loadQuickSummary();
  }, []);

  // Refresh summary when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadQuickSummary);
    return unsubscribe;
  }, [navigation]);

  const loadQuickSummary = async () => {
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "transactions"));
      let income = 0, expense = 0;
      snap.forEach((doc) => {
        const d = doc.data();
        if (d.type === "income") income += d.amount;
        else expense += d.amount;
      });
      setSummary({ income, expense });
    } catch (e) {
      console.log("Summary load error:", e);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? Your data is saved to Firebase.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
            // App.js onAuthStateChanged handles navigation back to Login
          },
        },
      ]
    );
  };

  const balance = summary.income - summary.expense;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Welcome Banner */}
        <View style={styles.banner}>
          <Text style={styles.welcome}>Hello, {user?.displayName || "User"} 👋</Text>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={[styles.balance, { color: balance >= 0 ? "#fff" : "#FFCDD2" }]}>
            ₱{balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatLabel}>Income</Text>
              <Text style={styles.miniStatValue}>
                ₱{summary.income.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatLabel}>Expenses</Text>
              <Text style={[styles.miniStatValue, { color: "#FFCDD2" }]}>
                ₱{summary.expense.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Menu Options */}
        <Text style={styles.sectionTitle}>Main Menu</Text>
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.menuCard, { backgroundColor: item.color, borderColor: item.border }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, { color: item.border }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout & Save Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0faf4" },
  scroll: { padding: 16, paddingBottom: 32 },
  banner: {
    backgroundColor: "#1D9E75",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  welcome: { color: "#E1F5EE", fontSize: 15, marginBottom: 8 },
  balanceLabel: { color: "#9FE1CB", fontSize: 13, marginBottom: 4 },
  balance: { fontSize: 36, fontWeight: "bold", color: "#fff", marginBottom: 16 },
  miniStats: { flexDirection: "row", alignItems: "center" },
  miniStat: { alignItems: "center", paddingHorizontal: 20 },
  miniStatLabel: { color: "#9FE1CB", fontSize: 12 },
  miniStatValue: { color: "#fff", fontSize: 14, fontWeight: "bold", marginTop: 2 },
  miniDivider: { width: 1, height: 30, backgroundColor: "#9FE1CB" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#555", marginBottom: 12 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  menuCard: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: { fontSize: 32, marginBottom: 8 },
  menuLabel: { fontSize: 13, fontWeight: "bold", textAlign: "center" },
  logoutButton: {
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: "#D85A30",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    backgroundColor: "#FAECE7",
  },
  logoutText: { color: "#D85A30", fontSize: 15, fontWeight: "bold" },
});
