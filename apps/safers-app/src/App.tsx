import { useStompEvents } from "./hooks";
import { AppRoutes } from "./routes";

export function App() {
  useStompEvents();
  return <AppRoutes />;
}
