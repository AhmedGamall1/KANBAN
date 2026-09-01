import { Navigate, Route, Routes } from "react-router";
import RequireAuth from "@/components/RequireAuth";
import AppLayout from "@/layouts/AppLayout";
import BoardPage from "@/routes/BoardPage";
import BoardsPage from "@/routes/BoardsPage";
import LoginPage from "@/routes/LoginPage";
import MembersPage from "@/routes/MembersPage";
import NotFoundPage from "@/routes/NotFoundPage";
import SignupPage from "@/routes/SignupPage";
import WorkspacesIndexPage from "@/routes/WorkspacesIndexPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to="/workspaces" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/workspaces" element={<WorkspacesIndexPage />} />
          <Route path="/workspaces/:workspaceId" element={<BoardsPage />} />
          <Route
            path="/workspaces/:workspaceId/members"
            element={<MembersPage />}
          />
          <Route path="/boards/:boardId" element={<BoardPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
