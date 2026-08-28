import { Navigate, Route, Routes } from 'react-router'
import BoardPage from '@/routes/BoardPage'
import LoginPage from '@/routes/LoginPage'
import NotFoundPage from '@/routes/NotFoundPage'
import SignupPage from '@/routes/SignupPage'
import WorkspacesPage from '@/routes/WorkspacesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workspaces" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/workspaces" element={<WorkspacesPage />} />
      <Route path="/boards/:boardId" element={<BoardPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
