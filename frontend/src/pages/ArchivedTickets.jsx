// useEffect loads the archived tickets when the page opens.
// useState stores the tickets, loading state, and errors.
import { useEffect, useState } from "react"

// useNavigate lets us return to the dashboard or login page.
import { useNavigate } from "react-router-dom"

import "../App.css"


function ArchivedTickets() {
  const navigate = useNavigate()

  // Store archived tickets returned by FastAPI.
  const [tickets, setTickets] = useState([])

  // Used while waiting for the backend.
  const [loading, setLoading] = useState(true)

  // Store errors returned by the backend.
  const [error, setError] = useState("")


  // ========================================
  // LOAD ARCHIVED TICKETS
  // ========================================

  useEffect(() => {
    const loadArchivedTickets = async () => {
      // Get the JWT saved when the user logged in.
      const token = localStorage.getItem("access_token")

      // No token means the user must log in again.
      if (!token) {
        navigate("/")
        return
      }

      try {
        // Ask FastAPI for this user's archived tickets.
        const response = await fetch(
          "http://127.0.0.1:8000/tickets/archived",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load archived tickets"
          )
        }

        // Save the archived tickets so React can display them.
        setTickets(data)

      } catch (error) {
        setError(error.message)

      } finally {
        setLoading(false)
      }
    }

    loadArchivedTickets()
  }, [navigate])


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

      {/* Same application header used on the user dashboard */}
      <header className="dashboard-header">
        <div>
          <h1>Smart Help Desk</h1>
          <p>IT Support Management</p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>


      <section className="dashboard-content">

        {/* Return to the normal user dashboard */}
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to My Tickets
        </button>


        <div className="archived-page-heading">
          <h2>Archived Tickets</h2>

          <p>
            Resolved support requests you have archived.
          </p>
        </div>


        {/* Waiting for FastAPI */}
        {loading && (
          <p className="dashboard-message">
            Loading archived tickets...
          </p>
        )}


        {/* Backend/network error */}
        {error && (
          <p className="dashboard-error">
            {error}
          </p>
        )}


        {/* No archived tickets */}
        {!loading && !error && tickets.length === 0 && (
          <p className="dashboard-message">
            You don't have any archived tickets yet.
          </p>
        )}


        {/* Archived ticket list */}
        {!loading && !error && tickets.length > 0 && (
          <div className="ticket-list">

            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="ticket-card clickable-ticket-card"
                onClick={() =>
                  navigate(`/tickets/${ticket.id}`)
                }
              >
                <div className="ticket-card-header">
                  <div>
                    <span className="ticket-number">
                      Ticket #{ticket.id}
                    </span>

                    <h3>{ticket.title}</h3>
                  </div>

                  <span
                    className={`status-badge status-${ticket.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <p>{ticket.description}</p>

                <div className="ticket-meta">
                  <span>
                    Category:{" "}
                    <strong>
                      {ticket.category || "Not classified"}
                    </strong>
                  </span>

                  <span>
                    Priority:{" "}
                    <strong>
                      {ticket.priority || "Not classified"}
                    </strong>
                  </span>
                </div>
              </article>
            ))}

          </div>
        )}

      </section>
    </main>
  )
}

export default ArchivedTickets