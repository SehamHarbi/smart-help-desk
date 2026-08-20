// React tools for storing and loading ticket data.
import { useEffect, useState } from "react"

// Lets us move between pages.
import { useNavigate } from "react-router-dom"

import "../App.css"
import Header from "../components/Header"
import Footer from "../components/Footer"

function ResolvedTickets() {
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [priorityFilter, setPriorityFilter] =
    useState("All")

  const [categoryFilter, setCategoryFilter] =
    useState("All")

  // Read the logged-in administrator.
  const storedUser = localStorage.getItem("user")

  const user = storedUser
    ? JSON.parse(storedUser)
    : null


  // ========================================
  // RESOLVED TICKET FILTERING
  // ========================================

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  )

  let filteredTickets = resolvedTickets


  if (priorityFilter !== "All") {
    filteredTickets = filteredTickets.filter(
      (ticket) =>
        ticket.priority === priorityFilter
    )
  }


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

      if (!token) {
        navigate("/")
        return
      }

      // Only administrators may view this page.
      if (user?.role !== "admin") {
        navigate("/dashboard")
        return
      }

      try {
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
              "Unable to load resolved tickets"
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


  return (
    <main className="dashboard-page">

      {/* Shared application header */}
      <Header />


      <section className="dashboard-content">

        {/* Return to active admin workload */}
        <button
          className="back-button"
          onClick={() =>
            navigate("/admin")
          }
        >
          ← Back to Active Tickets
        </button>


        <div className="resolved-page-heading">

          <h2>
            Resolved History
          </h2>

          <p>
            Review support requests that have been
            completed by IT Support.
          </p>

        </div>


        {/* =========================
            HISTORICAL FILTERS
            ========================= */}
        <div className="resolved-filter-bar">

          <div className="resolved-filter-group">

            <label
              htmlFor="resolved-priority"
              className="filter-label"
            >
              Priority
            </label>

            <select
              id="resolved-priority"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Priorities
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>

            </select>

          </div>


          <div className="resolved-filter-group">

            <label
              htmlFor="resolved-category"
              className="filter-label"
            >
              Category
            </label>

            <select
              id="resolved-category"
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


        {loading && (
          <p className="dashboard-message">
            Loading resolved tickets...
          </p>
        )}


        {error && (
          <p className="dashboard-error">
            {error}
          </p>
        )}


        {!loading &&
          !error &&
          filteredTickets.length === 0 && (

            <div className="empty-tickets">

              <h4>
                No resolved tickets found
              </h4>

              <p>
                There are no completed tickets
                matching these filters.
              </p>

            </div>

          )}


        <div className="ticket-list">

          {filteredTickets.map((ticket) => (

            <article
              className="ticket-card clickable-ticket-card"
              key={ticket.id}

              // Tell TicketDetails that the admin
              // opened the ticket from Resolved History.
              onClick={() =>
                navigate(
                  `/tickets/${ticket.id}`,
                  {
                    state: {
                      from: "/admin/resolved",
                      backLabel:
                        "Resolved History",
                    },
                  }
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

                <span className="status-badge status-resolved">
                  Resolved
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
      <Footer />
    </main>
  )
}

export default ResolvedTickets