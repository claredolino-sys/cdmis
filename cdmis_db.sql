-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2025 at 11:37 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cdmis_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `action` varchar(100) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `details` text NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `document_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `timestamp`, `details`, `department`, `document_id`) VALUES
('log-1', 'BiPSU - 0123', 'SYSTEM_LOGIN', '2025-11-26 18:37:30', 'Logged in to the system.', 'Records and Archives Office', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`) VALUES
('dept-3', 'Finance'),
('dept-2', 'HR'),
('dept-1', 'IT'),
('dept-admin', 'Records and Archives Office');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `uploader_id` varchar(50) NOT NULL,
  `upload_date` datetime NOT NULL DEFAULT current_timestamp(),
  `review_date` date DEFAULT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `restriction_type` enum('Public','Confidential') NOT NULL,
  `status` enum('Draft','Approved','Archived') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` text DEFAULT NULL,
  `type` enum('Memorandum','Report','Form','Policy','Other') NOT NULL,
  `meta_tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of strings' CHECK (json_valid(`meta_tags`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `title`, `description`, `department`, `uploader_id`, `upload_date`, `review_date`, `version`, `restriction_type`, `status`, `file_name`, `file_url`, `type`, `meta_tags`) VALUES
('doc-1', 'Q1 Financial Report', 'Comprehensive financial report for the first quarter.', 'Records and Archives Office', 'BiPSU - 0123', '2023-01-15 10:00:00', '2024-01-15', 1, 'Confidential', 'Approved', 'q1_financial_report.pdf', 'https://pdfobject.com/pdf/sample.pdf', 'Report', '[\"finance\", \"report\", \"q1\"]'),
('doc-2', 'New Employee Onboarding Policy', 'Updated policy for onboarding new hires.', 'HR', 'BiPSU - 0235', '2023-02-20 14:30:00', '2023-12-01', 2, 'Public', 'Draft', 'onboarding_policy_v2.docx', 'https://pdfobject.com/pdf/sample.pdf', 'Policy', '[\"hr\", \"policy\", \"onboarding\"]'),
('doc-3', 'IT Department Server Maintenance Schedule', 'Schedule for server maintenance and downtime.', 'IT', 'BiPSU - 0234', '2023-03-05 09:00:00', '2025-03-05', 1, 'Confidential', 'Approved', 'server_maintenance.xlsx', 'https://pdfobject.com/pdf/sample.pdf', 'Memorandum', '[\"it\", \"maintenance\", \"schedule\"]'),
('doc-4', 'Annual IT Security Report', 'Annual report on IT security vulnerabilities and measures.', 'IT', 'BiPSU - 0234', '2023-04-10 11:00:00', NULL, 1, 'Public', 'Archived', 'it_security_report_annual.pdf', 'https://pdfobject.com/pdf/sample.pdf', 'Report', '[\"it\", \"security\", \"report\"]'),
('doc-5', 'Leave Request Form', 'Standard form for employee leave requests.', 'HR', 'BiPSU - 0235', '2022-11-30 16:00:00', '2025-12-01', 3, 'Public', 'Approved', 'leave_request_form.pdf', 'https://pdfobject.com/pdf/sample.pdf', 'Form', '[\"hr\", \"form\", \"leave\"]');

-- --------------------------------------------------------

--
-- Table structure for table `document_nap_data`
--

