// useState lets React remember the values entered into the form.
import { useState } from "react"

// Lets us move between Register and Login.
import { useNavigate } from "react-router-dom"

import "../App.css"
import logo from "../assets/smart help desk logo.png"


function Register() {
  const navigate = useNavigate()

  // Store the information entered by the user.
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Used for loading and error messages.
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  // ========================================
  // FORMAT BACKEND ERRORS
  // ========================================

  const getErrorMessage = (detail) => {
    // Normal FastAPI errors are often plain strings.
    if (typeof detail === "string") {
      return detail
    }

    // Pydantic validation errors come back
    // as an array of error objects.
    if (Array.isArray(detail) && detail.length > 0) {
  return detail
    .map((item) =>
      item.msg.replace(/^Value error,\s*/i, "")
    )
    .join(" ")
}

    // Fallback message if the response has
    // an unexpected structure.
    return "Unable to create account"
  }


  // ========================================
  // CREATE ACCOUNT
  // ========================================

  const handleSubmit = async (event) => {
    // Prevent the browser from refreshing.
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      // Send the new user's information
      // to the FastAPI backend.
      const response = await fetch(
        "http://127.0.0.1:8000/users",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
          }),
        }
      )

      const data = await response.json()

      // Show a readable backend error
      // if registration fails.
      if (!response.ok) {
        throw new Error(
          getErrorMessage(data.detail)
        )
      }

      // Account created successfully.
      // Send the user back to Login.
      navigate("/")

    } catch (error) {
      setError(error.message)

    } finally {
      setLoading(false)
    }
  }


  return (
    <main className="login-page">

      <section className="login-card">

        {/* =========================
            APPLICATION BRANDING
            ========================= */}
        <div className="login-brand">

          <img
            src={logo}
            alt="Smart Help Desk logo"
            className="login-logo"
          />

          <h1>
            Smart Help Desk
          </h1>

          <p>
            IT Support Management
          </p>

        </div>


        {/* =========================
            REGISTER INTRODUCTION
            ========================= */}

        <h2>
          Create account
        </h2>

        <p className="login-subtitle">
          Create an account to submit and track
          your IT support requests.
        </p>


        {/* =========================
            REGISTER FORM
            ========================= */}

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="form-group">

            <label htmlFor="name">
              Full name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />

          </div>


          {/* Email */}
          <div className="form-group">

            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

          </div>


          {/* Password */}
          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />

          </div>


          {/* Registration error */}
          {error && (
            <p className="login-error">
              {error}
            </p>
          )}


          {/* Create account button */}
          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>

        </form>


        {/* Return to Login */}
        <p className="register-text">

          Already have an account?{" "}

          <span
            className="register-link"
            onClick={() =>
              navigate("/")
            }
          >
            Sign in
          </span>

        </p>

      </section>

    </main>
  )
}

export default Register