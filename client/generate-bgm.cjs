// 生成示例BGM的脚本
// 运行此脚本来生成示例BGM文件

const fs = require('fs');
const path = require('path');

// 创建一个简单的旋律数据
function generateBGMData() {
  const sampleRate = 44100;
  const duration = 30; // 30秒循环
  const numSamples = sampleRate * duration;
  
  // 创建一个简单的旋律
  const melody = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    349.23, // F4
    392.00, // G4
    440.00, // A4
    493.88, // B4
    523.25  // C5
  ];
  
  const audioData = [];
  
  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
    const melodyIndex = Math.floor((time * 2) % melody.length); // 每0.5秒换一个音符
    const frequency = melody[melodyIndex];
    
    // 生成正弦波
    const sample = Math.sin(2 * Math.PI * frequency * time) * 0.3;
    
    // 添加一些和声
    const harmony = Math.sin(2 * Math.PI * frequency * 1.5 * time) * 0.1;
    
    audioData.push(sample + harmony);
  }
  
  return audioData;
}

// 将音频数据转换为WAV格式
function createWAVFile(audioData, filename) {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = audioData.length * 2;
  const fileSize = 36 + dataSize;
  
  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;
  
  // WAV header
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(1, offset); offset += 2;
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;
  
  // Audio data
  for (let i = 0; i < audioData.length; i++) {
    const sample = Math.max(-1, Math.min(1, audioData[i]));
    buffer.writeInt16LE(sample * 32767, offset);
    offset += 2;
  }
  
  fs.writeFileSync(filename, buffer);
}

// 生成示例BGM
console.log('正在生成示例BGM...');
const audioData = generateBGMData();
const outputPath = path.join(__dirname, 'public', 'bgm.wav');
createWAVFile(audioData, outputPath);
console.log(`示例BGM已生成: ${outputPath}`);
