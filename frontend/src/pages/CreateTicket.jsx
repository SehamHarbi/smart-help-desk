// useState stores the values typed into the ticket form.
import { useState } from "react"

// useNavigate lets us move between pages.
import { useNavigate } from "react-router-dom"

import "../App.css"


function CreateTicket() {
  const navigate = useNavigate()

  // Store the information entered by the user.
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  // Used for loading and error messages.
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Runs when the user submits the ticket.
  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setError("")

    // Get the JWT created when the user logged in.
    const token = localStorage.getItem("access_token")

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

            // Proves to FastAPI which user is creating the ticket.
            Authorization: `Bearer ${token}`,
          },

          // The user only provides title and description.
          // Category, priority and suggestion are handled by the AI.
          body: JSON.stringify({
            title: title,
            description: description,
          }),
        }
      )

      // Convert FastAPI's JSON response into JavaScript.
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to create ticket"
        )
      }

      // Ticket was successfully created.
      // Return to the dashboard, which will fetch the updated list.
      navigate("/dashboard")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="dashboard-page">

      {/* Same application header used on the dashboard */}
      <header className="dashboard-header">
        <div>
          <h1>Smart Help Desk</h1>
          <p>IT Support Management</p>
        </div>
      </header>

      <section className="create-ticket-container">

        {/* Return to the dashboard without creating a ticket */}
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to My Tickets
        </button>

        <div className="create-ticket-card">
          <h2>Create a support ticket</h2>

          <p className="create-ticket-subtitle">
            Describe the problem you're experiencing and
            we'll help route your request.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Ticket title */}
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

            {/* Detailed description of the IT problem */}
            <div className="form-group">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                placeholder="Describe what is happening and any steps you already tried..."
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
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
    </main>
  )
}

export default CreateTicket