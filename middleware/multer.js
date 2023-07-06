const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const fileName =
      file.originalname.toLocaleLowerCase() + Date.now() + ".webp";
    cb(null, Date.now() + "-" + fileName);
  },
});

const fileFilter = function (req, file, cb) {
  // Vérifier le type de fichier si nécessaire
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(
    new Error("Erreur : Seuls les fichiers JPEG, JPG et PNG sont autorisés !")
  );
};

const upload = multer({
  storage: storage,
});

const resizeImage = async (req, res, next) => {
  if (req.file) {
    try {
      const IMAGES_FOLDER = process.env.IMAGES_FOLDER; // Récupérer la valeur de IMAGES_FOLDER à partir de process.env

      await sharp(req.file.path)
        .resize(824, 1040, { fit: "contain" }) // On redimensionne l'image dans les proportions données par le front
        .webp({ quality: 90 }) // on change l'extension en .webp avec une qualité de 90
        .toFile(path.join("uploads", `resized-${IMAGES_FOLDER}.webp`)); //On réécrit la nouvelle image en la renommant avec le préfixe "resized-" et l'extension .webp

      fs.unlink(req.file.path, (err) => {
        if (err) {
          throw err;
        }
        // On enlève le chemin de l'image initialement uploadée
        req.file.path = path.join("uploads", `resized-${IMAGES_FOLDER}.webp`); // pour le remplacer par celui de la nouvelle
        next();
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Error while resizing the image." });
    }
  } else {
    next();
  }
};

module.exports = { upload, resizeImage };
