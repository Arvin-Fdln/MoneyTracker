// components/TransactionItem.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function TransactionItem({ item, onDelete }) {
  return (
    <View style={[styles.item, { borderLeftColor: item.type === "income" ? "#1D9E75" : "#D85A30" }]}>
      <View style={styles.left}>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.meta}>{item.category} · {item.date}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: item.type === "income" ? "#1D9E75" : "#D85A30" }]}>
          {item.type === "income" ? "+" : "-"}₱{item.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </Text>
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    marginBottom: 10, flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", borderLeftWidth: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  left: { flex: 1 },
  desc: { fontSize: 15, fontWeight: "500", color: "#333", marginBottom: 3 },
  meta: { fontSize: 12, color: "#888" },
  right: { alignItems: "flex-end" },
  amount: { fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 16 },
});
