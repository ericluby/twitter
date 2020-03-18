-- DROP TABLE Tweets, Users;

CREATE TABLE Tweets (
    id SERIAL PRIMARY KEY  NOT NULL,
    author_id INT  NOT NULL,
    message TEXT  NOT NULL
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY  NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT  NOT NULL,
    email TEXT UNIQUE,
    is_admin BOOLEAN NOT NULL
);

INSERT INTO Users (username, password, email, is_admin)
VALUES
   ('pumpkin', 'slumpkin', 'lumpkin@example.com', True),
   ('cherry', 'berry', 'hairy@example.com', False)
;

INSERT INTO Tweets (author_id, message)
VALUES
   (1, 'I once heard about a berry named cherry'),
   (2, 'there was once a lumpkin named bumpkin'),
   (1, 'your mother is a bumpkin')
;

SELECT
   u.username AS user,
   t.message
FROM
   Tweets AS t
JOIN
  Users AS u ON u.id = t.author_id
;
