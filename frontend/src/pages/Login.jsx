// useState lets React remember values such as the email and password.
import { useState } from "react"
import "../App.css"
// Lets us redirect the user after successful login.
import { useNavigate } from "react-router-dom"

function Login() {
  // Store what the user types into the form.
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Store messages that we may need to show to the user.
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

    // Used to move the user to another page.
  const navigate = useNavigate()

  // Runs when the user presses the Sign in button.
  const handleSubmit = async (event) => {
    // Prevent the browser from refreshing the page when the form submits.
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      // Send the email and password to our FastAPI /login endpoint.
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",

        // Tell FastAPI that we are sending JSON.
        headers: {
          "Content-Type": "application/json",
        },

        // Convert the JavaScript values into JSON for the backend.
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      // Convert FastAPI's JSON response back into JavaScript.
      const data = await response.json()

      // If FastAPI rejected the login, show its error message.
      if (!response.ok) {
        throw new Error(data.detail || "Login failed")
      }

      // Save the JWT so we can use it for protected requests later.
      localStorage.setItem("access_token", data.access_token)

      // Save basic user information for the frontend.
      localStorage.setItem("user", JSON.stringify(data.user))

      console.log("Login successful:", data)

      // Temporary confirmation.
      // We'll replace this with dashboard navigation shortly.
      // Send the logged-in user to their dashboard.

    // Send admins and normal users to different dashboards.
     if (data.user.role === "admin") {
     navigate("/admin")
    } else {
     navigate("/dashboard")
     }
    } catch (error) {
      // Show a friendly error instead of crashing the page.
      setError(error.message)
    } finally {
      // Re-enable the button whether login succeeded or failed.
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">

        {/* Application branding */}
        <div className="login-brand">
          <h1>Smart Help Desk</h1>
          <p>IT Support Management</p>
        </div>

        <h2>Welcome back</h2>

        <p className="login-subtitle">
          Sign in to manage your support tickets.
        </p>

        {/* When submitted, this form calls handleSubmit above. */}
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              type="email"
              placeholder="name@company.com"

              // Keep the input connected to React's email state.
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"

              // Keep the input connected to React's password state.
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {/* Only appears when something goes wrong. */}
          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="register-text">
          Don't have an account?{" "}
          <span className="register-link">
            Create account
          </span>
        </p>

      </section>
    </main>
  )
}

export default Login

