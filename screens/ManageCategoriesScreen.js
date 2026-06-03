// screens/ManageCategoriesScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, FlatList, ActivityIndicator, SafeAreaView, Modal
} from "react-native";
import {
  collection, getDocs, addDoc, deleteDoc, doc, updateDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";

const ICONS = ["🍔","🚌","🛍️","💡","🏥","🎮","💼","💻","📈","📌","🎓","🏠","✈️","🎵","🏋️","💊","🐾","💰","🛒","📱"];
const TYPES = ["expense", "income", "both"];

export default function ManageCategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("📌");
  const [catType, setCatType] = useState("expense");
  const [saving, setSaving] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "categories"));
      const cats = [];
      snap.forEach((d) => cats.push({ id: d.id, ...d.data() }));
      setCategories(cats.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setCatName("");
    setCatIcon("📌");
    setCatType("expense");
    setModalVisible(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setCatName(cat.name);
    setCatIcon(cat.icon);
    setCatType(cat.type);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!catName.trim()) {
      Alert.alert("Error", "Category name is required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "users", user.uid, "categories", editingId), {
          name: catName.trim(),
          icon: catIcon,
          type: catType,
        });
      } else {
        await addDoc(collection(db, "users", user.uid, "categories"), {
          name: catName.trim(),
          icon: catIcon,
          type: catType,
          createdAt: new Date().toISOString(),
        });
      }
      setModalVisible(false);
      await loadCategories();
    } catch (e) {
      Alert.alert("Error", "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat) => {
    Alert.alert("Delete Category", `Delete "${cat.name}"? This won't delete existing transactions.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", user.uid, "categories", cat.id));
            setCategories((prev) => prev.filter((c) => c.id !== cat.id));
          } catch (e) {
            Alert.alert("Error", "Failed to delete category.");
          }
        },
      },
    ]);
  };

  const typeColor = (type) => {
    if (type === "income") return { bg: "#E1F5EE", text: "#0F6E56" };
    if (type === "expense") return { bg: "#FAECE7", text: "#993C1D" };
    return { bg: "#EEEDFE", text: "#3C3489" };
  };

  const renderItem = ({ item }) => {
    const colors = typeColor(item.type);
    return (
      <View style={styles.catItem}>
        <Text style={styles.catItemIcon}>{item.icon}</Text>
        <View style={styles.catItemInfo}>
          <Text style={styles.catItemName}>{item.name}</Text>
          <View style={[styles.typeBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.typeBadgeText, { color: colors.text }]}>{item.type}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
          <Text style={styles.editBtnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.delBtn}>
          <Text style={styles.delBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={openAdd}>
        <Text style={styles.addButtonText}>+ Add New Category</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#1D9E75" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🗂️</Text>
              <Text style={styles.emptyText}>No categories yet. Add one!</Text>
            </View>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? "Edit Category" : "New Category"}</Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Category name"
              placeholderTextColor="#aaa"
              value={catName}
              onChangeText={setCatName}
            />

            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[styles.iconOption, catIcon === ic && styles.iconOptionSelected]}
                  onPress={() => setCatIcon(ic)}
                >
                  <Text style={styles.iconText}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, catType === t && styles.typeChipSelected]}
                  onPress={() => setCatType(t)}
                >
                  <Text style={[styles.typeChipText, catType === t && styles.typeChipTextSelected]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0faf4" },
  addButton: {
    margin: 16, backgroundColor: "#1D9E75", padding: 14,
    borderRadius: 12, alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  catItem: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 12, padding: 12, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  catItemIcon: { fontSize: 28, marginRight: 12 },
  catItemInfo: { flex: 1 },
  catItemName: { fontSize: 15, fontWeight: "500", color: "#333", marginBottom: 4 },
  typeBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  typeBadgeText: { fontSize: 11, fontWeight: "bold" },
  editBtn: { padding: 8 },
  editBtnText: { fontSize: 18 },
  delBtn: { padding: 8 },
  delBtnText: { fontSize: 18 },
  empty: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#888" },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1D9E75", marginBottom: 16, textAlign: "center" },
  label: { fontSize: 13, color: "#555", marginBottom: 6, marginTop: 12, fontWeight: "500" },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 12, fontSize: 15, color: "#333", backgroundColor: "#fafafa",
  },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  iconOption: {
    width: 44, height: 44, borderRadius: 10, justifyContent: "center",
    alignItems: "center", backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#eee",
  },
  iconOptionSelected: { backgroundColor: "#E1F5EE", borderColor: "#1D9E75" },
  iconText: { fontSize: 22 },
  typeRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  typeChip: {
    flex: 1, padding: 10, borderRadius: 10, alignItems: "center",
    backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#eee",
  },
  typeChipSelected: { backgroundColor: "#1D9E75", borderColor: "#1D9E75" },
  typeChipText: { fontSize: 13, color: "#555", fontWeight: "500" },
  typeChipTextSelected: { color: "#fff" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 10, alignItems: "center",
    borderWidth: 1.5, borderColor: "#ddd",
  },
  cancelBtnText: { color: "#666", fontSize: 15 },
  saveBtn: {
    flex: 1, padding: 14, borderRadius: 10,
    alignItems: "center", backgroundColor: "#1D9E75",
  },
  saveBtnDisabled: { backgroundColor: "#9FE1CB" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});
