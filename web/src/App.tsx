import { Navigate, Route, Routes } from "react-router";
import PagePlaceholder from "@/components/PagePlaceholder";
import { workspaces } from "@/data/fixtures";
import AppLayout from "@/layouts/AppLayout";
import BoardPage from "@/routes/BoardPage";
import BoardsPage from "@/routes/BoardsPage";
import LoginPage from "@/routes/LoginPage";
import NotFoundPage from "@/routes/NotFoundPage";
import SignupPage from "@/routes/SignupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workspaces" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<AppLayout />}>
        <Route
          path="/workspaces"
          element={<Navigate to={`/workspaces/${workspaces[0].id}`} replace />}
        />
        <Route path="/workspaces/:workspaceId" element={<BoardsPage />} />
        <Route
          path="/workspaces/:workspaceId/members"
          element={
            <PagePlaceholder title="Members" note="Built in slice 12d." />
          }
        />
        <Route path="/boards/:boardId" element={<BoardPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
