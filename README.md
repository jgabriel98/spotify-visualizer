## Requirements
 - a spotify developer account
 - node 18

## Setup
1. Access your [spotify developer account dashboard](https://developer.spotify.com/dashboard), create a new app with WebApi permissions (see print below)
    <img width="322" alt="image" src="https://github.com/user-attachments/assets/f91d7913-14fc-40e7-8204-6d8650820c29">

2. Then, for both /server and /client folders:
   - Create a `.env.local` file and put the spotify _Client ID_ and _Client Secret_ variables on it (you can get those values at spotify project|app settings):
     ```bash

     ```

## Running
```
cd server
npm run build
npm run prod
```

or, for debugging and local development:
```
cd server
npm run dev
```
