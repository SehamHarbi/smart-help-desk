// React Router lets the application display
// different pages depending on the URL.
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import UserDashboard from "./pages/UserDashboard"
import CreateTicket from "./pages/CreateTicket"
import TicketDetails from "./pages/TicketDetails"
import AdminDashboard from "./pages/AdminDashboard"
import ArchivedTickets from "./pages/ArchivedTickets"
import ResolvedTickets from "./pages/ResolvedTickets"


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            AUTHENTICATION
            ========================= */}

        {/* Login page */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* Create-account page */}
        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            USER PAGES
            ========================= */}

        {/* User dashboard */}
        <Route
          path="/dashboard"
          element={<UserDashboard />}
        />

        {/* Page for submitting a new support ticket */}
        <Route
          path="/tickets/new"
          element={<CreateTicket />}
        />

        {/* User's archived-ticket history */}
        <Route
          path="/archived"
          element={<ArchivedTickets />}
        />


        {/* =========================
            SHARED TICKET PAGE
            ========================= */}

        {/* Dynamic route:
            ticketId changes depending on which ticket is opened */}
        <Route
          path="/tickets/:ticketId"
          element={<TicketDetails />}
        />


        {/* =========================
            ADMIN PAGES
            ========================= */}

        {/* Main IT support dashboard */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* Completed support-ticket history */}
        <Route
          path="/admin/resolved"
          element={<ResolvedTickets />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App