const jwt = require("jsonwebtoken");
const fs = require("fs");
var Grid = require("gridfs");

const dir = "./uploads/test/";

module.exports = {
  saveFile: async (data, db, mongo) => {
    try {
      const gfs = Grid(db, mongo);
      const source = data.src;
      const filename = data.fileName;

      const ret = await gfs.fromFile(
        { filename },
        source,
        async (err, file) => {
          const data = await gfs.toFile(
            { _id: file._id },
            dir + filename,
            err => {
              var fileContents = fs.readFileSync(dir + filename).toString();
              console.log(
                "wrote file %s to %s: %s",
                file._id,
                filename,
                fileContents
              );
            }
          );
          return file;
        }
      );
      return ret.id;
    } catch (e) {
      console.error(e);
    }
  },
  writeFileToDb: async (data, db, mongo) => {
    try {
      const gfs = Grid(db, mongo);
      const source = data.src;
      const filename = data.fileName;

      const ret = await gfs.fromFile(
        { filename },
        source,
        async (err, file) => {
          return file;
        }
      );
      return ret.id;
    } catch (e) {
      console.error(e);
    }
  },
  listAll: async (db, mongo) => {
    const gfs = Grid(db, mongo);
    const list = await gfs.list();
    return list;
  },
  removeFile: async (filename, db, mongo) => {
    const gfs = Grid(db, mongo);
    try {
      const found = await gfs.exist({ filename });
      if (found) {
        const ret = await gfs.remove({ filename });
        if (ret) {
          await fs.unlink(dir + filename);
        }
        return "sucess";
      } else {
        throw "file does not exist";
      }
    } catch (err) {
      console.log("Does it exist: ", err);
      return err;
    }
  },
  removeFileFromDb: async (filename, db, mongo) => {
    const gfs = Grid(db, mongo);
    try {
      const found = await gfs.exist({ filename });
      if (found) {
        const ret = await gfs.remove({ filename });
        return "sucess";
      } else {
        throw "file does not exist";
      }
    } catch (err) {
      console.log("Does it exist: ", err);
      return err;
    }
  },
  syncFiles: async (db, mongo) => {
    const gfs = Grid(db, mongo);
    try {
      const knownFiles = await gfs.list();
      knownFiles.forEach(async filename => {
        console.log(filename);
        const ret = await gfs.remove({ filename });
      });
      fs.readdirSync(dir).forEach(file => {
        console.log("physical file: ", file);
        const source = dir + file;
        const filename = file;
        gfs.fromFile({ filename }, source, (err, file) => {});
      });
    } catch (e) {
      console.error(e);
    }
  },
};
