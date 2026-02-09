const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 游戏状态管理
let gameState = {
  step: 'setup',
  allNames: ["Nora", "小黄鸡", "杨老师", "张少", "桥派", "空"],
  selectedNames: [],
  players: [],
  dealerIdx: 0,
  roundWindIdx: 0,
  totalHands: 1,
  history: [],
  playerTotals: {}
};

// 提供静态文件服务
app.use(express.static(__dirname));
app.use(cors());

// 根路径返回 HTML 文件
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('新客户端连接:', socket.id);
  
  // 发送当前游戏状态给新连接的客户端
  socket.emit('gameState', gameState);
  
  // 接收客户端的状态更新
  socket.on('updateGameState', (newState) => {
    console.log('接收到状态更新');
    // 更新服务器端的游戏状态
    gameState = newState;
    // 广播给所有其他客户端
    socket.broadcast.emit('gameState', gameState);
  });
  
  // 客户端断开连接
  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
