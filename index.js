const fs = require("fs");
const pdf = require("pdf-parse");
const path = require("path");

const { app, BrowserWindow, ipcMain } = require("electron");

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  win.loadFile("index.html");

  // Open the DevTools.
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

ipcMain.on("item:add", function (e, item) {
  const directoryPath = path.join(__dirname);

  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    console.log(files);
    files.forEach(function (file) {
      if (path.extname(file) == ".pdf") {
        console.log(file);
        let dataBuffer = fs.readFileSync(directoryPath + "\\" + file);
        pdf(dataBuffer).then(function (data) {
          console.log(typeof data.text);
          console.log(data.text.search(item));
          if (data.text.search(item) > 0) {
            var dir = "./tmp";

            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }
            fs.copyFile(
              directoryPath + "\\" + file,
              require("path").join(require("os").homedir(), "Desktop") +
                "\\" +
                file,
              (err) => {
                console.log(directoryPath + "\\" + file);
                console.log(
                  require("path").join(require("os").homedir(), "Desktop") +
                    "\\" +
                    file
                );
                if (err) {
                  console.log("Error Found:", err);
                }
              }
            );
          }
        });
      }
    });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
