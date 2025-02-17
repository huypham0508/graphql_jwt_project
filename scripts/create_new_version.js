const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "../src/app");

function createNewVersion() {
  const versions = fs
    .readdirSync(baseDir)
    .filter((folder) => folder.startsWith("v") && fs.lstatSync(path.join(baseDir, folder)).isDirectory())
    .sort(); 

  if (versions.length === 0) {
    console.error("Không tìm thấy phiên bản nào!");
    process.exit(1);
  }

  const latestVersion = versions[versions.length - 1];
  const latestVersionNumber = parseInt(latestVersion.replace("v", ""), 10);
  const newVersion = `v${latestVersionNumber + 1}`;
  const newVersionPath = path.join(baseDir, newVersion);

  if (fs.existsSync(newVersionPath)) {
    console.error(`Phiên bản ${newVersion} đã tồn tại!`);
    process.exit(1);
  }

  fs.mkdirSync(newVersionPath);
  copyFolderSync(path.join(baseDir, latestVersion), newVersionPath);
  console.log(`Tạo thành công phiên bản mới: ${newVersion}`);
}

function copyFolderSync(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((item) => {
    const srcPath = path.join(from, item);
    const destPath = path.join(to, item);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

createNewVersion();
