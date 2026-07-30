// Generic file upload endpoint. Returns a relative URL the client stores
// on a thumbnail/avatar/lesson contentUrl field.
export const uploadFile = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file provided" });
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
};
