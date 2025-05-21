-- Insert sample users
INSERT INTO users (user_id, username, email, password_hash) 
VALUES 
(1, 'Test', 'test@gmail.com', 'test1234'),
(2, 'JoeSmith', 'joesmith@gmail.com', 'hashed_joesmith'),
(3, 'JaneDoe', 'janedoe@gmail.com', 'hashed_janedoe'),
(4, 'AliceW', 'alice@gmail.com', 'hashed_alice'),
(5, 'BobVine', 'bob@vineyard.com', 'hashed_bob'),
(6, 'WineLover', 'winelover@tasting.com', 'hashed_winelover'),
(7, 'RedFan', 'redfan@vino.com', 'hashed_red'),
(8, 'WhiteFan', 'whitefan@vino.com', 'hashed_white'),
(9, 'SommelierSam', 'sam@tasting.com', 'hashed_sam'),
(10, 'TasterTina', 'tina@wine.com', 'hashed_tina');


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
(10, 'verif_hash_10');


-- Insert vineyards
COPY vineyard(vineyard_id, name, owner, appelation, country, region)
FROM 'D:\wineDB\data\vineyard.csv'
DELIMITER ',' CSV HEADER;

-- Insert wines
INSERT INTO wine (vineyard_id, name, classification, grape, year, price, rating)
VALUES
(1, 'Vulkà Bianco', 'DOC', 'Carricante', 2021, 22, 4),
(2, 'Reserve Late Harvest', 'Special Reserve', 'Riesling', 2020, 18, 5),
(3, 'Wild Child Block', 'Estate', 'Pinot Noir', 2022, 24, 4),
(4, 'Ars In Vitro', 'Vino de Autor', 'Tempranillo', 2019, 30, 3),
(5, 'Belsito', 'DOCG', 'Frappato', 2021, 19, 4),
(6, 'Les Natures', 'Organic', 'Pinot Blanc', 2020, 28, 5),
(7, 'Mountain Cuvée', 'Proprietary Blend', 'Cabernet Sauvignon', 2021, 25, 4),
(8, 'Rosso', 'IGT', 'Nero dAvola', 2020, 17, 3),
(9, 'Felix', 'Reserva', 'Malbec', 2021, 20, 4),
(10, 'Winemaker Selection', 'Estate', 'Malbec', 2020, 22, 5),
(11, 'Valdelayegua Crianza', 'Crianza', 'Tempranillo', 2018, 27, 4),
(12, 'Vin de Maison', 'Table Wine', 'Cabernet Franc', 2022, 16, 2),
(13, 'Ficiligno', 'DOC', 'Grillo', 2020, 21, 3),
(14, 'Signature Selection', 'Reserve', 'Zinfandel', 2021, 29, 5),
(15, 'Aynat', 'DOC', 'Inzolia', 2021, 19, 4),
(16, 'King Ridge Vineyard', 'Estate', 'Chardonnay', 2022, 34, 5),
(17, 'Dalila', 'Blend', 'Grillo', 2020, 22, 3),
(18, 'Mascaria Barricato', 'Barricato', 'Nero dAvola', 2021, 24, 4),
(19, 'Nouveau', 'AOC', 'Gamay', 2022, 14, 3),
(20, 'Hyland', 'Single Vineyard', 'Pinot Gris', 2021, 20, 4),
(21, 'Nouveau', 'AOC', 'Gamay', 2022, 15, 2),
(22, 'Eté Indien', 'Cru', 'Gamay', 2021, 18, 4),
(23, 'La Fleur Amélie', 'AOC', 'Sauvignon Blanc', 2021, 23, 5),
(24, 'Estate', 'Proprietary', 'Cabernet Sauvignon', 2021, 35, 5),
(25, 'Prugneto', 'DOC', 'Sangiovese', 2020, 21, 4),
(26, 'Alder Ridge Vineyard', 'Single Vineyard', 'Syrah', 2021, 26, 5),
(27, 'Brut Rosé', 'Champagne', 'Pinot Meunier', 2019, 40, 5),
(28, 'Golden Horn', 'Reserve', 'Syrah', 2020, 25, 4),
(29, 'Inspired', 'Estate', 'Cabernet Franc', 2021, 24, 4),
(30, 'Brut Rosé', 'Champagne', 'Chardonnay', 2020, 42, 5),
(31, 'Old Vine', 'Old Vine', 'Zinfandel', 2019, 30, 4);



-- Insert food pairings
INSERT INTO food_pairing (wine_id, name)
VALUES
(63, 'Duck confit'),
(64, 'Tapas and cured meats'),
(65, 'Eggplant Parmigiana'),
(66, 'Roasted turkey breast'),
(67, 'Beef brisket sliders'),
(68, 'Sicilian meatballs'),
(69, 'Argentinian grilled steak'),
(70, 'Lamb empanadas'),
(71, 'Chorizo and Manchego crostini'),
(72, 'Herbed goat cheese crostini'),
(73, 'Grilled calamari'),
(74, 'BBQ pork ribs'),
(75, 'Seafood risotto'),
(76, 'Lemon chicken with herbs'),
(77, 'Caprese salad with fresh basil'),
(78, 'Mushroom risotto'),
(79, 'Roasted duck with cherry glaze'),
(80, 'Spicy Pad Thai'),
(81, 'Beef bourguignon'),
(82, 'Braised short ribs'),
(83, 'Pan-seared scallops'),
(84, 'Prime rib with horseradish cream'),
(85, 'Pasta Bolognese'),
(86, 'Grilled lamb chops'),
(87, 'Smoked salmon tartare'),
(88, 'Lamb shawarma wrap'),
(89, 'Portobello mushroom burger'),
(90, 'Tuna tartare with avocado'),
(91, 'BBQ brisket with cornbread');



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