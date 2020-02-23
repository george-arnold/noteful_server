TRUNCATE folders,
notes RESTART IDENTITY CASCADE CREATE TABLE folders (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  folder_name TEXT NOT NULL
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  note_name TEXT NOT NULL,
  content_of_note TEXT NOT NULL,
  folder_id INTEGER REFERENCES folders(id)
);