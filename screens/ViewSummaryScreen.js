// screens/ViewSummaryScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, SafeAreaView, TouchableOpacity
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function ViewSummaryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [byCategory, setByCategory] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadSummary);
    return unsubscribe;
  }, [navigation]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "transactions"));
      let income = 0, expense = 0;
      const catMap = {};
      const allTx = [];

      snap.forEach((d) => {
        const data = d.data();
        allTx.push(data);
        if (data.type === "income") {
          income += data.amount;
        } else {
          expense += data.amount;
          catMap[data.category] = (catMap[data.category] || 0) + data.amount;
        }
      });

      setTotalIncome(income);
      setTotalExpense(expense);

      // Sort categories by amount
      const catArr = Object.entries(catMap)
        .map(([name, amt]) => ({ name, amount: amt }))
        .sort((a, b) => b.amount - a.amount);
      setByCategory(catArr);

      // Most recent 5 transactions
      const sorted = allTx.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentTx(sorted.slice(0, 5));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0faf4" }}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Summary Cards */}
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.cardsRow}>
          <View style={[styles.summaryCard, { backgroundColor: "#E1F5EE", borderColor: "#1D9E75" }]}>
            <Text style={styles.cardIcon}>💵</Text>
            <Text style={styles.cardLabel}>Total Income</Text>
            <Text style={[styles.cardAmount, { color: "#0F6E56" }]}>
              ₱{totalIncome.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#FAECE7", borderColor: "#D85A30" }]}>
            <Text style={styles.cardIcon}>💸</Text>
            <Text style={styles.cardLabel}>Total Expenses</Text>
            <Text style={[styles.cardAmount, { color: "#993C1D" }]}>
              ₱{totalExpense.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: balance >= 0 ? "#1D9E75" : "#D85A30" }]}>
          <Text style={styles.balanceLabel}>Remaining Balance</Text>
          <Text style={styles.balanceAmount}>
            ₱{balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.savingsRate}>
            {balance >= 0 ? `Savings rate: ${savingsRate}%` : "⚠️ Expenses exceed income"}
          </Text>
        </View>

        {/* Expenses by Category */}
        {byCategory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Expenses by Category</Text>
            <View style={styles.card}>
              {byCategory.map((cat, i) => {
                const pct = totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0;
                return (
                  <View key={i} style={styles.catRow}>
                    <View style={styles.catInfo}>
                      <Text style={styles.catName}>{cat.name}</Text>
                      <Text style={styles.catAmt}>
                        ₱{cat.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: "#D85A30" }]} />
                    </View>
                    <Text style={styles.catPct}>{pct.toFixed(1)}%</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Recent Transactions */}
        {recentTx.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <View style={styles.card}>
              {recentTx.map((tx, i) => (
                <View key={i} style={[styles.recentRow, i < recentTx.length - 1 && styles.recentBorder]}>
                  <Text style={styles.recentDesc}>{tx.description}</Text>
                  <Text style={[styles.recentAmt, { color: tx.type === "income" ? "#1D9E75" : "#D85A30" }]}>
                    {tx.type === "income" ? "+" : "-"}₱{tx.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("MainMenu")}>
          <Text style={styles.backText}>← Back to Menu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0faf4" },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#555", marginBottom: 10, marginTop: 8 },
  cardsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  summaryCard: {
    flex: 1, borderRadius: 14, borderWidth: 1.5, padding: 16, alignItems: "center",
  },
  cardIcon: { fontSize: 24, marginBottom: 6 },
  cardLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  cardAmount: { fontSize: 16, fontWeight: "bold" },
  balanceCard: {
    borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 20,
  },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 6 },
  balanceAmount: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 6 },
  savingsRate: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  catRow: { marginBottom: 14 },
  catInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  catName: { fontSize: 13, color: "#444", fontWeight: "500" },
  catAmt: { fontSize: 13, color: "#444" },
  barBg: { height: 8, backgroundColor: "#f0f0f0", borderRadius: 4, overflow: "hidden", marginBottom: 2 },
  barFill: { height: 8, borderRadius: 4 },
  catPct: { fontSize: 11, color: "#888", textAlign: "right" },
  recentRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  recentBorder: { borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  recentDesc: { fontSize: 14, color: "#444", flex: 1 },
  recentAmt: { fontSize: 14, fontWeight: "bold" },
  backButton: { alignItems: "center", marginTop: 8 },
  backText: { color: "#1D9E75", fontSize: 14, fontWeight: "500" },
});
