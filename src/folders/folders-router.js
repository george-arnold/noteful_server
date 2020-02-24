const express = require('express');
const FoldersService = require('./folders-service');
const xss = require('xss');
const logger = require('../logger');

const folderRouter = exrepss.Router();
const bodyParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.folder_name)
});

folderRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { folder_name } = req.body;
    const newFolder = { folder_name };

    if (!newFolder[folder_name]) {
      logger.error(`${folder_name} is required`);
      return res.status(400).send({
        error: { message: `'${folder_name}' is required` }
      });
    }
    FoldersService.insertFolder(req.app.get('db'), newFolder)
      .then(folder => {
        logger.info(` Folder with id ${folder.id} created.`);
        res
          .status(201)
          .location(`${folder.id}`)
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

folderRouter
  .route('/:folder_id')

  .all((req, res, next) => {
    const { folder_id } = req.params;
    FoldersService.getByID(req.app.get('db'), folder_id)
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${folder_id} not found`);
          return res.status(404).json({
            error: { message: `Folder Not Found` }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    const { folder_id } = req.params;
    FoldersService.deleteFolder(req.app.get('db'), folder_id)
      .then(numRowsAffected => {
        logger.info(`Folder if id ${folder_id} delete.`);
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const { folder_name } = req.body;
    const folderToUpdate = { folder_name };

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must have folder name `
        }
      });
    }
    FoldersService.updateFolder(req.app.get('db'), req.params.folder_id, folderToUpdate)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = folderRouter;
