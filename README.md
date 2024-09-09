## Requirements
 - Spotify developer account
 - Node 18

## Setup
1. Access your [spotify developer account dashboard](https://developer.spotify.com/dashboard), create a new app with _Web Api_ permissions (see print below)
  
   <img width="322" alt="image" src="https://github.com/user-attachments/assets/f91d7913-14fc-40e7-8204-6d8650820c29">

2. Then, for **both** `server/` and `client/` folders:
   - Edit `.env` file and fill the spotify _Client ID_ and _Client Secret_ variables on it
     ```bash
      VITE_SPOTIFY_CLIENT_ID="client id goes here"
      VITE_SPOTIFY_CLIENT_SECRET="client secret goes here"
     ```
     _(you can get those values at spotify app settings):_
   - run `npm install`

## Running
Enter `server/` folder, build the repo and run it:
```
cd server
npm run build
npm run prod
```


### Debugging and dev build
For debugging and local development:
```
cd server
npm run dev
```
