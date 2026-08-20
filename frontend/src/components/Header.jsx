import { useNavigate } from "react-router-dom"

import logo from "../assets/smart help desk logo.png"


function Header() {
  const navigate = useNavigate()

  // Read the logged-in user from localStorage.
  const storedUser = localStorage.getItem("user")

  const user = storedUser
    ? JSON.parse(storedUser)
    : null


  // Send each role to its own main dashboard.
  const homeDestination =
    user?.role === "admin"
      ? "/admin"
      : "/dashboard"


  // Remove login information and return to login.
  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")

    navigate("/")
  }


  return (
    <header className="dashboard-header">

      {/* Logo + application name act as Home */}
      <div
        className="app-home-link"
        onClick={() =>
          navigate(homeDestination)
        }
      >
        <img
          src={logo}
          alt="Smart Help Desk logo"
          className="header-logo"
        />

        <div>
          <h1>Smart Help Desk</h1>

          <p>
            {user?.role === "admin"
              ? "Admin Portal"
              : "IT Support Management"}
          </p>
        </div>
      </div>


      <button
        className="logout-button"
        onClick={handleLogout}
      >
        Log out
      </button>

    </header>
  )
}

export default Header