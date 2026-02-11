import ToastNotifyWrapper from "@components/common/toast-notify";
import { AuthProvider } from "@contexts/AuthProvider";
import AppRouter from "@router/AppRouter";

function App() {
  return (
    <>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
      <ToastNotifyWrapper />
    </>
  );
}

export default App;
