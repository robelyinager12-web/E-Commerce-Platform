import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { SavedListingsProvider } from "./context/SavedListingsContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <SavedListingsProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </SavedListingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;