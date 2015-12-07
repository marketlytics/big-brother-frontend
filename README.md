# big-brother-frontend
This repository contains frontend module for the project "big-brother-pi" module (https://github.com/marketlytics/big-brother-pi.git)..

## Cloning this repo..
$ git clone https://github.com/marketlytics/big-brother-frontend.git

## Installing all dependencies..
(make sure npm & bower installed.)

$ cd <into the project root directory> # ~/Sites/big-brother-frontend
$ npm install & bower install

That's all you need..!!


# Codebase Explaination
Mainly this project contains 3 folders (that we'll discuss).

1. client: which defines all client side (app view/design)
2. server: which contains all server side code api routes + testing
3. e2e: contains pages interaction js files + testing


## Gruntfile.js: defines all automation to test and run the project.

## package.json: contains project configuration and all server side dependencies to install

## bower.json: contains project config and all client side (UI) dependencies to install.

## /client

### client/app
defines and setups all app pages with its ui functionalities.

### client/assets
contains all assets used in app UI side.

### client/components
components used for interaction with ui and server's db

### client/index.html
app home page


## /server

### server/api
contains all api routes, models and its testing in seperate folder.

### server/config
contains all server configuration + test data in seed.js

### server/auth
contains routes for user authentication

### server/app.js
main application file which setup's the whole server and starts it run.

### server/routes.js
defines & setup all routes used in this app.

Please help us to improve this documentation.
Thanks.