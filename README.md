# Spotify Visualizer
A Web Application to visualize the spotify currently playing track on a projector (or some big screen), without requiring you to change which spotify device is playing.


<img width="25%" alt="image" src="https://github.com/user-attachments/assets/faab1541-4442-415b-bc62-d40514136751" />
<img width="50%" alt="image" src="https://github.com/user-attachments/assets/65168f35-f290-4792-ac68-39d9ff5c1389" />



# Features
 - QRCode spotify authentication (no need to mouse or keyboard);
 - *No "stealing" your spotify connect*. (running this won't interact with or affect your spotify playback in anyway);
 - Persisted UI layout;
 - Synched realtime UI layout editing;
 - Dragabble, rotatable and resizable UI components;


<video>
   <source src="https://github.com/user-attachments/assets/5846f073-9f94-40ef-85a3-ab2fef349be2" />
</video>



--------------------------------

## Requirements
 - Spotify developer account
 - Node 18

## Setup
1. Access your [spotify developer account dashboard](https://developer.spotify.com/dashboard), create a new app with _Web Api_ permissions (see print below)
  
   <img width="322" alt="image" src="https://github.com/user-attachments/assets/f91d7913-14fc-40e7-8204-6d8650820c29">

   Then on `client/` folder: edit `.env` file and fill the spotify _Client ID_ and _Client Secret_ variables on it
   ```bash
   VITE_SPOTIFY_CLIENT_ID="client id goes here"
   VITE_SPOTIFY_CLIENT_SECRET="client secret goes here"
   ```
   _(you can get those values at spotify app settings):_

2. Setup a google API key: [Setting up API keys](https://support.google.com/googleapi/answer/6158862)

   Then on `server/` folder: edit its `.env` file and insert your google API key:
     ```bash
      YT_SEARCH_API_KEY="Api KEY goes here"
     ```

3. For **both** `server/` and `client/` folders:
   - run `npm install`

## Running
Enter `server/` folder, build the repo and run it:
```
cd server
npm run build
npm run prod
```
open https://localhost:3000/


### Developing and Debugging
For debugging and local development:
```
cd server
npm run dev
```

open `https://localhost:3000/` or `https://localhost:3000/settings`

## FAQ
> I want to change the authenticated spotify account
Logout on `https://localhost:3000/settings`, and you'll be redirected to authenticate again

> I've openned the website, but the sound bars visualizer wont appear

Most modern browsers require a initial user interaction to access audio nodes, to solve this you can do one of these: 
 - change the `Autoplay policy` (at [`chrome://flags/#autoplay-policy`](chrome://flags/#autoplay-policy) ) to _'No user gesture is required'_
 - press f5 and quicly click anywhere on the website

 ## TODO:
  - [ ] fixed resolution: pick a single canvas resolution, thus solving the problem of editing the layout in different screens with different resolutions)
  - [x] Add a friendly way to "logout" from connected spotify account
  - Styling:
    - [ ] add background options (instead of only black)
    - [x] make soundwaves animation optional
    - [ ] add progress bar
 - [ ] Migrate architecture to `solid-start` fullstack framework, having server and client more integrated
 - [ ] Migrate server to [SpacetimeDB](https://github.com/clockworklabs/SpacetimeDB)
