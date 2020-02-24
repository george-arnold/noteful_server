const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const NotesService = require("./notes-service");
const notesRouter = express.Router();
const bodyParser = express.json();

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.noteName),
  content_of_note: xss(note.noteContent),
  folder_id: note.folderId
});

notesRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    NotesService.getAllNotes(knexInstance)
      .then(articles => {
        res.json(articles.map(serializeNote));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { noteName, noteContent, folderId } = req.body;
    const newNote = { noteName, noteContent, folderId };

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body'` }
        });
    NotesService.insertNote(req.app.get("db"), newNote)
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${article.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter.route("/:note_id");
all((req, res, next) => {
  NotesService.getNoteById(req.app.get("db"), req.params.note_id)
    .then(note => {
      if (!note) {
        return res.status(404).json({
          error: { message: `Note doesn't exist` }
        });
      }
      res.note = note;
      next();
    })
    .catch(next);
})
  .get((req, res, next) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get("db"), req.params.note_id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(jsonParser, (req, res, next) => {
    const { noteName, noteContent, folderId } = req.body;
    const noteToUpdate = { noteName, noteContent, folderId };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body ust contain either 'noteName', 'noteContent', or 'folderId'`
        }
      });
    NotesService.updateNote(req.app.get("db"), req.params.note_id, noteToUpdate)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
