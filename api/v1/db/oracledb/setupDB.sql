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

INSERT INTO DEVELOPERS (NAME) VALUES ('BETHESDA');

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
COMMENT ON COLUMN VIDEO_GAMES.DEVELOPER_ID 'Foreign key to DEVELOPERS. Points to the developer that created this game';
COMMENT ON COLUMN VIDEO_GAMES.NAME IS 'The name of this video game';
COMMENT ON COLUMN VIDEO_GAMES.SCORE IS 'Aggregate score based on reviews submitted for this game'
COMMENT ON COLUMN VIDEO_GAMES.RELEASE_DATE IS 'Original date this game was released'

INSERT INTO VIDEO_GAMES (DEVELOPER_ID, NAME, RELEASE_DATE) VALUES (1, 'FALLOUT 3', TO_DATE('2008/10/15', 'YYYY/MM/DD'));

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

INSERT INTO REVIEWS (GAME_ID, REVIEW_TEXT, SCORE, REVIEWER) VALUES (1, 'BEST GAME EVER', '5', 'BIG BRAIN');
