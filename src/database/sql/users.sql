create table if not exists users (
  userID varchar(255) primary key not null,
  email varchar(255) not null,
  password varchar(255) not null,
  username varchar(255) not null
)