# Smart Help Desk

Smart Help Desk is a full-stack IT support ticket management system designed to simplify communication between users and IT support staff.

Users can submit technical support requests, receive AI-generated troubleshooting suggestions, communicate with IT support, track ticket progress, and archive resolved requests. IT support administrators can manage incoming tickets, update their classification and status, communicate with users, and review resolved ticket history.

## Features

### User
- Register and log in securely
- Create support tickets
- View personal support tickets
- Receive AI-generated troubleshooting suggestions
- View automatically assigned category and priority
- Communicate with IT support through ticket conversations
- Track ticket status
- Archive resolved tickets
- View archived ticket history

### IT Support / Admin
- View all active support tickets
- View ticket counts by priority
- Filter tickets by status and category
- Review AI-generated ticket classification
- Change ticket category and priority when necessary
- Update ticket status: Open, In Progress, or Resolved
- Communicate directly with users
- View resolved ticket history

## AI Integration

Smart Help Desk uses AI when a support ticket is submitted.

The AI analyzes the ticket title and description to:

- Assign a support category
- Determine a priority level
- Generate a short troubleshooting suggestion for the user

The AI-generated classification can still be changed by IT support staff when necessary.

If the AI service is unavailable, the ticket is still created so that the support request is not lost.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Database
- PostgreSQL

### Authentication
- JWT authentication
- Password hashing with bcrypt

### AI
- OpenAI API

## Screenshots

### User Dashboard

Users can view and track their support requests, including each ticket's category, priority, and current status.

![User Dashboard](screenshots/user-dashboard.png)

### IT Support Dashboard

IT support staff can review active tickets, monitor priority levels, and filter requests by status and category.

![Admin Dashboard](screenshots/admin-dashboard.png)

### AI-Assisted Ticket

When a ticket is submitted, AI analyzes the issue and provides a category, priority level, and troubleshooting suggestion.

![AI Ticket Details](screenshots/ai-ticket-details.png)

### User and IT Support Conversation

Users and IT support staff can communicate directly within a ticket while the issue is being handled.

![Ticket Conversation](screenshots/ticket-conversation.png)

### Resolved History

Resolved requests are removed from the active support queue and remain available to IT support through the resolved history.

![Resolved History](screenshots/resolved-history.png)

### Archived Tickets

After a ticket has been resolved, the user can optionally archive it. Archived tickets are removed from the main ticket list but remain accessible through the user's archived ticket history.

![Archived Tickets](screenshots/archived-tickets.png)

## Ticket Workflow

1. The user creates a support ticket.
2. AI analyzes the issue and assigns a category and priority.
3. AI provides an initial troubleshooting suggestion.
4. IT support reviews the request.
5. IT support can adjust the category or priority if necessary.
6. IT support changes the ticket status as work progresses.
7. The user and IT support can communicate through the ticket conversation.
8. IT support marks the ticket as resolved when the issue is completed.
9. The resolved ticket appears in the administrator's resolved history.
10. The user can optionally archive the resolved ticket.

## API & Backend Testing

The Smart Help Desk backend is built with FastAPI and provides REST API endpoints for:

- User registration and authentication
- Retrieving the authenticated user
- Creating and retrieving tickets
- Updating ticket status
- Updating ticket classification
- Adding and retrieving ticket comments
- Ticket archiving
- Resolved ticket history

Protected routes require JWT authentication, while administrative operations require an administrator account.

FastAPI's interactive Swagger documentation was used during development to inspect and test the backend API endpoints.

Backend testing included:

- User registration and login
- JWT authentication and protected routes
- Creating and retrieving tickets
- User-specific ticket access
- Administrator-only operations
- Updating ticket status
- Updating ticket category and priority
- Adding and retrieving ticket comments
- Resolving and archiving tickets
- Authorization checks between normal users and administrators

![Swagger API Documentation](screenshots/swagger-api.png)

## Project Structure

```text
smart-help-desk/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── auth.py
│   └── ai_service.py
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── screenshots/
│   ├── user-dashboard.png
│   ├── admin-dashboard.png
│   ├── ai-ticket-details.png
│   ├── ticket-conversation.png
│   ├── resolved-history.png
│   ├── archived-tickets.png
│   └── swagger-api.png
│
├── .gitignore
└── README.md
```

## Running the Project

### Backend

Create and activate the Python virtual environment, install the required dependencies, configure the environment variables, and start FastAPI:

```bash
uvicorn main:app --reload
```

### Frontend

From the frontend directory:

```bash
npm install
npm run dev
```

The React application will then be available through the local Vite development server.

## Environment Variables

The backend uses environment variables for sensitive configuration such as:

```env
DATABASE_URL=your_database_connection_string
SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key
```

Sensitive `.env` files should not be committed to GitHub.

## Purpose

This project was developed as a portfolio project to demonstrate full-stack web development, REST API development, database integration, authentication and authorization, AI integration, and practical IT support workflow design.