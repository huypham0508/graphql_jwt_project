export const handleUpload = (req: any, res: any) => {
  let file = req.files["file"][0];
  if (!file) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "No files were uploaded.",
    });
  }
  const filePath = `/public/uploads/${file.filename}`;

  file = { ...file, filePath };

  return res.status(200).json({
    success: true,
    code: 200,
    message: "File uploaded successfully.",
    file: file,
  });
};
