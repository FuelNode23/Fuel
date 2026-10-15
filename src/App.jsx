import AppRoutes from "./routes/AppRoutes";
import SiteLogo from "./components/SiteLogo.jsx";
import NativeBridge from "./native/NativeBridge.jsx";

function App() {
  return (
    <>
      <NativeBridge />
      <SiteLogo />
      <AppRoutes />
    </>
  );
}

export default App;