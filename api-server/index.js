const express = require("express");
const { generateSlug } = require("random-word-slugs");
const cors = require("cors");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const app = express();
const Redis = require("ioredis");
const { Server } = require("socket.io");
const http = require("http");

const PORT = 9000;
const subscriber = new Redis('')

const server = http.createServer(app);
const io = new Server(server, { cors:{
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
}});
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend origin
  methods: ['GET', 'POST']
}));
io.on("connection", socket => {
  socket.on('subscribe', channel => {
    socket.join(channel);
    socket.emit("message", `Joined ${channel}`);
  });
});

server.listen(9002, () => {
  console.log("Socket server running at port 9002");
});

app.use(express.json());

const ecsClient = new ECSClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});

const config = {
  CLUSTER: "",
  TASK: "",
};
app.post("/project", async (req, res) => {
  const { gitURL, slug } = req.body;
  const projectSlug = slug ? slug : generateSlug();
  //spin container
  const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: 'FARGATE',
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [
          "",
          "",
          "",
        ],
        securityGroups: [""],
        assignPublicIp: 'ENABLED',
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: 'builder-image',
          environment: [
            { name: 'GIT_REPOSITORY__URL', value: gitURL },
            { name: 'PROJECT_ID', value: projectSlug },
          ],
        },
      ],
    },
  });
  await ecsClient.send(command);
  return res.status(200).json({
    message: "Project build started",
    projectId: projectSlug,

    url: `http://${projectSlug}.localhost:8000`,
  });
});

async function initRedisSubscribe() {
  console.log('Subscribed to logs...');
  subscriber.psubscribe('logs:*');
subscriber.on('pmessage', (pattern, channel, message) => {
  console.log(`[REDIS LOG] Channel: ${channel} | Message: ${message}`);
  io.to(channel).emit('message', message);
});
}

initRedisSubscribe();
app.listen(PORT, () => {
  console.log(`API server running at port ${PORT}`);
});
