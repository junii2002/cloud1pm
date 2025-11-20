import React from "react";
import AppRouter from "./routes/AppRouter";
import "./styles.css";
import { AuthProvider } from "./context/AuthContext";


function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
