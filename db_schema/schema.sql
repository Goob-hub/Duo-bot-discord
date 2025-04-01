CREATE TABLE users (
	id SERIAL NOT NULL,
	discord_id TEXT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE parties (
	id SERIAL NOT NULL,
	name TEXT NOT NULL,
	wins int NOT NULL,
	losses int NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE user_parties (
    id SERIAL NOT NULL,
    user_id int NOT NULL,
    party_id int NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (party_id) REFERENCES parties(id),
    PRIMARY KEY(id)
);