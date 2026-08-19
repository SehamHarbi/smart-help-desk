// React tools for storing and loading ticket data.
import { useEffect, useState } from "react"

// Lets us move between pages.
import { useNavigate } from "react-router-dom"

import "../App.css"


function AdminDashboard() {
  const navigate = useNavigate()

  // Store every ticket returned by FastAPI.
  const [tickets, setTickets] = useState([])

  // Used while tickets are loading.
  const [loading, setLoading] = useState(true)

  // Store backend errors.
  const [error, setError] = useState("")

  // Store which priority box is currently selected.
  const [priorityFilter, setPriorityFilter] = useState("All")

  // Store which ticket status is selected.
  const [statusFilter, setStatusFilter] = useState("All")

  // Store which category is selected.
  const [categoryFilter, setCategoryFilter] = useState("All")

  // Read the logged-in admin from localStorage.
  const storedUser = localStorage.getItem("user")
  const user = storedUser
    ? JSON.parse(storedUser)
    : null


  // ========================================
  // ACTIVE TICKET FILTERING
  // ========================================

  // The admin's main feed should only contain
  // tickets that still need attention.
  const activeTickets = tickets.filter(
    (ticket) =>
      ticket.status === "Open" ||
      ticket.status === "In Progress"
  )


  // ========================================
  // ACTIVE TICKET COUNTS
  // ========================================

  const highCount = activeTickets.filter(
    (ticket) => ticket.priority === "High"
  ).length

  const mediumCount = activeTickets.filter(
    (ticket) => ticket.priority === "Medium"
  ).length

  const lowCount = activeTickets.filter(
    (ticket) => ticket.priority === "Low"
  ).length

  // Tickets where the AI did not provide a priority.
  const notClassifiedCount = activeTickets.filter(
    (ticket) => !ticket.priority
  ).length


  // ========================================
  // COMBINED FILTERING
  // ========================================

  // Start with every active ticket.
  let filteredTickets = activeTickets


  // ----- Priority filter -----

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

  if (priorityFilter === "Not Classified") {
    filteredTickets = filteredTickets.filter(
      (ticket) => !ticket.priority
    )
  }


  // ----- Status filter -----

  if (statusFilter !== "All") {
    filteredTickets = filteredTickets.filter(
      (ticket) =>
        ticket.status === statusFilter
    )
  }


  // ----- Category filter -----

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

      // Users without authentication must log in again.
      if (!token) {
        navigate("/")
        return
      }

      // Normal users should not see the admin dashboard.
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

        setTickets(data)

      } catch (error) {
        setError(error.message)

      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [navigate, user?.role])


  // ========================================
  // LOG OUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")

    navigate("/")
  }


  return (
    <main className="dashboard-page">

      {/* Admin navigation bar */}
      <header className="dashboard-header">
        <div>
          <h1>Smart Help Desk</h1>
          <p>Admin Portal</p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>


      <section className="dashboard-content">

        {/* Admin introduction */}
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

          <div className="admin-ticket-heading">
            <div>
              <h3>Active Tickets</h3>

              <p>
                Tickets that still require
                attention from IT Support.
              </p>
            </div>
          </div>


          {/* =========================
              PRIORITY SUMMARY BOXES
              ========================= */}

          <div className="priority-summary-grid">

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
              <span>All Active</span>

              <strong>
                {activeTickets.length}
              </strong>
            </button>


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
              <span>High</span>

              <strong>
                {highCount}
              </strong>
            </button>


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
              <span>Medium</span>

              <strong>
                {mediumCount}
              </strong>
            </button>


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
              <span>Low</span>

              <strong>
                {lowCount}
              </strong>
            </button>


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

              <button
                className={`filter-button ${
                  statusFilter === "All"
                    ? "active-filter"
                    : ""
                }`}
                onClick={() =>
                  setStatusFilter("All")
                }
              >
                All
              </button>

              <button
                className={`filter-button ${
                  statusFilter === "Open"
                    ? "active-filter"
                    : ""
                }`}
                onClick={() =>
                  setStatusFilter("Open")
                }
              >
                Open
              </button>

              <button
                className={`filter-button ${
                  statusFilter === "In Progress"
                    ? "active-filter"
                    : ""
                }`}
                onClick={() =>
                  setStatusFilter("In Progress")
                }
              >
                In Progress
              </button>

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


          {/* =========================
              EMPTY FILTER RESULT
              ========================= */}

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

            {filteredTickets.map(
              (ticket) => (
                <article
                  className="ticket-card clickable-ticket-card"
                  key={ticket.id}

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
              )
            )}

          </div>

        </section>

      </section>
    </main>
  )
}

export default AdminDashboard