import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'

// Auth
import LoginPage       from './pages/Login.jsx'

// Dashboard pages
import Overview        from './pages/Overview.jsx'
import Accounts        from './pages/Accounts.jsx'
import AccountDetail   from './pages/AccountDetail.jsx'
import Characters      from './pages/Characters.jsx'
import CharacterDetail from './pages/CharacterDetail.jsx'
import PlayKeys        from './pages/PlayKeys.jsx'
import Moderation      from './pages/Moderation.jsx'
import BugReports      from './pages/BugReports.jsx'
import Properties      from './pages/Properties.jsx'
import Commands        from './pages/Commands.jsx'
import Logs            from './pages/Logs.jsx'
import Settings        from './pages/Settings.jsx'

// Partie 2 — nouvelles pages
import SendMail        from './pages/SendMail.jsx'
import Reports         from './pages/Reports.jsx'
import AuditLog        from './pages/AuditLog.jsx'
import PlayerDashboard from './pages/PlayerDashboard.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — tout sous /dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index                           element={<Navigate to="/overview" replace />} />
            <Route path="/overview"                element={<Overview />} />
            <Route path="/accounts"                element={<Accounts />} />
            <Route path="/accounts/:id"            element={<AccountDetail />} />
            <Route path="/characters"              element={<Characters />} />
            <Route path="/characters/:id"          element={<CharacterDetail />} />
            <Route path="/play-keys"               element={<PlayKeys />} />
            <Route path="/moderation"              element={<Moderation />} />
            <Route path="/bug-reports"             element={<BugReports />} />
            <Route path="/properties"              element={<Properties />} />
            <Route path="/commands"                element={<Commands />} />
            <Route path="/logs"                    element={<Logs />} />
            <Route path="/settings"                element={<Settings />} />
            {/* Partie 2 */}
            <Route path="/send-mail"               element={<SendMail />} />
            <Route path="/reports"                 element={<Reports />} />
            <Route path="/audit-log"               element={<AuditLog />} />
            <Route path="/me"                      element={<PlayerDashboard />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </AuthProvider>
  )
}
