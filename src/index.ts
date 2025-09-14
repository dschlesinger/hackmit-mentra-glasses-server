import {AppServer, AppSession} from "@mentra/sdk"
const express = require('express');

// Create server
function InitServer() {
    const app = express();
    const port = 3000;

    app.use(express.json()); // For JSON payloads
    app.use(express.urlencoded({ extended: true })); 

    app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    });

    return app
}

// Load configuration from environment variables
const PACKAGE_NAME = process.env.PACKAGE_NAME || "com.example.myfirstmentraosapp"
const PORT = parseInt(process.env.PORT || "3000")
const MENTRAOS_API_KEY = process.env.MENTRAOS_API_KEY

if (!MENTRAOS_API_KEY) {
  console.error("MENTRAOS_API_KEY environment variable is required")
  process.exit(1)
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeWriter(message: String, timeout: number, session) {

    // Init alert
    session.layouts.showTextWall(message.slice(0, 1));

    for (let i = 2; i < message.length; i++) {
        session.layouts.showTextWall(message.slice(0, i));
        await sleep(timeout);
    }

    // Make sure displayed
    session.layouts.showTextWall(message);
}

let currentSong = '';
let currentAuthor = '';

/**
 * MyMentraOSApp - A simple MentraOS application that displays "Hello, World!"
 * Extends AppServer to handle sessions and user interactions
 */
class MyMentraOSApp extends AppServer {
  /**
   * Handle new session connections
   * @param session - The app session instance
   * @param sessionId - Unique identifier for this session
   * @param userId - The user ID for this session
   */
  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {

    // Initialize server
    const app = InitServer();

    session.logger.info(`New session: ${sessionId} for user ${userId}`)

    session.layouts.clearView()

    // session.layouts.showReferenceCard("Important", "This will stay on screen", {durationMs: -1})

    //session.layouts.showReferenceCard("Meeting Reminder", "Team Standup in 5 minutes")

    // Create app events
    session.layouts.showTextWall('Hello\nWorld')

    app.post('/change-song', (req, res) => {

        const { song, author } = req.body;

        console.log(song, author)

        currentSong = song;
        currentAuthor = author;

        session.layouts.showDoubleTextWall(currentSong, currentAuthor);

        res.json({
            status: 'success',
            message: 'Notification received'
        });

    })

    app.post('/notification', async (req, res) => {

        const { type, message } =  req.body;

        await typeWriter(`${type}: ${message}`, 100, session);

        await sleep(5000).then(
            () => {
                // Reset
                session.layouts.showDoubleTextWall(currentSong, currentAuthor);
            }
        );

        res.json({
            status: 'success',
            message: 'Notification received'
        });
    })

    app.post('/cover-image', async (req, res) => {

        const { ascii } =  req.body;

        session.layouts.showTextWall(ascii);

        // Make sure to await or session disconnects
        await sleep(5000).then(
            () => {
                // Reset
                session.layouts.showDoubleTextWall(currentSong, currentAuthor);
            }
        );

        res.json({
            status: 'success',
            message: 'Notification received'
        });
    })

    session.logger.info('userId', userId)

    // Log when the session is disconnected
    session.events.onDisconnected(() => {
      session.logger.info(`Session ${sessionId} disconnected.`)
    })
  }
}

// Create and start the app server
const server = new MyMentraOSApp({
  packageName: PACKAGE_NAME,
  apiKey: MENTRAOS_API_KEY,
  port: PORT,
})

server.start().catch(err => {
  console.error("Failed to start server:", err)
})