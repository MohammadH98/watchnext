# WatchNext API for connecting MongoDB and Server
In order to run this server you need a connection to a mongo db database. Please fill in the username, password, and database/collection name in the [development.config.js](./development.config.js) file.
You also must run `npm install` to get the required packages.

## Port Forwarding
For mobile phones running the expo app to properly receive socket communication, it would need to be done through a `https` link. Since this is not possible with `localhost` alone, we use a forwarder here. Our choice was **ngrok**.
- To install ngrok, follow [the setup on their main page](https://dashboard.ngrok.com/get-started/setup)
- Once the setup is done, run the following to start forwarding (make sure the executable is in your path):
    `./ngrok http 2000` for UNIX
    `ngrok.exe http 2000` for Windows
- Once ngrok is running, you will see two URLs forwarding to `localhost:2000`. Select the HTTPS link, and put that in `app.js` as the socket.io URL (ie. `const socket = io('https:\\xyz.ngrok.io')`)

## Server Startup
To start the server, in another terminal window, navigate to the `server` folder of this repo and run `node server.js`

## Client Startup
To start the client, in another terminal window, navigate to the `WatchNext-Frontend` folder of this repo and run `npm start`

## Done!
You should now be presented with a page with an expo page, complete with a QR code and task report page. You can scan the QR code to run the app on your phone, or select the `Run in web browser` option to look at the application on your browser

