import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SavedListingsProvider } from "./context/SavedListingsContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SavedListingsProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </SavedListingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;