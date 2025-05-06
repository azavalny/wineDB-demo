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

-- Insert sample user
INSERT INTO users (username, email, password_hash) 
VALUES ('Test', 'test@gmail.com', 'test1234');
