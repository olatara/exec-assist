# AI Executive Assistant

This project is a micro SaaS **AI Executive Assistant** designed to automate common executive assistant tasks, including scheduling, communication, meeting preparation, and generating AI responses. It integrates with **Google OAuth**, **Google Calendar**, and **OpenAI's GPT-3.5** model for enhanced AI capabilities.

## Features
- **User Authentication**: Google OAuth for secure user login.
- **Google Calendar Integration**: Allows users to schedule and manage meetings through the Google Calendar API.
- **AI Response Generation**: Integration with OpenAI's GPT-3.5 model to assist with automated responses, meeting summaries, and more.
- **Session Management**: Secure session-based authentication using `express-session` and `Passport.js`.
- **JWT Authentication**: Provides JWT-based token handling for authenticated API requests.
- **Meeting Management**: Create and manage meeting agendas with the ability to link with external calendars.

## Tech Stack

- **Backend**: Node.js, TypeScript
- **Authentication**: Google OAuth 2.0 via Passport.js, JWT for token-based authentication
- **Database**: PostgreSQL (with Knex.js for migrations and query building)
- **Session Management**: express-session
- **APIs**:
  - Google Calendar API for scheduling
  - OpenAI API for AI-powered responses
- **Deployment**: Can be hosted on cloud providers like Heroku, AWS, or any platform supporting Node.js apps.

---

## Project Setup

### Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (v14+)
- PostgreSQL
- An OpenAI account and API key
- A Google Developer account for OAuth and Google Calendar API access

### Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and populate it with the following variables:

    ```bash
    PORT=3000
    DATABASE_URL=postgres://username:password@localhost:5432/executive_assistant
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    JWT_SECRET=your-jwt-secret
    SESSION_SECRET=your-session-secret
    OPENAI_API_KEY=your-openai-api-key
    ```

4. **Run database migrations**:
    Set up the PostgreSQL database schema using Knex.js:
    ```bash
    npx knex migrate:latest
    ```

5. **Run the server**:
    ```bash
    npm run dev
    ```

---

## API Endpoints

### Authentication
- **GET** `/auth/google` - Initiates Google OAuth login.
- **GET** `/auth/google/callback` - Google OAuth callback.
- **GET** `/auth/logout` - Logs out the user and destroys the session.

### Calendar
- **POST** `/calendar/event` - Creates a new event on the user's Google Calendar.
    - Requires JWT-based authentication.
    - **Request body**:
      ```json
      {
        "summary": "Meeting with John",
        "description": "Discuss project updates",
        "start": "2024-10-01T10:00:00Z",
        "end": "2024-10-01T11:00:00Z"
      }
      ```

### Meeting Management
- **POST** `/meetings` - Create a new meeting agenda.
    - **Request body**:
      ```json
      {
        "agenda": "Discuss the next quarter's sales strategy",
        "dateTime": "2024-10-01T14:00:00Z"
      }
      ```
- **GET** `/meetings` - Retrieves all meetings for the authenticated user.

### AI Response Generation (via OpenAI)
- **POST** `/ai/respond` - Generates an AI response using OpenAI's GPT-3.5 model.
    - **Request body**:
      ```json
      {
        "prompt": "Summarize the key points of our last meeting"
      }
      ```

---

## OpenAI Service

This project integrates with OpenAI’s GPT-4 model to generate AI-powered responses. The service is encapsulated in a function `getAIResponse`, which takes a user prompt and returns the response generated by the model.

---

## JWT and Session Handling

- **JWT Authentication**: The API uses JWT for token-based authentication. After successful login, a JWT is generated and sent to the client.
- **Session-based Authentication**: `express-session` and `Passport.js` are used to manage user sessions, with user data stored in the session after authentication.

---

## Google Calendar Integration

This app integrates with the Google Calendar API to allow users to schedule and manage events directly from the platform. OAuth is used for user authentication and authorization.

1. **User logs in via Google OAuth**.
2. **Google Calendar API** is used to create or view events on the user's calendar.

---

## Migrations

Knex.js is used for managing database migrations. The database is structured with the following tables:

- `users`: Stores user details such as Google ID, email, and access tokens.
- `meetings`: Stores meeting agendas, linked to users.

Run migrations with:

```bash
npx knex migrate:latest

---

## Roadmap

- **AI-powered Meeting Summaries**: Automate the generation of meeting summaries based on meeting details.
- **Advanced Scheduling**: Integrate with more scheduling APIs (e.g., Outlook Calendar).
- **Real-time Notifications**: Set up real-time event reminders and notifications.
- **AI-assisted Task Automation**: Enhance AI capabilities for task automation.

---

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a Pull Request.

---

## License

This project is licensed under the MIT License.


