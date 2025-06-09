-- 1. Get wine list
SELECT *
FROM wine
WHERE rating IS NOT NULL
ORDER BY rating DESC
LIMIT 10;

-- 2. Get user_id by username
SELECT user_id
FROM users
WHERE username = $1;

-- 3. User login
SELECT * FROM users WHERE username = $1 AND password_hash = $2;

-- 4. Check if user exists
SELECT 1 FROM users WHERE username = $1;

-- 5. Create user
INSERT INTO users (email, username, password_hash, user_role) VALUES ($1, $2, $3, 'user') RETURNING user_id;

-- 6. Get user cellar
SELECT 
  wine.name, 
  wine.grape, 
  vineyard.region, 
  rating.description AS review, 
  COALESCE(rating.value, 0) AS rating, 
  wine.year
FROM cellar
JOIN wine ON wine.wine_id = cellar.wine_id
JOIN vineyard ON wine.vineyard_id = vineyard.vineyard_id
LEFT JOIN rating ON rating.user_id = cellar.user_id AND rating.wine_id = cellar.wine_id
WHERE cellar.user_id = $1;

-- 7. Remove wine from cellar
DELETE FROM cellar WHERE user_id = $1 AND wine_id = $2;

-- 8. Update wine rating
UPDATE rating
SET value = $1, description = $2
WHERE rating_id = $3;

-- 9. Get rating_id for a user's wine (note: this query is likely incorrect, see comment in code)
SELECT rating_id FROM cellar WHERE user_id = $1 AND wine_id =$2;

-- 10. Get user profile
SELECT bio, profile_pic, backg_pic FROM profile WHERE user_id = $1;

-- 11. Update user profile
UPDATE profile
SET bio = $1, profile_pic = $2, backg_pic = $3
WHERE user_id = $4;

-- 12. Get food pairings for a wine
SELECT * FROM food_pairing WHERE wine_id = $1;

-- 13. Get vineyard info by vineyard_id
SELECT * FROM vineyard WHERE vineyard_id = $1;

-- 14. Insert into rating table (when adding wine to cellar)
INSERT INTO rating (user_id, wine_id, value, description)
VALUES ($1, $2, $3, $4)
RETURNING user_id, wine_id;

-- 15. Insert into cellar table (when adding wine to cellar)
INSERT INTO cellar (user_id, wine_id, date_added)
VALUES ($1, $2, CURRENT_TIMESTAMP);