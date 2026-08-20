// useEffect loads the archived tickets when the page opens.
// useState stores the tickets, loading state, and errors.
import { useEffect, useState } from "react"

// useNavigate lets us return to the dashboard or login page.
import { useNavigate } from "react-router-dom"

import "../App.css"
import Header from "../components/Header"
import Footer from "../components/Footer"


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
      const token =
        localStorage.getItem("access_token")

      // User must be logged in.
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
            data.detail ||
              "Unable to load archived tickets"
          )
        }

        // Save archived tickets so React can display them.
        setTickets(data)

      } catch (error) {
        setError(error.message)

      } finally {
        setLoading(false)
      }
    }

    loadArchivedTickets()
  }, [navigate])


  return (
    <main className="dashboard-page">

      {/* Shared application header.
          Header handles logo, Home navigation, and Logout. */}
      <Header />


      <section className="dashboard-content">

        {/* Return to the user's active tickets */}
        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to My Tickets
        </button>


        {/* =========================
            ARCHIVED PAGE HEADING
            ========================= */}
        <div className="archived-page-heading">

          <h2>
            Archived Tickets
          </h2>

          <p>
            Resolved support requests you have archived.
          </p>

        </div>


        {/* =========================
            LOADING / ERROR
            ========================= */}

        {loading && (
          <p className="dashboard-message">
            Loading archived tickets...
          </p>
        )}


        {error && (
          <p className="dashboard-error">
            {error}
          </p>
        )}


        {/* =========================
            EMPTY ARCHIVE
            ========================= */}

        {!loading &&
          !error &&
          tickets.length === 0 && (

            <div className="empty-tickets">

              <h4>
                No archived tickets
              </h4>

              <p>
                You don't have any archived
                support requests yet.
              </p>

            </div>

          )}


        {/* =========================
            ARCHIVED TICKET LIST
            ========================= */}

        {!loading &&
          !error &&
          tickets.length > 0 && (

            <div className="ticket-list">

              {tickets.map((ticket) => (

                <article
                  key={ticket.id}
                  className="ticket-card clickable-ticket-card"

                  // Tell TicketDetails that this ticket
                  // was opened from Archived Tickets.
                  //
                  // This allows the Back button inside
                  // TicketDetails to return here.
                  onClick={() =>
                    navigate(
                      `/tickets/${ticket.id}`,
                      {
                        state: {
                          from: "/archived",
                          backLabel:
                            "Archived Tickets",
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


                    {/* Archived tickets should
                        already be Resolved. */}
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

          )}

      </section>
      <Footer />
    </main>
  )
}

export default ArchivedTickets