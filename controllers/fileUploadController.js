const fileUpload = async (req, res) => {
  console.log("req.file", req.file);
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { fileUpload };
