-- Create database only if it doesn't exist (do manually outside the script)
-- \c gameLogger -- only works in interactive mode, so skip this if running with -f

-- Drop tables if they already exist
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(75) NOT NULL,
    password_hash TEXT NOT NULL
);

-- Create profile table
CREATE TABLE profile (
    user_id INT PRIMARY KEY,
    bio VARCHAR(255), 
    profile_pic VARCHAR(128),
    backg_pic VARCHAR(128),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE vineyard(
    vineyard_id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    owner VARCHAR(50),
    appelation VARCHAR(35),
    country VARCHAR(20),
    region VARCHAR(20)
);

CREATE TABLE wine(
    wine_id SERIAL PRIMARY KEY,
    vineyard_id INT,
    FOREIGN KEY (vineyard_id) REFERENCES vineyard(vineyard_id) ON DELETE CASCADE,
    name VARCHAR(50),
    classification VARCHAR(20),
    grape VARCHAR(20),
    year SMALLINT,
    price INT
);

CREATE TABLE food_pairing(
    food_id SERIAL PRIMARY KEY,
    wine_id INT,
    FOREIGN KEY (wine_id) REFERENCES wine(wine_id) ON DELETE CASCADE,
    name VARCHAR(50)
);


CREATE TABLE verifications (
    verification_id SERIAL PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    verification_hash VARCHAR(50)
);

CREATE TABLE rating(
    wine_id INT,
    user_id INT,
    value INT,
    description VARCHAR(255),
    FOREIGN KEY (wine_id) REFERENCES wine(wine_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    PRIMARY KEY (wine_id, user_id)
);