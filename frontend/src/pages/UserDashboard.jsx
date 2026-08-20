// React tools for running code after the page loads
// and storing data returned from the backend.
import { useEffect, useState } from "react"

// Lets us move the user between pages.
import { useNavigate } from "react-router-dom"

import "../App.css"
import Header from "../components/Header"
import Footer from "../components/Footer"


function UserDashboard() {
  // Store the user's tickets from FastAPI.
  const [tickets, setTickets] = useState([])

  // Show a loading message while tickets are being fetched.
  const [loading, setLoading] = useState(true)

  // Store any error returned while loading tickets.
  const [error, setError] = useState("")

  const navigate = useNavigate()

  // Read the logged-in user's information from localStorage.
  const storedUser = localStorage.getItem("user")
  const user = storedUser
    ? JSON.parse(storedUser)
    : null


  // ========================================
  // LOAD USER TICKETS
  // ========================================

  useEffect(() => {
    const loadTickets = async () => {
      // Get the JWT that was saved after login.
      const token =
        localStorage.getItem("access_token")

      // If there is no token, the user should not see the dashboard.
      if (!token) {
        navigate("/")
        return
      }

      try {
        // Ask FastAPI for the current user's active tickets.
        const response = await fetch(
          "http://127.0.0.1:8000/tickets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        // If the token is invalid or another error happened,
        // show the backend's message.
        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Unable to load tickets"
          )
        }

        // Save the tickets so React can display them.
        setTickets(data)

      } catch (error) {
        setError(error.message)

      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [navigate])


  return (
    <main className="dashboard-page">

      {/* Shared application header */}
      <Header />


      <section className="dashboard-content">

        {/* =========================
            WELCOME AREA
            ========================= */}
        <div className="dashboard-welcome">

          <div>
            <h2>
              Welcome, {user?.name || "User"}
            </h2>

            <p>
              Track and manage your support requests.
            </p>
          </div>


          {/* Open the new-ticket form */}
          <button
            className="new-ticket-button"
            onClick={() =>
              navigate("/tickets/new")
            }
          >
            + New Ticket
          </button>

        </div>


        {/* =========================
            ACTIVE TICKET SECTION
            ========================= */}
        <section className="ticket-section">

          <div className="tickets-section-header">

            <h3>
              My Tickets
            </h3>


            {/* Open the user's archived ticket history */}
            <button
              className="archive-link-button"
              onClick={() =>
                navigate("/archived")
              }
            >
              View Archived Tickets
            </button>

          </div>


          {/* Loading state */}
          {loading && (
            <p className="dashboard-message">
              Loading tickets...
            </p>
          )}


          {/* Error state */}
          {error && (
            <p className="dashboard-error">
              {error}
            </p>
          )}


          {/* Empty state */}
          {!loading &&
            !error &&
            tickets.length === 0 && (

              <div className="empty-tickets">

                <h4>
                  No active tickets
                </h4>

                <p>
                  You don't currently have any
                  active support requests.
                </p>

              </div>

            )}


          {/* =========================
              USER TICKET LIST
              ========================= */}
          <div className="ticket-list">

            {tickets.map((ticket) => (

              <article
                className="ticket-card clickable-ticket-card"
                key={ticket.id}

                // Open the selected ticket's details page.
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


                  {/* Ticket status */}
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

        </section>

      </section>


      {/* Shared application footer */}
      <Footer />

    </main>
  )
}

export default UserDashboard