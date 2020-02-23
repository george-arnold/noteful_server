const express = require("express");
const FoldersService = require("./folders-service");
const xss = require("xss");
const logger = require("../logger");

const folderRouter = exrepss.Router();
const bodyParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.folder_name)
});

folderRouter
  .route("/")
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get("db"))
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
    FoldersService.insertFolder(req.app.get("db"), newFolder)
      .then(folder => {
        logger.info(` Folder with id ${folder.id} created.`);
        res
          .status(201)
          .location(`${folder.id}`)
          .json(serializeFolder(folder));
      })
      .catch(next);
  });
