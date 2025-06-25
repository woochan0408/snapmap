const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const IMAGE_PATH = process.env.IMAGE_PATH || 'D:/프로젝트사진';

// 특정 룸의 폴더 상태 확인 API
app.get('/api/room/:roomId/status', (req, res) => {
  const { roomId } = req.params;
  const roomPath = path.join(IMAGE_PATH, `Room_${roomId}`);
  
  try {
    if (!fs.existsSync(roomPath)) {
      return res.json({ 
        exists: false, 
        hasDefective: false, 
        safeCount: 0, 
        defectiveCount: 0 
      });
    }

    const safePath = path.join(roomPath, 'safe');
    const defectivePath = path.join(roomPath, 'defective');
    
    let safeCount = 0;
    let defectiveCount = 0;
    
    if (fs.existsSync(safePath)) {
      const safeFiles = fs.readdirSync(safePath).filter(file => 
        /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
      );
      safeCount = safeFiles.length;
    }
    
    if (fs.existsSync(defectivePath)) {
      const defectiveFiles = fs.readdirSync(defectivePath).filter(file => 
        /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
      );
      defectiveCount = defectiveFiles.length;
    }
    
    res.json({
      exists: true,
      hasDefective: defectiveCount > 0,
      safeCount,
      defectiveCount
    });
  } catch (error) {
    console.error('Error checking room status:', error);
    res.status(500).json({ error: 'Failed to check room status' });
  }
});

// 특정 룸의 이미지 목록 조회 API
app.get('/api/room/:roomId/images/:type', (req, res) => {
  const { roomId, type } = req.params;
  const roomPath = path.join(IMAGE_PATH, `Room_${roomId}`, type);
  
  try {
    if (!fs.existsSync(roomPath)) {
      return res.json({ images: [] });
    }
    
    const files = fs.readdirSync(roomPath).filter(file => 
      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
    );
    
    res.json({ images: files });
  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({ error: 'Failed to get images' });
  }
});

// 이미지 파일 서빙 API
app.get('/api/room/:roomId/images/:type/:filename', (req, res) => {
  const { roomId, type, filename } = req.params;
  const imagePath = path.join(IMAGE_PATH, `Room_${roomId}`, type, filename);
  
  try {
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// 모든 룸의 상태 조회 API (도면 로딩 시 사용)
app.get('/api/rooms/status', (req, res) => {
  try {
    if (!fs.existsSync(IMAGE_PATH)) {
      return res.json({});
    }
    
    const roomFolders = fs.readdirSync(IMAGE_PATH).filter(folder => 
      folder.startsWith('Room_') && fs.statSync(path.join(IMAGE_PATH, folder)).isDirectory()
    );
    
    const roomStatus = {};
    
    roomFolders.forEach(folder => {
      const roomId = folder.replace('Room_', '');
      const roomPath = path.join(IMAGE_PATH, folder);
      const defectivePath = path.join(roomPath, 'defective');
      
      let hasDefective = false;
      if (fs.existsSync(defectivePath)) {
        const defectiveFiles = fs.readdirSync(defectivePath).filter(file => 
          /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
        );
        hasDefective = defectiveFiles.length > 0;
      }
      
      roomStatus[roomId] = { hasDefective };
    });
    
    res.json(roomStatus);
  } catch (error) {
    console.error('Error getting rooms status:', error);
    res.status(500).json({ error: 'Failed to get rooms status' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Image path: ${IMAGE_PATH}`);
});