import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./providers/AuthProvider";
import { SocketProvider } from "./providers/SocketProvider";

function App() {
  return (
    <>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" richColors />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </>
  );
}

export default App;
