// React Router lets the application display
// different pages depending on the URL.
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

import Login from "./pages/Login"
import UserDashboard from "./pages/UserDashboard"
import CreateTicket from "./pages/CreateTicket"
// Page showing all information for one ticket.
import TicketDetails from "./pages/TicketDetails"
// Admin-only dashboard.
import AdminDashboard from "./pages/AdminDashboard"

import ArchivedTickets from "./pages/ArchivedTickets"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login page */}
        <Route
          path="/"
          element={<Login />}
        />

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
        {/* Dynamic route - ticketId changes depending on the ticket */}
        <Route
         path="/tickets/:ticketId"
         element={<TicketDetails />}
        />

        <Route
         path="/archived"
        element={<ArchivedTickets />}
      />
        {/* Dashboard used by IT support administrators */}
      <Route
       path="/admin"
       element={<AdminDashboard />}
      />

      </Routes>
    </BrowserRouter>
  )
}

export default App