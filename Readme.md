# WineDB CS 461 Setup

* Table Creation File - server/setup.sql
* Data Insertion File - server/insert_data.sql
* Application Query File - server/app_query.sql

1. Make sure you have the following software libraries installed:
* Node.js
* [pgAdmin4](https://www.pgadmin.org/) and [PostgreSQL](https://www.enterprisedb.com/postgresql-tutorial-resources-training-1?uuid=69f95902-b451-4735-b7e4-1b62209d4dfd&campaignId=postgres_rc_17)

2. Clone this repository and install necessary packages:
* cd into `front-end` and run `npm i`
* create a new terminal and cd into `server`. run `npm i` to install the packages for the back end

3. Setup the database
* When setting up postgres on your machine as the **superuser** leave your host as **localhost**, set your password as **password**, and leave port as 5432 which should be default. If you already have postgres installed, then create a new server with these same properties, and update the password in `env.json` as necessary.
* Create a new database called: `wineDB` and leave the setup options default.
* in the `server` directory, run the `setup.sql` on the database or just copy and paste it into pgAdmin and run there
* run the `insert.sql` file. Any errors here will likely come from a mismatch of wine_id's, user_id's, or vineyard_id's

4. Run the program
* cd into `front-end` and run `npm run dev`
* make another terminal and cd into `server` and also run `npm run dev`. You should see **Server started on port 8080** and **Connected to database wineDB** in your node terminal
* now open the url fron the front end terminal and run the program!
* create a new account and use it for the remaining. You can just use `password` as password, as it needs to be at least 8 characters
