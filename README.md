# YouTube Backend

A scalable and feature-rich backend for a YouTube-like application, built with Node.js, Express, and MongoDB. This API provides endpoints for user authentication, video management, comments, and more, ensuring a seamless experience for video-sharing platforms.

## Features

-   **User Authentication**: JWT-based login and signup.
-   **Video Management**: Upload, delete, and manage videos.
-   **Comments System**: Add, edit, and delete comments on videos.
-   **Like & Dislike**: Interaction features for videos.
-   **Playlists**: Create and manage user-specific playlists.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB, Mongoose
-   **Storage**: Cloud-based video storage using AWS S3 (or similar).
-   **Authentication**: JSON Web Tokens (JWT)

## Project Structure

```
youtube-backend/
│
├── src/
│   ├── controllers/        # Route handlers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middlewares/        # Custom middleware
│   ├── utils/              # Helper functions
│   └── app.js              # Express app setup
│
├── .env.example            # Environment variables
├── package.json            # Project dependencies
├── README.md               # Project documentation
└── server.js               # Entry point
```

## Getting Started

### Prerequisites

-   **Node.js**: v16+
-   **MongoDB**: Running locally or a cloud instance (e.g., MongoDB Atlas).
-   **AWS S3 Bucket**: For video uploads (or similar storage service).

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/rounakkumarsingh/youtube-backend.git
    cd youtube-backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file based on `.env.example` and add your configuration:

    ```env
    PORT=
    MONGODB_URI=
    CORS_ORIGIN=
    ACCESS_TOKEN_SECRET=
    ACCESS_TOKEN_EXPIRY=
    REFRESH_TOKEN_SECRET=
    REFRESH_TOKEN_EXPIRY=
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    ```

4. Start the development server:

    ```bash
    npm run dev
    ```

5. Access the API at `http://localhost:5000`.

## API Documentation

### Authentication

-   `POST /api/auth/signup` - Register a new user.
-   `POST /api/auth/login` - User login.

### Videos

-   `POST /api/videos/upload` - Upload a new video.
-   `DELETE /api/videos/:id` - Delete a video.
-   `GET /api/videos/:id` - Get video details.

### Comments

-   `POST /api/videos/:id/comments` - Add a comment to a video.
-   `DELETE /api/comments/:id` - Delete a comment.

### Playlists

-   `POST /api/playlists` - Create a new playlist.
-   `GET /api/playlists/:userId` - Get playlists of a user.

## Testing

Run tests using:

```bash
npm test
```

## Deployment

1. **Deploy to Heroku**:

    - Connect your repository to a new Heroku app.
    - Set up environment variables in the Heroku dashboard.

2. **AWS EC2**:
    - Set up an EC2 instance.
    - Install Node.js, MongoDB, and PM2.
    - Clone the repository and start the server using PM2.

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

-   [Express.js Documentation](https://expressjs.com/)
-   [Mongoose Documentation](https://mongoosejs.com/)
-   [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
