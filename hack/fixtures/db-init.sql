CREATE TABLE foo
(
    "bar" VARCHAR(256) PRIMARY KEY UNIQUE,
    "baz" VARCHAR(256)
);

CREATE TABLE users (
    "userID" VARCHAR(256) PRIMARY KEY UNIQUE,
    "email" VARCHAR(256) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "username" VARCHAR(256) NOT NULL
);

ALTER DATABASE dummy SET datestyle TO "ISO, DMY";
