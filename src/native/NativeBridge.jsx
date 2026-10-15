// Native-only glue, rendered once inside the router (see App.jsx). Renders
// nothing and does nothing on the website.
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNativeApp, closeExternal, routeFromAppUrl } from "./platform.js";

// Screens where Android's hardware back button should leave the app
// instead of stepping back through history.
const ROOT_ROUTES = ["/", "/landing", "/login", "/athlete-dashboard"];

export default function NativeBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  useEffect(() => {
    if (!isNativeApp()) return undefined;

    document.documentElement.classList.add("native-app");
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

    const handles = [];

    // Deep links back into the app, e.g. after Stripe Checkout:
    // fuelnode://order-confirmed?plan=elite&category=french
    handles.push(
      CapApp.addListener("appUrlOpen", ({ url }) => {
        const route = routeFromAppUrl(url);
        if (!route) return;
        closeExternal();
        navigate(route, { replace: true });
      })
    );

    // Android hardware back button.
    handles.push(
      CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack && !ROOT_ROUTES.includes(pathRef.current)) {
          navigate(-1);
        } else {
          CapApp.exitApp();
        }
      })
    );

    return () => {
      handles.forEach((h) => Promise.resolve(h).then((x) => x.remove()));
    };
  }, [navigate]);

  return null;
}
