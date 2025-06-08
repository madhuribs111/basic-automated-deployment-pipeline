const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const Redis = require("ioredis");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");

const publisher = new Redis(
  ""
);

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});

const PROJECT_ID = process.env.PROJECT_ID;

function publishLog(log) {
  publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }));
}
async function init() {
  console.log("executing script.js");
  publishLog("Build started for project: ", PROJECT_ID);


  const outDirPath = path.join(__dirname, 'output');
  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  // event listeners
  p.stdout.on('data', function (data) {
    console.log(data.toString());
    publishLog(data.toString());
  });

  p.stdout.on('error', function (data) {
    console.log("Error: ", data.toString());
    publishLog(`Error:  ${data.toString()}`);
  });

  p.on('close', async function () {
    console.log("Build complete");
    if (!fs.existsSync('/home/app/output/dist')) {
  console.error('❌ No dist folder found. Build may have failed or output path is incorrect.');
  process.exit(1);
}
    publishLog("Build complete for project: " , PROJECT_ID);
    const distFolderPath = path.join(__dirname, 'output', 'dist');

    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    publishLog(`Starting to upload`);
    for (const file of distFolderContents) {
      const filePath = path.join(distFolderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) continue;

      console.log("Uploading file to S3: ", filePath);
      publishLog(`Uploading file: ${file}`);

      const command = new PutObjectCommand({
        Bucket: 'vercel-project-outputs01',
        Key: `__outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath), //dynamically set content type based on file extension using mimetypes
      });

      await s3Client.send(command);
      console.log("File uploaded to S3: ", filePath);
      publishLog(`File uploaded: ${file}`);
    }
    console.log("All files uploaded to S3. Done.");
    publishLog(
      "All files uploaded to S3. Build process completed successfully."
    );
  });
}
init();