CREATE TABLE `document_nap_data` (
  `id` int(11) NOT NULL,
  `document_id` varchar(50) NOT NULL,
  `office_name` varchar(255) DEFAULT 'BILIRAN PROVINCE STATE UNIVERSITY',
  `department` varchar(100) DEFAULT NULL,
  `telephone` varchar(50) DEFAULT NULL,
  `section` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `person_in_charge` varchar(100) DEFAULT NULL,
  `date_prepared` date DEFAULT NULL,
  `period_covered` varchar(100) DEFAULT NULL,
  `volume` varchar(100) DEFAULT NULL,
  `medium` varchar(100) DEFAULT NULL,
  `restriction` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `duplication` varchar(100) DEFAULT NULL,
  `time_value` enum('T','P','') DEFAULT NULL,
  `utility_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array: Adm, F, L, Arc' CHECK (json_valid(`utility_value`)),
  `retention_active` varchar(50) DEFAULT NULL,
  `retention_storage` varchar(50) DEFAULT NULL,
  `retention_total` varchar(50) DEFAULT NULL,
  `disposition` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_nap_data`
--

INSERT INTO `document_nap_data` (`id`, `document_id`, `office_name`, `department`, `telephone`, `section`, `email`, `address`, `person_in_charge`, `date_prepared`, `period_covered`, `volume`, `medium`, `restriction`, `location`, `frequency`, `duplication`, `time_value`, `utility_value`, `retention_active`, `retention_storage`, `retention_total`, `disposition`) VALUES
(1, 'doc-1', 'BILIRAN PROVINCE STATE UNIVERSITY', 'Records and Archives Office', '053-500-9045', 'Administrative', 'records@bipsu.edu.ph', 'P.I Garcia Street, Naval, Biliran', 'Admin User', '2025-11-26', '2023-2024', '1 Folder', 'Paper/Digital', 'Confidential', 'Filing Cabinet A', 'Monthly', 'None', 'T', '[\"Adm\", \"F\"]', '2 Years', '3 Years', '5 Years', 'Disposal'),
(2, 'doc-2', 'BILIRAN PROVINCE STATE UNIVERSITY', 'HR', '053-500-9045', 'Administrative', 'records@bipsu.edu.ph', 'P.I Garcia Street, Naval, Biliran', 'Records Custodian (HR)', '2025-11-26', '2023-2024', '1 Folder', 'Paper/Digital', 'Confidential', 'Filing Cabinet A', 'Monthly', 'None', 'T', '[\"Adm\", \"F\"]', '2 Years', '3 Years', '5 Years', 'Disposal'),
(3, 'doc-3', 'BILIRAN PROVINCE STATE UNIVERSITY', 'IT', '053-500-9045', 'Administrative', 'records@bipsu.edu.ph', 'P.I Garcia Street, Naval, Biliran', 'Records Custodian (IT)', '2025-11-26', '2023-2024', '1 Folder', 'Paper/Digital', 'Confidential', 'Filing Cabinet A', 'Monthly', 'None', 'T', '[\"Adm\", \"F\"]', '2 Years', '3 Years', '5 Years', 'Disposal'),
(4, 'doc-4', 'BILIRAN PROVINCE STATE UNIVERSITY', 'IT', '053-500-9045', 'Administrative', 'records@bipsu.edu.ph', 'P.I Garcia Street, Naval, Biliran', 'Records Custodian (IT)', '2025-11-26', '2023-2024', '1 Folder', 'Paper/Digital', 'Confidential', 'Filing Cabinet A', 'Monthly', 'None', 'T', '[\"Adm\", \"F\"]', '2 Years', '3 Years', '5 Years', 'Disposal'),
(5, 'doc-5', 'BILIRAN PROVINCE STATE UNIVERSITY', 'HR', '053-500-9045', 'Administrative', 'records@bipsu.edu.ph', 'P.I Garcia Street, Naval, Biliran', 'Records Custodian (HR)', '2025-11-26', '2023-2024', '1 Folder', 'Paper/Digital', 'Confidential', 'Filing Cabinet A', 'Monthly', 'None', 'T', '[\"Adm\", \"F\"]', '2 Years', '3 Years', '5 Years', 'Disposal');

-- --------------------------------------------------------

--
-- Table structure for table `document_requests`
--

CREATE TABLE `document_requests` (
  `id` varchar(50) NOT NULL,
  `document_id` varchar(50) NOT NULL,
  `requester_id` varchar(50) NOT NULL,
  `request_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `purpose` text NOT NULL,
  `id_upload_url` text DEFAULT NULL,
  `approver_id` varchar(50) DEFAULT NULL,
  `decision_date` datetime DEFAULT NULL,
  `reviewer_comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_requests`
--

INSERT INTO `document_requests` (`id`, `document_id`, `requester_id`, `request_date`, `status`, `purpose`, `id_upload_url`, `approver_id`, `decision_date`, `reviewer_comment`) VALUES
('req-1', 'doc-1', 'BiPSU - 0345', '2023-05-10 10:00:00', 'Pending', 'Need for annual planning.', 'mock-url/id.png', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `document_versions`
--

CREATE TABLE `document_versions` (
  `id` int(11) NOT NULL,
  `document_id` varchar(50) NOT NULL,
  `version` int(11) NOT NULL,
  `upload_date` datetime NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` text DEFAULT NULL,
  `uploader_id` varchar(50) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_versions`
--

INSERT INTO `document_versions` (`id`, `document_id`, `version`, `upload_date`, `file_name`, `file_url`, `uploader_id`, `description`) VALUES
(1, 'doc-2', 1, '2022-01-10 09:00:00', 'onboarding_policy_v1.docx', 'https://pdfobject.com/pdf/sample.pdf', 'BiPSU - 0235', 'Initial draft of the onboarding policy.');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `type` enum('success','error','info') NOT NULL DEFAULT 'info',
  `related_document_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `timestamp`, `is_read`, `type`, `related_document_id`) VALUES
('notif-1', 'BiPSU - 0123', 'Welcome to the new CDMIS system.', '2025-11-26 18:37:30', 0, 'info', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL COMMENT 'Employee ID ex: BiPSU - 0123',
  `name` varchar(100) NOT NULL,
  `role` enum('Administrator','Departmental Records Custodian','Staff') NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Stored as MD5 Hash'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `role`, `department`, `password`) VALUES
('BiPSU - 0123', 'Admin User', 'Administrator', 'Records and Archives Office', '854f36c709b662f53c00ea2c11a40f7a'),
('BiPSU - 0234', 'Records Custodian (IT)', 'Departmental Records Custodian', 'IT', '6e0e35ada31308ce0ffc4ba6f6c2a052'),
('BiPSU - 0235', 'Records Custodian (HR)', 'Departmental Records Custodian', 'HR', 'b8af089be2741096c7f0430ff110eccf'),
('BiPSU - 0345', 'John Doe', 'Staff', 'Records and Archives Office', 'c52e465fe3929a28db538eb6f199336f'),
('BiPSU - 0346', 'Jane Smith', 'Staff', 'Records and Archives Office', '5d9d051e2cc822f3b7a3a1a4862aaeb5');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploader_id` (`uploader_id`),
  ADD KEY `department` (`department`);

--
-- Indexes for table `document_nap_data`
--
ALTER TABLE `document_nap_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_id` (`document_id`);

--
-- Indexes for table `document_requests`
--
ALTER TABLE `document_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `requester_id` (`requester_id`);

--
-- Indexes for table `document_versions`
--
ALTER TABLE `document_versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department` (`department`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `document_nap_data`
--
ALTER TABLE `document_nap_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `document_versions`
--
ALTER TABLE `document_versions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `fk_doc_department` FOREIGN KEY (`department`) REFERENCES `departments` (`name`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_doc_uploader` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `document_nap_data`
--
ALTER TABLE `document_nap_data`
  ADD CONSTRAINT `fk_nap_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `document_requests`
--
ALTER TABLE `document_requests`
  ADD CONSTRAINT `fk_req_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_req_requester` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_versions`
--
ALTER TABLE `document_versions`
  ADD CONSTRAINT `fk_ver_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_department` FOREIGN KEY (`department`) REFERENCES `departments` (`name`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
