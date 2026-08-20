// useState stores the values typed into the ticket form.
import { useState } from "react"

// useNavigate lets us move between pages.
import { useNavigate } from "react-router-dom"

import "../App.css"
import Header from "../components/Header"
import Footer from "../components/Footer"

function CreateTicket() {
  const navigate = useNavigate()

  // Store the information entered by the user.
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  // Used for loading and error messages.
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  // ========================================
  // CREATE NEW TICKET
  // ========================================

  const handleSubmit = async (event) => {
    // Prevent the browser from refreshing the page.
    event.preventDefault()

    setLoading(true)
    setError("")

    // Get the JWT created when the user logged in.
    const token =
      localStorage.getItem("access_token")

    // A user without a token must log in again.
    if (!token) {
      navigate("/")
      return
    }

    try {
      // Send the new ticket to our FastAPI backend.
      const response = await fetch(
        "http://127.0.0.1:8000/tickets",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            // Proves to FastAPI which user
            // is creating the ticket.
            Authorization: `Bearer ${token}`,
          },

          // The user only provides title and description.
          // Category, priority, and AI suggestion
          // are handled by the backend.
          body: JSON.stringify({
            title: title,
            description: description,
          }),
        }
      )

      // Convert FastAPI's JSON response
      // into JavaScript data.
      const data = await response.json()

     if (!response.ok) {
  // FastAPI validation errors return "detail" as an array.
  // Extract the readable message instead of showing [object Object].
  if (Array.isArray(data.detail)) {
  const message =
    data.detail[0]?.msg ||
    "Please check the information you entered"

  throw new Error(
    message.replace(/^Value error,\s*/i, "")
  )
}

  throw new Error(
    data.detail || "Unable to create ticket"
  )
}

      // Ticket was created successfully.
      // Return to the dashboard, which will
      // load the updated ticket list.
      navigate("/dashboard")

    } catch (error) {
      setError(error.message)

    } finally {
      setLoading(false)
    }
  }


  return (
    <main className="dashboard-page">

      {/* Shared application header.
          Header handles logo, Home navigation, and Logout. */}
      <Header />


      <section className="create-ticket-container">

        {/* Return to the user's active-ticket dashboard */}
        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to My Tickets
        </button>


        <div className="create-ticket-card">

          <h2>
            Create a support ticket
          </h2>

          <p className="create-ticket-subtitle">
            Describe the problem you're experiencing
            and we'll help route your request.
          </p>


          <form onSubmit={handleSubmit}>

            {/* =========================
                TICKET TITLE
                ========================= */}
            <div className="form-group">

              <label htmlFor="title">
                Title
              </label>

              <input
                id="title"
                type="text"
                placeholder="Example: Cannot connect to office Wi-Fi"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                required
              />

            </div>


            {/* =========================
                TICKET DESCRIPTION
                ========================= */}
            <div className="form-group">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                placeholder="Describe what is happening and any steps you already tried..."
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                required
              />

            </div>


            {/* Only appears if ticket creation fails */}
            {error && (
              <p className="dashboard-error">
                {error}
              </p>
            )}


            {/* =========================
                FORM ACTIONS
                ========================= */}
            <div className="ticket-form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="new-ticket-button"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Ticket"}
              </button>

            </div>

          </form>

        </div>

      </section>
    <Footer />

    </main>
  )
}

export default CreateTicket