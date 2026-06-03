// screens/ViewTransactionsScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView
} from "react-native";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function ViewTransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | income | expense
  const user = auth.currentUser;

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadTransactions);
    return unsubscribe;
  }, [navigation]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "transactions"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
      setTransactions(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", user.uid, "transactions", id));
            setTransactions((prev) => prev.filter((t) => t.id !== id));
          } catch (e) {
            Alert.alert("Error", "Failed to delete transaction.");
          }
        },
      },
    ]);
  };

  const filtered = filter === "all"
    ? transactions
    : transactions.filter((t) => t.type === filter);

  const renderItem = ({ item }) => (
    <View style={[styles.item, { borderLeftColor: item.type === "income" ? "#1D9E75" : "#D85A30" }]}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemDesc}>{item.description}</Text>
        <Text style={styles.itemMeta}>{item.category} · {item.date}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={[styles.itemAmount, { color: item.type === "income" ? "#1D9E75" : "#D85A30" }]}>
          {item.type === "income" ? "+" : "-"}₱{item.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {["all", "income", "expense"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, filter === f && styles.tabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
              {f === "all" ? "All" : f === "income" ? "💵 Income" : "💸 Expenses"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1D9E75" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No transactions found.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{filtered.length} transaction(s)</Text>
        <TouchableOpacity onPress={() => navigation.navigate("MainMenu")}>
          <Text style={styles.footerBack}>← Back to Menu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0faf4" },
  tabs: { flexDirection: "row", backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#f0f0f0", alignItems: "center",
  },
  tabActive: { backgroundColor: "#1D9E75" },
  tabText: { fontSize: 13, color: "#666", fontWeight: "500" },
  tabTextActive: { color: "#fff" },
  list: { padding: 16, paddingBottom: 80 },
  item: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    marginBottom: 10, flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", borderLeftWidth: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  itemLeft: { flex: 1 },
  itemDesc: { fontSize: 15, fontWeight: "500", color: "#333", marginBottom: 3 },
  itemMeta: { fontSize: 12, color: "#888" },
  itemRight: { alignItems: "flex-end" },
  itemAmount: { fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#888" },
  footer: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee",
  },
  footerText: { fontSize: 13, color: "#888" },
  footerBack: { fontSize: 13, color: "#1D9E75", fontWeight: "500" },
});
