CREATE DATABASE eventmate_db;
USE eventmate_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  username VARCHAR(50),
  password VARCHAR(255),
  role ENUM('admin', 'user'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  category ENUM(
    'Seminar','Workshop','Lomba','Webinar',
    'Seminar Kerja Praktik','Seminar Proposal','Sidang Terbuka'
  ),
  date DATE,
  start_time TIME,
  end_time TIME,
  location VARCHAR(100),
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- optional tapi direkomendasikan
  UNIQUE KEY unique_registration (user_id, event_id),
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);
