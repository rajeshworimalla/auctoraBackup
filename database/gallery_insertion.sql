INSERT INTO "gallery"(artwork_id, featured, display_order, created_at)
VALUES
((SELECT artwork_id FROM "Artwork" WHERE title = 'Highest Peak of the World: Everest'), TRUE, 12, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Gautam Buddha – The Enlightened One'), FALSE, 34, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Buddhist Thangka from Nepal'), TRUE, 7, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Pashupatinath Temple at Sunset'), FALSE, 19, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Abstract Climbers on a Snowy Mountain'), TRUE, 25, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Kumari – Living Goddess of Nepal'), FALSE, 42, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Lord Shiva – The Destroyer'), TRUE, 17, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Himalayan Serenity – Hand-Painted Mountain Landscape'), FALSE, 8, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Mystic Forest River – Oil Painting Landscape'), TRUE, 29, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Fragmented Identity – Abstract Portrait Painting'), TRUE, 31, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'Vision Unbound – Abstract Eye in Motion'), FALSE, 55, NOW()),
((SELECT artwork_id FROM "Artwork" WHERE title = 'The Fallen Angels'), TRUE, 66, NOW());
