-- Insert sample users
INSERT INTO users (user_id, username, email, password_hash, user_role)
VALUES
(1, 'Test', 'test@gmail.com', 'test1234', 'user'),
(2, 'JoeSmith', 'joesmith@gmail.com', 'hashed_joesmith', 'user'),
(3, 'JaneDoe', 'janedoe@gmail.com', 'hashed_janedoe', 'user'),
(4, 'AliceW', 'alice@gmail.com', 'hashed_alice', 'user'),
(5, 'BobVine', 'bob@vineyard.com', 'hashed_bob', 'user'),
(6, 'WineLover', 'winelover@tasting.com', 'hashed_winelover', 'user'),
(7, 'RedFan', 'redfan@vino.com', 'hashed_red', 'user'),
(8, 'WhiteFan', 'whitefan@vino.com', 'hashed_white', 'user'),
(9, 'SommelierSam', 'sam@tasting.com', 'hashed_sam', 'user'),
(10, 'TasterTina', 'tina@wine.com', 'hashed_tina', 'user'),
(11, 'AdminUser', 'admin@gmail.com', 'hashed_admin', 'admin');


-- Insert sample profiles
INSERT INTO profile (user_id, bio, profile_pic, backg_pic)
VALUES
(1, 'Loves red wines and coding.', 'pic1.jpg', 'bg1.jpg'),
(2, 'Just a guy who likes Merlot.', 'pic2.jpg', 'bg2.jpg'),
(3, 'Exploring the world of white wines.', 'pic3.jpg', 'bg3.jpg'),
(4, 'Wine and adventure!', 'pic4.jpg', 'bg4.jpg'),
(5, 'Owner of Bobs Vineyard.', 'pic5.jpg', 'bg5.jpg'),
(6, 'Certified sommelier.', 'pic6.jpg', 'bg6.jpg'),
(7, 'Pinot Noir aficionado.', 'pic7.jpg', 'bg7.jpg'),
(8, 'Chardonnay enthusiast.', 'pic8.jpg', 'bg8.jpg'),
(9, 'I rate wines in my sleep.', 'pic9.jpg', 'bg9.jpg'),
(10, 'New to tasting but excited!', 'pic10.jpg', 'bg10.jpg');

-- Insert verifications
INSERT INTO verifications (user_id, verification_hash)
VALUES
(1, 'verif_hash_1'),
(2, 'verif_hash_2'),
(3, 'verif_hash_3'),
(4, 'verif_hash_4'),
(5, 'verif_hash_5'),
(6, 'verif_hash_6'),
(7, 'verif_hash_7'),
(8, 'verif_hash_8'),
(9, 'verif_hash_9'),
(10, 'verif_hash_10'),
(11, 'verif_hash_11');


-- Insert vineyards
-- COPY vineyard(vineyard_id, name, owner, appelation, country, region)
-- FROM 'D:\wineDB\data\vineyard.csv'
-- DELIMITER ',' CSV HEADER;
INSERT INTO vineyard (name, owner, appelation, country, region) VALUES
('Black Ridge Estate', 'Margaret Lang', 'Napa Valley', 'USA', 'California'),
('Domaine de Lumiere', 'Etienne Moreau', 'Loire Valley', 'France', 'Loire'),
('Villa Rosso', 'Giovanni Bianchi', 'Tuscany', 'Italy', 'Tuscany'),
('Sunset Hills Vineyard', 'Amelia Carter', 'Barossa Valley', 'Australia', 'South Australia'),
('Andes Crest', 'Luis Mendoza', 'Mendoza', 'Argentina', 'Cuyo');

INSERT INTO wine (vineyard_id, name, classification, grape, year, price, rating) VALUES
(6, 'Black Ridge Cabernet', 'Red', 'Cabernet Sauvignon', 2018, 45, 4.5),
(7, 'Lumiere Chardonnay', 'White', 'Chardonnay', 2020, 35, 4.2),
(7, 'Sunset Rosé', 'Rosé', 'Grenache', 2021, 25, 3.8),
(8, 'Villa Merlot Reserve', 'Red', 'Merlot', 2015, 60, 4.8),
(7, 'Loire Sauvignon Blanc', 'White', 'Sauvignon Blanc', 2019, 28, 4.0),
(10, 'Golden Riesling', 'Dessert', 'Riesling', 2017, 50, 4.7),
(8, 'Pinot Ember', 'Red', 'Pinot Noir', 2022, 40, 4.1),
(6, 'Barossa Zinfandel', 'Red', 'Zinfandel', 2020, 38, 4.4),
(9, 'Mendoza Whisper', 'White', 'Gewurztraminer', 2021, 30, 3.7),
(7, 'Moscato Delight', 'Dessert', 'Moscato', 2016, 27, 4.3),
(10, 'Andes Syrah', 'Red', 'Syrah', 2018, 55, 4.6),
(9, 'Sparkle Chenin', 'Sparkling', 'Chenin Blanc', 2022, 33, 4.0),
(10, 'Harvest Albariño', 'White', 'Albarino', 2019, 29, 3.9),
(9, 'Tempranillo Blush', 'Rosé', 'Tempranillo', 2020, 26, 3.6),
(7, 'Malbec Bloom', 'Red', 'Malbec', 2017, 42, 4.5);

-- Insert food pairings
-- Insert food pairings
INSERT INTO food_pairing (wine_id, name)
VALUES
(46, 'Duck confit'),
(47, 'Tapas and cured meats'),
(48, 'Eggplant Parmigiana'),
(49, 'Roasted turkey breast'),
(50, 'Beef brisket sliders'),
(51, 'Sicilian meatballs'),
(52, 'Argentinian grilled steak'),
(53, 'Lamb empanadas'),
(54, 'Chorizo and Manchego crostini'),
(55, 'Herbed goat cheese crostini'),
(56, 'Grilled calamari'),
(57, 'BBQ pork ribs'),
(58, 'Seafood risotto'),
(59, 'Lemon chicken with herbs'),
(60, 'Caprese salad with fresh basil'),
(46, 'Mushroom risotto'),
(47, 'Roasted duck with cherry glaze'),
(48, 'Spicy Pad Thai'),
(49, 'Beef bourguignon'),
(50, 'Braised short ribs'),
(51, 'Pan-seared scallops'),
(52, 'Prime rib with horseradish cream'),
(53, 'Pasta Bolognese'),
(54, 'Grilled lamb chops'),
(55, 'Smoked salmon tartare'),
(56, 'Lamb shawarma wrap'),
(57, 'Portobello mushroom burger'),
(58, 'Tuna tartare with avocado'),
(59, 'BBQ brisket with cornbread');



-- Insert ratings
INSERT INTO rating (wine_id, user_id, value, description)
VALUES
(63, 1, 8, 'Crisp and mineral-driven with a clean finish.'),
(64, 2, 9, 'Delightfully sweet and perfect for dessert.'),
(65, 3, 7, 'Fruity and earthy with balanced acidity.'),
(66, 4, 6, 'Interesting blend, but a bit too tannic.'),
(67, 5, 9, 'Aromatic and smooth—loved it with dinner.'),
(68, 6, 8, 'Elegant and clean, with floral notes.'),
(69, 7, 9, 'Rich and bold, perfect with red meat.'),
(70, 8, 7, 'Nice body but slightly too dry for my taste.'),
(71, 9, 10, 'Incredible Malbec—full of spice and depth.'),
(72, 10, 8, 'Juicy and layered, very enjoyable.');
