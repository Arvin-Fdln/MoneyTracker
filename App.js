// App.js
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import MainMenuScreen from "./screens/MainMenuScreen";
import AddIncomeScreen from "./screens/AddIncomeScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import ViewTransactionsScreen from "./screens/ViewTransactionsScreen";
import ViewSummaryScreen from "./screens/ViewSummaryScreen";
import ManageCategoriesScreen from "./screens/ManageCategoriesScreen";

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes (handles login persistence)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0faf4" }}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#1D9E75" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {user ? (
          // Authenticated screens
          <>
            <Stack.Screen
              name="MainMenu"
              component={MainMenuScreen}
              options={{ title: "Money Tracker", headerLeft: null }}
            />
            <Stack.Screen name="AddIncome" component={AddIncomeScreen} options={{ title: "Add Income" }} />
            <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: "Add Expense" }} />
            <Stack.Screen name="ViewTransactions" component={ViewTransactionsScreen} options={{ title: "Transactions" }} />
            <Stack.Screen name="ViewSummary" component={ViewSummaryScreen} options={{ title: "Summary" }} />
            <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} options={{ title: "Categories" }} />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Create Account" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
