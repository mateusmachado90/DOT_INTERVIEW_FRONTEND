import { AdminTutorsPage } from "./pages/AdminTutorsPage";
import { TutorWidgetPage } from "./pages/TutorWidgetPage";

type Route =
  | { name: "admin" }
  | { name: "widget"; tutorId: string | null };

function getRoute(pathname: string): Route {
  const widgetMatch = pathname.match(/^\/widget\/([^/]+)$/);

  if (widgetMatch) {
    return { name: "widget", tutorId: widgetMatch[1] };
  }

  return { name: "admin" };
}

export function App() {
  const route = getRoute(window.location.pathname);

  if (route.name === "widget") {
    return <TutorWidgetPage tutorId={route.tutorId} />;
  }

  return <AdminTutorsPage />;
}
