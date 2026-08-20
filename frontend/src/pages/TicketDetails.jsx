// useEffect loads ticket data when this page opens.
// useState stores the ticket, comments, loading state, and errors.
import { useEffect, useState } from "react"

// useLocation remembers which page opened this ticket.
// useParams reads the ticket ID from the URL.
// useNavigate lets us move between pages.
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom"

import "../App.css"
import Header from "../components/Header"
import Footer from "../components/Footer"


function TicketDetails() {
  // Lets us move between pages.
  const navigate = useNavigate()

  // Read information about which page opened this ticket.
  const location = useLocation()

  // Example URL: /tickets/13
  // ticketId will contain "13".
  const { ticketId } = useParams()

  // Read the logged-in user's information from localStorage.
  // We use this to label their own comments as "You".
  const storedUser = localStorage.getItem("user")

  const user = storedUser
    ? JSON.parse(storedUser)
    : null


  // ========================================
  // PAGE STATE
  // ========================================

  // Store the ticket returned by FastAPI.
  const [ticket, setTicket] = useState(null)

  // Store the conversation for this ticket.
  const [comments, setComments] = useState([])

  // Store the new message typed by the user.
  const [newComment, setNewComment] = useState("")

  // Used while waiting for the backend.
  const [loading, setLoading] = useState(true)

  // Store any error returned by the backend.
  const [error, setError] = useState("")

  // Store whether the ticket status is currently being updated.
  const [updatingStatus, setUpdatingStatus] =
    useState(false)

  // Store whether the admin is updating
  // the AI-generated category or priority.
  const [
    updatingClassification,
    setUpdatingClassification,
  ] = useState(false)

  // Store whether the ticket is currently being archived.
  const [archiving, setArchiving] = useState(false)


  // ========================================
  // COMMENT AUTHOR LABEL
  // ========================================

  const getCommentAuthorLabel = (comment) => {
    // If an admin is viewing the ticket...
    if (user?.role === "admin") {

      // A comment written by the ticket owner
      // should be shown as coming from the user.
      if (comment.user_id === ticket?.owner_id) {
        return "User"
      }

      // If the currently logged-in admin wrote it,
      // label it clearly as their own reply.
      if (comment.user_id === user.id) {
        return "You (IT Support)"
      }

      // Comments from another administrator/support account.
      return "IT Support"
    }

    // For a normal user, their own comments appear as "You".
    if (comment.user_id === user?.id) {
      return "You"
    }

    // Anything else visible to the ticket owner
    // came from the support team.
    return "IT Support"
  }


  // ========================================
  // LOAD TICKET + COMMENTS
  // ========================================

  useEffect(() => {
    const loadTicket = async () => {
      // Get the JWT saved when the user logged in.
      const token =
        localStorage.getItem("access_token")

      // A user without a token must log in again.
      if (!token) {
        navigate("/")
        return
      }

      try {
        // ========================================
        // 1. LOAD THE TICKET
        // ========================================

        const response = await fetch(
          `http://127.0.0.1:8000/tickets/${ticketId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        // Show FastAPI's error if access was denied
        // or the ticket does not exist.
        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load ticket"
          )
        }

        // Save the ticket so React can display it.
        setTicket(data)


        // ========================================
        // 2. LOAD THE COMMENTS
        // ========================================

        const commentsResponse = await fetch(
          `http://127.0.0.1:8000/tickets/${ticketId}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const commentsData =
          await commentsResponse.json()

        if (!commentsResponse.ok) {
          throw new Error(
            commentsData.detail ||
              "Unable to load comments"
          )
        }

        // Save the conversation so React can display it.
        setComments(commentsData)

      } catch (error) {
        setError(error.message)

      } finally {
        setLoading(false)
      }
    }

    // Run automatically when this page opens.
    loadTicket()

  }, [ticketId, navigate])


  // ========================================
  // SEND A NEW COMMENT
  // ========================================

  const handleCommentSubmit = async (event) => {
    // Prevent the form from refreshing the page.
    event.preventDefault()

    // Do not send empty comments.
    if (!newComment.trim()) {
      return
    }

    const token =
      localStorage.getItem("access_token")

    if (!token) {
      navigate("/")
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tickets/${ticketId}/comments`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          // The backend identifies the user from the JWT,
          // so React only sends the message itself.
          body: JSON.stringify({
            message: newComment,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to send comment"
        )
      }

      // Keep all existing comments and append
      // the new one to the conversation.
      setComments((currentComments) => [
        ...currentComments,
        data,
      ])

      // Clear the reply box.
      setNewComment("")

    } catch (error) {
      setError(error.message)
    }
  }


  // ========================================
  // UPDATE TICKET STATUS (ADMIN ONLY)
  // ========================================

  const handleStatusChange = async (newStatus) => {
    const token =
      localStorage.getItem("access_token")

    if (!token) {
      navigate("/")
      return
    }

    setUpdatingStatus(true)
    setError("")

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tickets/${ticketId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      )

      const data = await response.json()

      // FastAPI handles permission checks
      // and archived-ticket rules.
      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update ticket status"
        )
      }

      // Replace the current ticket with
      // the updated version from FastAPI.
      setTicket(data)

    } catch (error) {
      setError(error.message)

    } finally {
      setUpdatingStatus(false)
    }
  }


  // ========================================
  // UPDATE AI CLASSIFICATION (ADMIN ONLY)
  // ========================================

  const handleClassificationChange = async (
    newCategory,
    newPriority
  ) => {
    const token =
      localStorage.getItem("access_token")

    if (!token) {
      navigate("/")
      return
    }

    setUpdatingClassification(true)
    setError("")

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tickets/${ticketId}/classification`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            category: newCategory,
            priority: newPriority,
          }),
        }
      )

      const data = await response.json()

      // FastAPI checks that the user is an admin
      // and that the ticket is not archived.
      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update ticket classification"
        )
      }

      setTicket(data)

    } catch (error) {
      setError(error.message)

    } finally {
      setUpdatingClassification(false)
    }
  }


  // ========================================
  // ARCHIVE RESOLVED TICKET (USER ONLY)
  // ========================================

  const handleArchiveTicket = async () => {
    const token =
      localStorage.getItem("access_token")

    if (!token) {
      navigate("/")
      return
    }

    setArchiving(true)
    setError("")

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tickets/${ticketId}/archive`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      // FastAPI checks that:
      // 1. the current user owns the ticket
      // 2. the ticket is already Resolved
      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to archive ticket"
        )
      }

      // After archiving, return to the user's dashboard.
      navigate("/dashboard")

    } catch (error) {
      setError(error.message)

    } finally {
      setArchiving(false)
    }
  }


  // ========================================
  // SMART BACK NAVIGATION
  // ========================================

  // If another page told us where this ticket came from,
  // return to that page.
  //
  // Otherwise use the normal dashboard for the user's role.
  const backDestination =
    location.state?.from ||
    (
      user?.role === "admin"
        ? "/admin"
        : "/dashboard"
    )

  // Matching text for the Back button.
  const backLabel =
    location.state?.backLabel ||
    (
      user?.role === "admin"
        ? "Active Tickets"
        : "My Tickets"
    )


  return (
    <main className="dashboard-page">

      {/* Shared header containing:
          logo, home navigation and logout */}
      <Header />


      <section className="ticket-details-container">

        {/* Return to whichever page opened this ticket */}
        <button
          className="back-button"
          onClick={() =>
            navigate(backDestination)
          }
        >
          ← Back to {backLabel}
        </button>


        {/* Loading message */}
        {loading && (
          <p className="dashboard-message">
            Loading ticket...
          </p>
        )}


        {/* Error message */}
        {error && (
          <p className="dashboard-error">
            {error}
          </p>
        )}


        {/* Only show ticket content once it has loaded */}
        {!loading && !error && ticket && (
          <article className="ticket-details-card">


            {/* =========================
                TICKET HEADER
                ========================= */}

            <div className="ticket-details-header">

              <div>
                <span className="ticket-number">
                  Ticket #{ticket.id}
                </span>

                <h2>{ticket.title}</h2>
              </div>


              {/* Admins can change status.
                  Normal users only see the badge. */}
              {user?.role === "admin" &&
              !ticket.is_archived ? (

                <div className="admin-status-control">

                  <label htmlFor="status">
                    Status
                  </label>

                  <select
                    id="status"
                    value={ticket.status}
                    disabled={updatingStatus}
                    onChange={(event) =>
                      handleStatusChange(
                        event.target.value
                      )
                    }
                  >
                    <option value="Open">
                      Open
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Resolved">
                      Resolved
                    </option>

                  </select>


                  {updatingStatus && (
                    <span className="status-updating">
                      Updating...
                    </span>
                  )}

                </div>

              ) : (

                <span
                  className={`status-badge status-${ticket.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {ticket.status}
                </span>

              )}

            </div>


            {/* =========================
                TICKET INFORMATION
                ========================= */}

            <div className="ticket-details-meta">

              {/* Admins can correct AI classification.
                  Normal users only see final values. */}
              {user?.role === "admin" &&
              !ticket.is_archived ? (

                <>
                  {/* Category override */}
                  <div>
                    <span>Category</span>

                    <select
                      className="admin-classification-select"
                      value={
                        ticket.category ||
                        "Other"
                      }
                      disabled={
                        updatingClassification
                      }
                      onChange={(event) =>
                        handleClassificationChange(
                          event.target.value,
                          ticket.priority ||
                            "Medium"
                        )
                      }
                    >
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


                  {/* Priority override */}
                  <div>
                    <span>Priority</span>

                    <select
                      className="admin-classification-select"
                      value={
                        ticket.priority ||
                        "Medium"
                      }
                      disabled={
                        updatingClassification
                      }
                      onChange={(event) =>
                        handleClassificationChange(
                          ticket.category ||
                            "Other",
                          event.target.value
                        )
                      }
                    >
                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>

                    </select>
                  </div>
                </>

              ) : (

                <>
                  <div>
                    <span>Category</span>

                    <strong>
                      {ticket.category ||
                        "Not classified"}
                    </strong>
                  </div>


                  <div>
                    <span>Priority</span>

                    <strong>
                      {ticket.priority ||
                        "Not classified"}
                    </strong>
                  </div>
                </>

              )}


              <div>
                <span>Created</span>

                <strong>
                  {new Date(
                    ticket.created_at
                  ).toLocaleString()}
                </strong>
              </div>

            </div>


            {/* =========================
                ORIGINAL DESCRIPTION
                ========================= */}

            <section className="ticket-details-section">

              <h3>Description</h3>

              <p>
                {ticket.description}
              </p>

            </section>


            {/* =========================
                AI SUGGESTION
                ========================= */}

            <section className="ai-suggestion-box">

              <div className="ai-suggestion-heading">

                <span className="ai-icon">
                  ✦
                </span>

                <div>
                  <h3>
                    AI Suggested Solution
                  </h3>

                  <p>
                    Try these steps while the
                    support team reviews your request.
                  </p>
                </div>

              </div>


              {ticket.ai_suggestion ? (

                <p className="ai-suggestion-text">
                  {ticket.ai_suggestion}
                </p>

              ) : (

                <p className="ai-suggestion-unavailable">
                  AI troubleshooting is currently
                  unavailable. Your ticket has still
                  been submitted to the support team.
                </p>

              )}

            </section>


            {/* =========================
                SUPPORT CONVERSATION
                ========================= */}

            {/* Active tickets always show conversation.
                Archived tickets only show it if
                conversation history already exists. */}
            {(
              !ticket.is_archived ||
              comments.length > 0
            ) && (

              <section className="conversation-section">

                <div className="conversation-heading">

                  <h3>
                    {ticket.is_archived
                      ? "Conversation History"
                      : "Conversation"}
                  </h3>

                  <p>
                    {ticket.is_archived
                      ? "Messages exchanged before this ticket was archived."
                      : "Updates and messages related to this support request."}
                  </p>

                </div>


                {/* Active ticket with no messages */}
                {!ticket.is_archived &&
                comments.length === 0 ? (

                  <div className="no-comments">
                    <p>
                      No messages yet. You can add
                      more information about the issue below.
                    </p>
                  </div>

                ) : (

                  comments.length > 0 && (

                    <div className="comment-list">

                      {comments.map((comment) => (

                        <div
                          className="comment-card"
                          key={comment.id}
                        >

                          <div className="comment-meta">

                            <strong>
                              {getCommentAuthorLabel(
                                comment
                              )}
                            </strong>


                            <span>
                              {new Date(
                                comment.created_at
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </span>

                          </div>


                          <p>
                            {comment.message}
                          </p>

                        </div>

                      ))}

                    </div>

                  )

                )}


                {/* Archived tickets cannot receive replies */}
                {!ticket.is_archived && (

                  <form
                    className="comment-form"
                    onSubmit={
                      handleCommentSubmit
                    }
                  >

                    <label htmlFor="comment">
                      Add a reply
                    </label>


                    <textarea
                      id="comment"
                      placeholder="Add more information or reply to IT support..."
                      value={newComment}
                      onChange={(event) =>
                        setNewComment(
                          event.target.value
                        )
                      }
                    />


                    <div className="comment-form-actions">

                      <button
                        type="submit"
                        className="new-ticket-button"
                      >
                        Send Reply
                      </button>

                    </div>

                  </form>

                )}

              </section>

            )}


            {/* =========================
                USER ARCHIVE SECTION
                ========================= */}

            {/* Admins do not need the Archive control. */}
            {user?.role !== "admin" &&
            !ticket.is_archived && (

              <section className="archive-section">

                <div>

                  <h3>
                    Archive this ticket
                  </h3>


                  {ticket.status === "Resolved" ? (

                    <p>
                      Your issue has been marked as
                      resolved. You can archive this
                      ticket to remove it from your
                      active ticket list. It will still
                      be available in your archived
                      ticket history.
                    </p>

                  ) : (

                    <p>
                      Tickets can be archived after
                      IT Support marks them as resolved.
                    </p>

                  )}

                </div>


                <button
                  className="archive-button"
                  onClick={handleArchiveTicket}

                  // Only resolved tickets may be archived.
                  disabled={
                    ticket.status !== "Resolved" ||
                    archiving
                  }
                >
                  {archiving
                    ? "Archiving..."
                    : "Archive Ticket"}
                </button>

              </section>

            )}

          </article>
        )}

      </section>
      <Footer />
    </main>
  )
}

export default TicketDetails