DROP TABLE REVIEWS;
DROP TABLE VIDEO_GAMES;
DROP TABLE DEVELOPERS;

CREATE TABLE DEVELOPERS (
  ID NUMBER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
  NAME VARCHAR2(255) NOT NULL,
  WEBSITE VARCHAR2(255),
  PRIMARY KEY(ID)
);

COMMENT ON TABLE DEVELOPERS IS 'Contains data on video game developers';
COMMENT ON COLUMN DEVELOPERS.ID IS 'Unique ID of developer';
COMMENT ON COLUMN DEVELOPERS.NAME IS 'The name of this development studio';
COMMENT ON COLUMN DEVELOPERS.WEBSITE IS 'URL of the developers website';

INSERT INTO DEVELOPERS (NAME, WEBSITE) VALUES ('Bethesda', 'https://bethesda.net/en/dashboard');
INSERT INTO DEVELOPERS (NAME, WEBSITE) VALUES ('Grinding Gear Games', 'http://www.grindinggear.com/');
INSERT INTO DEVELOPERS (NAME, WEBSITE) VALUES ('Nintendo', 'https://www.nintendo.com/');

CREATE TABLE VIDEO_GAMES (
  ID NUMBER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
  DEVELOPER_ID NUMBER,
  NAME VARCHAR2(255) NOT NULL,
  SCORE FLOAT,
  RELEASE_DATE DATE NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY(DEVELOPER_ID) REFERENCES DEVELOPERS(ID)
);

COMMENT ON TABLE VIDEO_GAMES IS 'Contains data on video games including aggregate score from reviews';
COMMENT ON COLUMN VIDEO_GAMES.ID IS 'Unique ID of video game';
COMMENT ON COLUMN VIDEO_GAMES.DEVELOPER_ID IS 'Foreign key to DEVELOPERS. ID of the developer that created this game';
COMMENT ON COLUMN VIDEO_GAMES.NAME IS 'The name of this video game';
COMMENT ON COLUMN VIDEO_GAMES.SCORE IS 'Aggregate score based on reviews submitted for this game';
COMMENT ON COLUMN VIDEO_GAMES.RELEASE_DATE IS 'Original date this game was released';

INSERT INTO VIDEO_GAMES (DEVELOPER_ID, NAME, RELEASE_DATE) VALUES (1, 'Fallout 3', TO_DATE('2008/10/28', 'YYYY/MM/DD'));
INSERT INTO VIDEO_GAMES (DEVELOPER_ID, NAME, RELEASE_DATE) VALUES (2, 'Path of Exile', TO_DATE('2013/10/15', 'YYYY/MM/DD'));
INSERT INTO VIDEO_GAMES (DEVELOPER_ID, NAME, RELEASE_DATE) VALUES (3, 'The Legend of Zelda: Breath of the Wild', TO_DATE('2017/3/3', 'YYYY/MM/DD'));
INSERT INTO VIDEO_GAMES (DEVELOPER_ID, NAME, RELEASE_DATE) VALUES (3, 'Super Mario Odyssey', TO_DATE('2017/10/27', 'YYYY/MM/DD'));

CREATE TABLE REVIEWS (
  ID NUMBER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
  GAME_ID INT NOT NULL,
  REVIEW_TEXT VARCHAR2(255) NOT NULL,
  SCORE FLOAT NOT NULL,
  REVIEWER VARCHAR2(255) NOT NULL,
  REVIEW_DATE DATE DEFAULT SYSDATE NOT NULL,
  PRIMARY KEY(ID),
  FOREIGN KEY(GAME_ID) REFERENCES VIDEO_GAMES(ID)
);

COMMENT ON TABLE REVIEWS IS 'Contains data on reviews and a reference to the game the review is for';
COMMENT ON COLUMN REVIEWS.ID IS 'Unique ID of this review';
COMMENT ON COLUMN REVIEWS.GAME_ID IS 'Foreign key to VIDEO_GAMES. ID of the video game this review is for';
COMMENT ON COLUMN REVIEWS.REVIEW_TEXT IS 'Text of the review written by the reviewer';
COMMENT ON COLUMN REVIEWS.SCORE IS 'Score out of 5 given by the reviewer';
COMMENT ON COLUMN REVIEWS.REVIEWER IS 'The author of this review';
COMMENT ON COLUMN REVIEWS.REVIEW_DATE IS 'Auto-filled date the review was submitted to the database';

INSERT INTO REVIEWS (GAME_ID, REVIEW_TEXT, SCORE, REVIEWER) VALUES (1, 'BEST GAME EVER.', '5', 'BIG BRAIN');
INSERT INTO REVIEWS (GAME_ID, REVIEW_TEXT, SCORE, REVIEWER) VALUES (2, 'Played for 200 hours. Beat the story and now I can play the game.', '3.5', 'BIG BRAIN');
INSERT INTO REVIEWS (GAME_ID, REVIEW_TEXT, SCORE, REVIEWER) VALUES (3, 'Awful. Game was to hard.', '2', 'Small brain');