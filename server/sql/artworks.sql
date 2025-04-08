-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2025 at 04:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `auctora`
--

-- --------------------------------------------------------

--
-- Table structure for table `artworks`
--

CREATE TABLE `artworks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `artworks`
--

INSERT INTO `artworks` (`id`, `title`, `price`, `image_url`, `description`, `created_at`) VALUES
(1, 'Whispers Of The Wild', 180.00, '/uploads/artworks/art1.jpg', 'A hand-carved wooden elephant that embodies power and calm. Crafted from reclaimed teakwood, this piece brings warmth and strength to any collection.', '2025-04-06 21:45:48'),
(2, 'Echoes in Steel', 290.00, '/uploads/artworks/art2.jpg', 'An abstract metal sculpture shaped by fire and vision. Twisted forms reflect chaos and clarity—perfect for a modern industrial gallery.\r\n\r\n', '2025-04-06 22:01:46'),
(3, 'Grace in Marble', 250.00, '/uploads/artworks/art3.jpg', 'This elegant marble sculpture captures feminine serenity in fluid detail. Inspired by neoclassical European styles of the 18th century.', '2025-04-06 22:02:24'),
(4, 'Timeless Reverie', 340.00, '/uploads/artworks/art4.jpg', 'An 18th-century oil painting on canvas, rich in earthy tones and soft light. Ideal for collectors of historical European works.', '2025-04-06 22:02:59'),
(5, 'Fragmented Bloom', 290.00, '/uploads/artworks/art5.png\r\n\r\n', 'A vibrant modern interpretation of nature’s fragility. This semi-abstract floral piece blends chaos and color in bold brushstrokes.', '2025-04-06 22:06:29'),
(6, 'The Stag in Focus', 290.00, '/uploads/artworks/art6.png\r\n\r\n', 'This captivating piece of digital artwork features a stylized low-poly deer, meticulously crafted using sharp geometric shapes and a bold palette of purples, pinks, and earthy tones. Framed elegantly and showcased on a minimalist exhibition wall, the artwork draws viewers in with the deer\'s direct, almost soulful gaze', '2025-04-06 22:07:27'),
(7, 'Apple and Snail', 450.00, '/uploads/artworks/art7.png', 'A high-resolution photograph depicting a surreal arrangement of a sliced green apple filled with a glowing liquid, with a small snail ascending its surface. The work is framed and presented in a neutral-toned gallery setting, emphasizing the balance between organic forms and unexpected, conceptual detail. The composition invites viewers to explore themes of curiosity, contrast, and nature’s quiet interaction with the surreal.', '2025-04-06 22:23:31'),
(8, 'Armored Rider in Motion', 900.00, '/uploads/artworks/art8.png', 'This metallic sculpture features a futuristic, armored motorcyclist in motion, crafted with precision in polished steel and brushed alloys. Flame-like metal tendrils envelop the rider and bike, capturing a dynamic sense of speed and power. Set against a minimalist gallery backdrop with directional lighting, the piece highlights mechanical elegance and raw kinetic energy, blending contemporary design with industrial artistry.', '2025-04-06 22:24:29'),
(9, 'Contours of Thought', 1900.00, '/uploads/artworks/art9.png', 'A striking abstract painting that captures the dynamic interplay of color, form, and texture. Layered geometric shapes in vivid hues of red, blue, yellow, and green are harmonized through expressive brushwork and a textured surface. The piece evokes movement and emotion, making it a bold centerpiece for any modern collection.', '2025-04-07 15:26:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `artworks`
--
ALTER TABLE `artworks`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `artworks`
--
ALTER TABLE `artworks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
