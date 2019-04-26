-- phpMyAdmin SQL Dump
-- version 4.6.6deb5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 26, 2019 at 06:52 PM
-- Server version: 5.7.25-0ubuntu0.18.04.2
-- PHP Version: 7.3.4-1+ubuntu18.04.1+deb.sury.org+3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bookszen`
--

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` text COLLATE utf8mb4_unicode_ci,
  `keywords` text COLLATE utf8mb4_unicode_ci,
  `meta_desc` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blogs`
--

INSERT INTO `blogs` (`id`, `title`, `image`, `user_id`, `description`, `category`, `tags`, `keywords`, `meta_desc`, `created_at`, `updated_at`) VALUES
(3, 'Farm Products', 'b546be492a1036b4a0fbf00c14495f2a', NULL, '<p>Pursuant to the Uniform Commercial Code, \"<span style=\"color: rgb(41, 82, 24);\">Farm products</span>\" means goods, \r\nother than standing timber, with respect to which the debtor is engaged \r\nin a farming operation.  Farm products are crops grown, growing, or to \r\nbe grown, including <span style=\"background-color: rgb(41, 82, 24);\">crops</span> </p>', NULL, NULL, NULL, '<ul><li>Furthermore, supplies used or produced in a farming operation; or \r\nproducts of crops or livestock in their unmanufactured states are also \r\nfarm products.</li></ul>', '2019-04-26 10:46:59', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plan_for` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`id`, `title`, `image`, `price`, `plan_for`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Zen-Vestors', NULL, '0', 'year', '<div class=\"price_body\">\r\n							<ul class=\"list\"><li><a href=\"https://www.redchariotinternational.com/designs/bookszen/index.html#\">Ideal for Real-Estate</a></li><li><a href=\"https://www.redchariotinternational.com/designs/bookszen/index.html#\">Investors</a></li><li><a href=\"https://www.redchariotinternational.com/designs/bookszen/index.html#\">Add more details</a></li></ul>\r\n						</div>', '2019-04-26 11:35:21', '2019-04-26 12:03:04'),
(3, 'Zen-Core', NULL, '10', 'month', '<p><a href=\"https://www.redchariotinternational.com/designs/bookszen/index.html#\">Ideal for Small business both starting our and growing.</a></p>', '2019-04-26 12:04:05', NULL),
(4, 'Zen-Scale', NULL, '999', 'month', '<div class=\"price_body\">\r\n							<ul class=\"list\"><li><a href=\"https://www.redchariotinternational.com/designs/bookszen/index.html#\">Ideal for large businesses</a></li><li><a href=\"https://www.redchariotinternational.com/designs/bookszen/index.html#\">Starting at $999/mo</a></li><li><a href=\"https://www.redchariotinternational.com/designs/bookszen/index.html#\">Full virtual CFO Services</a></li><li><a href=\"https://www.redchariotinternational.com/designs/bookszen/index.html#\">Full virtual CAO Services</a></li><li><a href=\"https://www.redchariotinternational.com/designs/bookszen/index.html#\">The data at this state is so much fun to work with.</a></li></ul>\r\n						</div>', '2019-04-26 12:05:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `role_id` int(11) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `address`, `role_id`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(4, 'Superadmin', 'sandeep.digittrix@gmail.com', NULL, NULL, 1, NULL, '$2a$08$xnrDx.YBFDBz1nOKX51xNOAM/D6j64tJ6k7rb7zmCyUIGS5YdpQPW', NULL, '2019-03-20 00:56:11', '2019-03-20 00:56:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
