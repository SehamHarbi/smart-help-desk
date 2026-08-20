// React tools for storing and loading ticket data.
import { useEffect, useState } from "react"

// Lets us move between pages.
import { useNavigate } from "react-router-dom"

import "../App.css"
import Header from "../components/Header"
import Footer from "../components/Footer"

function AdminDashboard() {
  const navigate = useNavigate()

  // Store every ticket returned by FastAPI.
  const [tickets, setTickets] = useState([])

  // Used while tickets are loading.
  const [loading, setLoading] = useState(true)

  // Store backend errors.
  const [error, setError] = useState("")

  // Admin dashboard filters.
  const [priorityFilter, setPriorityFilter] =
    useState("All")

  const [statusFilter, setStatusFilter] =
    useState("All")

  const [categoryFilter, setCategoryFilter] =
    useState("All")


  // Read the logged-in admin from localStorage.
  const storedUser = localStorage.getItem("user")

  const user = storedUser
    ? JSON.parse(storedUser)
    : null


  // ========================================
  // ACTIVE TICKETS
  // ========================================

  // Resolved tickets are intentionally excluded
  // from the admin's daily workload.
  const activeTickets = tickets.filter(
    (ticket) =>
      ticket.status === "Open" ||
      ticket.status === "In Progress"
  )


  // Count active tickets by priority.
  const highCount = activeTickets.filter(
    (ticket) => ticket.priority === "High"
  ).length

  const mediumCount = activeTickets.filter(
    (ticket) => ticket.priority === "Medium"
  ).length

  const lowCount = activeTickets.filter(
    (ticket) => ticket.priority === "Low"
  ).length

  // Tickets where AI did not provide a priority.
  const notClassifiedCount = activeTickets.filter(
    (ticket) => !ticket.priority
  ).length


  // ========================================
  // COMBINED FILTERING
  // ========================================

  // Start with every active ticket.
  let filteredTickets = activeTickets


  // Filter by High / Medium / Low priority.
  if (
    priorityFilter === "High" ||
    priorityFilter === "Medium" ||
    priorityFilter === "Low"
  ) {
    filteredTickets = filteredTickets.filter(
      (ticket) =>
        ticket.priority === priorityFilter
    )
  }


  // Filter tickets that were not classified by AI.
  if (priorityFilter === "Not Classified") {
    filteredTickets = filteredTickets.filter(
      (ticket) => !ticket.priority
    )
  }


  // Filter by Open or In Progress status.
  if (statusFilter !== "All") {
    filteredTickets = filteredTickets.filter(
      (ticket) =>
        ticket.status === statusFilter
    )
  }


  // Filter by IT category.
  if (categoryFilter !== "All") {
    filteredTickets = filteredTickets.filter(
      (ticket) =>
        ticket.category === categoryFilter
    )
  }


  // ========================================
  // LOAD TICKETS
  // ========================================

  useEffect(() => {
    const loadTickets = async () => {
      const token =
        localStorage.getItem("access_token")

      // User must be authenticated.
      if (!token) {
        navigate("/")
        return
      }

      // Normal users cannot access the admin dashboard.
      if (user?.role !== "admin") {
        navigate("/dashboard")
        return
      }

      try {
        // Admin GET /tickets returns all tickets.
        const response = await fetch(
          "http://127.0.0.1:8000/tickets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Unable to load tickets"
          )
        }

        // Save all tickets returned by FastAPI.
        setTickets(data)

      } catch (error) {
        setError(error.message)

      } finally {
        setLoading(false)
      }
    }

    loadTickets()

  }, [navigate, user?.role])


  return (
    <main className="dashboard-page">

      {/* Shared application header.
          Header handles logo, Home navigation, and Logout. */}
      <Header />


      <section className="dashboard-content">

        {/* =========================
            ADMIN WELCOME
            ========================= */}
        <div className="dashboard-welcome">

          <div>
            <h2>
              Support Dashboard
            </h2>

            <p>
              Welcome,{" "}
              {user?.name || "Administrator"}.
              Review and manage incoming
              support requests.
            </p>
          </div>

        </div>


        {/* =========================
            ACTIVE TICKETS
            ========================= */}
        <section className="ticket-section">

          {/* Active workload heading
              and Resolved History navigation */}
          <div className="admin-ticket-heading admin-ticket-heading-row">

            <div>
              <h3>
                Active Tickets
              </h3>

              <p>
                Tickets that still require
                attention from IT Support.
              </p>
            </div>


            <button
              className="resolved-history-button"
              onClick={() =>
                navigate("/admin/resolved")
              }
            >
              View Resolved History
            </button>

          </div>


          {/* =========================
              PRIORITY SUMMARY
              ========================= */}
          <div className="priority-summary-grid">

            {/* All active tickets */}
            <button
              className={`priority-summary-card priority-all ${
                priorityFilter === "All"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setPriorityFilter("All")
              }
            >
              <span>
                All Active
              </span>

              <strong>
                {activeTickets.length}
              </strong>
            </button>


            {/* High priority */}
            <button
              className={`priority-summary-card priority-high ${
                priorityFilter === "High"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setPriorityFilter("High")
              }
            >
              <span>
                High
              </span>

              <strong>
                {highCount}
              </strong>
            </button>


            {/* Medium priority */}
            <button
              className={`priority-summary-card priority-medium ${
                priorityFilter === "Medium"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setPriorityFilter("Medium")
              }
            >
              <span>
                Medium
              </span>

              <strong>
                {mediumCount}
              </strong>
            </button>


            {/* Low priority */}
            <button
              className={`priority-summary-card priority-low ${
                priorityFilter === "Low"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setPriorityFilter("Low")
              }
            >
              <span>
                Low
              </span>

              <strong>
                {lowCount}
              </strong>
            </button>


            {/* AI classification failure */}
            <button
              className={`priority-summary-card priority-unclassified ${
                priorityFilter === "Not Classified"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setPriorityFilter(
                  "Not Classified"
                )
              }
            >
              <span>
                Not Classified
              </span>

              <strong>
                {notClassifiedCount}
              </strong>
            </button>

          </div>


          {/* =========================
              STATUS + CATEGORY FILTERS
              ========================= */}
          <div className="admin-filter-bar">

            {/* Status filters */}
            <div className="status-filter-group">

              <span className="filter-label">
                Status
              </span>


              {[
                "All",
                "Open",
                "In Progress",
              ].map((status) => (

                <button
                  key={status}
                  className={`filter-button ${
                    statusFilter === status
                      ? "active-filter"
                      : ""
                  }`}
                  onClick={() =>
                    setStatusFilter(status)
                  }
                >
                  {status}
                </button>

              ))}

            </div>


            {/* Category filter */}
            <div className="category-filter-group">

              <label
                htmlFor="category-filter"
                className="filter-label"
              >
                Category
              </label>


              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >

                <option value="All">
                  All Categories
                </option>

                <option value="Hardware">
                  Hardware
                </option>

                <option value="Software">
                  Software
                </option>

                <option value="Network">
                  Network
                </option>

                <option value="Account">
                  Account
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

          </div>


          {/* =========================
              LOADING / ERROR
              ========================= */}

          {loading && (
            <p className="dashboard-message">
              Loading tickets...
            </p>
          )}


          {error && (
            <p className="dashboard-error">
              {error}
            </p>
          )}


          {/* No tickets match the current filters */}
          {!loading &&
            !error &&
            filteredTickets.length === 0 && (

              <div className="empty-tickets">

                <h4>
                  No matching active tickets
                </h4>

                <p>
                  Try changing the priority,
                  status, or category filters.
                </p>

              </div>

            )}


          {/* =========================
              ACTIVE TICKET LIST
              ========================= */}
          <div className="ticket-list">

            {filteredTickets.map((ticket) => (

              <article
                className="ticket-card clickable-ticket-card"
                key={ticket.id}

                // Open the selected ticket.
                onClick={() =>
                  navigate(
                    `/tickets/${ticket.id}`
                  )
                }
              >

                <div className="ticket-card-top">

                  <div>
                    <span className="ticket-number">
                      Ticket #{ticket.id}
                    </span>

                    <h4>
                      {ticket.title}
                    </h4>
                  </div>


                  {/* Current ticket status */}
                  <span
                    className={`status-badge status-${ticket.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {ticket.status}
                  </span>

                </div>


                <p className="ticket-description">
                  {ticket.description}
                </p>


                <div className="ticket-meta">

                  <span>
                    User ID:{" "}
                    <strong>
                      {ticket.owner_id}
                    </strong>
                  </span>


                  <span>
                    Category:{" "}
                    <strong>
                      {ticket.category ||
                        "Not classified"}
                    </strong>
                  </span>


                  <span>
                    Priority:{" "}
                    <strong>
                      {ticket.priority ||
                        "Not classified"}
                    </strong>
                  </span>

                </div>

              </article>

            ))}

          </div>

        </section>

      </section>
     <Footer />
    </main>
  )
}

export default AdminDashboard