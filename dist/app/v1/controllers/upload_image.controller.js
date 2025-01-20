"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpload = void 0;
const handleUpload = (req, res) => {
    console.log({ req });
    let file = req.files["file"][0];
    if (!file) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "No files were uploaded.",
        });
    }
    const filePath = `/public/uploads/${file.filename}`;
    file = Object.assign(Object.assign({}, file), { filePath });
    return res.status(200).json({
        success: true,
        code: 200,
        message: "File uploaded successfully.",
        file: file,
    });
};
exports.handleUpload = handleUpload;
//# sourceMappingURL=upload_image.controller.js.map