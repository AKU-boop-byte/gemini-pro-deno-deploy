import { MultimodalLiveClient } from './core/websocket-client.js';
import { AudioStreamer } from './audio/audio-streamer.js';
import { AudioRecorder } from './audio/audio-recorder.js';
import { CONFIG } from './config/config.js';
import { Logger } from './utils/logger.js';
import { VideoManager } from './video/video-manager.js';
import { ScreenRecorder } from './video/screen-recorder.js';
import { languages } from './language-selector.js';

/**
 * @fileoverview Main entry point for the application.
 * Initializes and manages the UI, audio, video, and WebSocket interactions.
 */

// DOM Elements
const logsContainer = document.getElementById('logs-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const micButton = document.getElementById('mic-button');
const micIcon = document.getElementById('mic-icon');
const audioVisualizer = document.getElementById('audio-visualizer');
const connectButton = document.getElementById('connect-button');
const cameraButton = document.getElementById('camera-button');
const cameraIcon = document.getElementById('camera-icon');
const stopVideoButton = document.getElementById('stop-video');
const screenButton = document.getElementById('screen-button');
const screenIcon = document.getElementById('screen-icon');
const screenContainer = document.getElementById('screen-container');
const screenPreview = document.getElementById('screen-preview');
const inputAudioVisualizer = document.getElementById('input-audio-visualizer');
const apiKeyInput = document.getElementById('api-key');
const voiceSelect = document.getElementById('voice-select');
const languageSelect = document.getElementById('language-select');
const fpsInput = document.getElementById('fps-input');
const configToggle = document.getElementById('config-toggle');
const configContainer = document.getElementById('config-container');
const systemInstructionInput = document.getElementById('system-instruction');
systemInstructionInput.value = CONFIG.SYSTEM_INSTRUCTION.TEXT;
const applyConfigButton = document.getElementById('apply-config');
const responseTypeSelect = document.getElementById('response-type-select');
const verificationModal = document.getElementById('verification-modal');
const secretKeyInput = document.getElementById('secret-key-input');
const verifyKeyButton = document.getElementById('verify-key-button');
const userInfoModal = document.getElementById('user-info-modal');
const userNameInput = document.getElementById('user-name-input');
const submitUserInfoButton = document.getElementById('submit-user-info-button');
const guideModal = document.getElementById('guide-modal');
const guideContent = document.getElementById('guide-content');
const closeGuideButton = guideModal.querySelector('.close-button');
const contactModal = document.getElementById('contact-modal');
const closeContactButton = contactModal.querySelector('.close-button');

// Load saved values from localStorage
const savedApiKey = localStorage.getItem('gemini_api_key');
const savedVoice = localStorage.getItem('gemini_voice');
const savedLanguage = localStorage.getItem('gemini_language');
const savedFPS = localStorage.getItem('video_fps');
const savedSystemInstruction = localStorage.getItem('system_instruction');


if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
}
if (savedVoice) {
    voiceSelect.value = savedVoice;
}

languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    languageSelect.appendChild(option);
});

if (savedLanguage) {
    languageSelect.value = savedLanguage;
}

if (savedFPS) {
    fpsInput.value = savedFPS;
}
if (savedSystemInstruction) {
    systemInstructionInput.value = savedSystemInstruction;
    CONFIG.SYSTEM_INSTRUCTION.TEXT = savedSystemInstruction;
}

// Handle configuration panel toggle
configToggle.addEventListener('click', () => {
    configContainer.classList.toggle('active');
    configToggle.classList.toggle('active');
});

applyConfigButton.addEventListener('click', () => {
    configContainer.classList.toggle('active');
    configToggle.classList.toggle('active');
});

// State variables
let isRecording = false;
let audioStreamer = null;
let audioCtx = null;
let isConnected = false;
let audioRecorder = null;
let isVideoActive = false;
let videoManager = null;
let isScreenSharing = false;
let screenRecorder = null;
let isUsingTool = false;

// Multimodal Client
const client = new MultimodalLiveClient();

/**
 * Logs a message to the UI.
 * @param {string} message - The message to log.
 * @param {string} [type='system'] - The type of the message (system, user, ai).
 */
function logMessage(message, type = 'system') {
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry', type);

    const timestamp = document.createElement('span');
    timestamp.classList.add('timestamp');
    timestamp.textContent = new Date().toLocaleTimeString();
    logEntry.appendChild(timestamp);

    const emoji = document.createElement('span');
    emoji.classList.add('emoji');
    switch (type) {
        case 'system':
            emoji.textContent = '⚙️';
            break;
        case 'user':
            emoji.textContent = '🫵';
            break;
        case 'ai':
            emoji.textContent = '🤖';
            break;
    }
    logEntry.appendChild(emoji);

    const messageText = document.createElement('span');
    messageText.textContent = message;
    logEntry.appendChild(messageText);

    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

/**
 * Updates the microphone icon based on the recording state.
 */
function updateMicIcon() {
    micIcon.textContent = isRecording ? 'mic_off' : 'mic';
    micButton.style.backgroundColor = isRecording ? '#ea4335' : '#4285f4';
}

/**
 * Updates the audio visualizer based on the audio volume.
 * @param {number} volume - The audio volume (0.0 to 1.0).
 * @param {boolean} [isInput=false] - Whether the visualizer is for input audio.
 */
function updateAudioVisualizer(volume, isInput = false) {
    const visualizer = isInput ? inputAudioVisualizer : audioVisualizer;
    const audioBar = visualizer.querySelector('.audio-bar') || document.createElement('div');
    
    if (!visualizer.contains(audioBar)) {
        audioBar.classList.add('audio-bar');
        visualizer.appendChild(audioBar);
    }
    
    audioBar.style.width = `${volume * 100}%`;
    if (volume > 0) {
        audioBar.classList.add('active');
    } else {
        audioBar.classList.remove('active');
    }
}

/**
 * Initializes the audio context and streamer if not already initialized.
 * @returns {Promise<AudioStreamer>} The audio streamer instance.
 */
async function ensureAudioInitialized() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (!audioStreamer) {
        audioStreamer = new AudioStreamer(audioCtx);
        await audioStreamer.addWorklet('vumeter-out', 'js/audio/worklets/vol-meter.js', (ev) => {
            updateAudioVisualizer(ev.data.volume);
        });
    }
    return audioStreamer;
}

/**
 * Handles the microphone toggle. Starts or stops audio recording.
 * @returns {Promise<void>}
 */
async function handleMicToggle() {
    if (!isRecording) {
        try {
            await ensureAudioInitialized();
            audioRecorder = new AudioRecorder();
            
            const inputAnalyser = audioCtx.createAnalyser();
            inputAnalyser.fftSize = 256;
            const inputDataArray = new Uint8Array(inputAnalyser.frequencyBinCount);
            
            await audioRecorder.start((base64Data) => {
                if (isUsingTool) {
                    client.sendRealtimeInput([{
                        mimeType: "audio/pcm;rate=16000",
                        data: base64Data,
                        interrupt: true     // Model isn't interruptable when using tools, so we do it manually
                    }]);
                } else {
                    client.sendRealtimeInput([{
                        mimeType: "audio/pcm;rate=16000",
                        data: base64Data
                    }]);
                }
                
                inputAnalyser.getByteFrequencyData(inputDataArray);
                const inputVolume = Math.max(...inputDataArray) / 255;
                updateAudioVisualizer(inputVolume, true);
            });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(inputAnalyser);
            
            await audioStreamer.resume();
            isRecording = true;
            Logger.info('Microphone started');
            logMessage('Microphone started', 'system');
            updateMicIcon();
        } catch (error) {
            Logger.error('Microphone error:', error);
            logMessage(`Error: ${error.message}`, 'system');
            isRecording = false;
            updateMicIcon();
        }
    } else {
        if (audioRecorder && isRecording) {
            audioRecorder.stop();
        }
        isRecording = false;
        logMessage('Microphone stopped', 'system');
        updateMicIcon();
        updateAudioVisualizer(0, true);
    }
}

/**
 * Resumes the audio context if it's suspended.
 * @returns {Promise<void>}
 */
async function resumeAudioContext() {
    if (audioCtx && audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
}

/**
 * Connects to the WebSocket server.
 * @returns {Promise<void>}
 */
async function connectToWebsocket() {
    const apiKey = apiKeyInput.value || CONFIG.API.KEY;
    if (!apiKey) {
        logMessage('Please input API Key', 'system');
        return;
    }

    // Save values to localStorage
    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('gemini_voice', voiceSelect.value);
    localStorage.setItem('gemini_language', languageSelect.value);
    localStorage.setItem('system_instruction', systemInstructionInput.value);

    const config = {
        model: CONFIG.API.MODEL_NAME,
        generationConfig: {
            responseModalities: responseTypeSelect.value,
            speechConfig: {
                languageCode: languageSelect.value,
                voiceConfig: { 
                    prebuiltVoiceConfig: { 
                        voiceName: voiceSelect.value    // You can change voice in the config.js file
                    }
                }
            },

        },
        systemInstruction: {
            parts: [{
                text: systemInstructionInput.value     // You can change system instruction in the config.js file
            }],
        },
        tools: CONFIG.TOOLS
    };

    try {
        await client.connect(config, apiKey);
        isConnected = true;
        await resumeAudioContext();
        connectButton.textContent = 'Disconnect';
        connectButton.classList.add('connected');
        messageInput.disabled = false;
        sendButton.disabled = false;
        micButton.disabled = false;
        cameraButton.disabled = false;
        screenButton.disabled = false;
        logMessage('Connected to Gemini Multimodal Live API', 'system');
    } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        Logger.error('Connection error:', error);
        logMessage(`Connection error: ${errorMessage}`, 'system');
        isConnected = false;
        connectButton.textContent = 'Connect';
        connectButton.classList.remove('connected');
        messageInput.disabled = true;
        sendButton.disabled = true;
        micButton.disabled = true;
        cameraButton.disabled = true;
        screenButton.disabled = true;
    }
}

/**
 * Disconnects from the WebSocket server.
 */
function disconnectFromWebsocket() {
    client.disconnect();
    isConnected = false;
    if (audioStreamer) {
        audioStreamer.stop();
        if (audioRecorder) {
            audioRecorder.stop();
            audioRecorder = null;
        }
        isRecording = false;
        updateMicIcon();
    }
    connectButton.textContent = 'Connect';
    connectButton.classList.remove('connected');
    messageInput.disabled = true;
    sendButton.disabled = true;
    micButton.disabled = true;
    cameraButton.disabled = true;
    screenButton.disabled = true;
    logMessage('Disconnected from server', 'system');
    
    if (videoManager) {
        stopVideo();
    }
    
    if (screenRecorder) {
        stopScreenSharing();
    }
}

/**
 * Handles sending a text message.
 */
function handleSendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        logMessage(message, 'user');
        client.send({ text: message });
        messageInput.value = '';
    }
}

async function handleVerification() {
    // Use a simple flag in localStorage instead of IP for more stable verification on mobile
    const isVerified = localStorage.getItem('is_user_verified');

    if (isVerified === 'true') {
        // User has verified on this device before, connect directly
        connectToWebsocket();
        return;
    }

    // New user on this device, show verification modal
    verificationModal.style.display = 'flex';
}

verifyKeyButton.addEventListener('click', () => {
    const key = secretKeyInput.value;
    if (key === '张学凯') {
        verificationModal.style.display = 'none';
        userInfoModal.style.display = 'block';
    } else {
        alert('密钥错误！');
    }
});

submitUserInfoButton.addEventListener('click', async () => {
    const userName = userNameInput.value;
    if (!userName) {
        alert('请填写您的名称或ID！');
        return;
    }
    
    const formData = new FormData();
    formData.append('name', userName);
    // IP address is no longer sent

    try {
        const response = await fetch('https://formspree.io/f/mrblbwpj', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            logMessage('用户访问信息已记录。', 'system');
            // Set the verification flag in localStorage
            localStorage.setItem('is_user_verified', 'true');
            
            userInfoModal.style.display = 'none';
            // Do not auto-connect here, let user click the connect button
            logMessage('验证完成，请点击 "Connect" 按钮开始。', 'system');
            connectButton.disabled = false; // Enable connect button after verification
        } else {
            throw new Error('表单提交失败');
        }
    } catch (error) {
        Logger.error('Formspree submission error:', error);
        logMessage(`无法记录用户信息: ${error.message}`, 'system');
        alert('无法提交您的信息，请稍后重试。');
    }
});

// Event Listeners
client.on('open', () => {
    logMessage('WebSocket connection opened', 'system');
});

client.on('log', (log) => {
    logMessage(`${log.type}: ${JSON.stringify(log.message)}`, 'system');
});

client.on('close', (event) => {
    logMessage(`WebSocket connection closed (code ${event.code})`, 'system');
});

client.on('audio', async (data) => {
    try {
        await resumeAudioContext();
        const streamer = await ensureAudioInitialized();
        streamer.addPCM16(new Uint8Array(data));
    } catch (error) {
        logMessage(`Error processing audio: ${error.message}`, 'system');
    }
});

client.on('content', (data) => {
    if (data.modelTurn) {
        if (data.modelTurn.parts.some(part => part.functionCall)) {
            isUsingTool = true;
            Logger.info('Model is using a tool');
        } else if (data.modelTurn.parts.some(part => part.functionResponse)) {
            isUsingTool = false;
            Logger.info('Tool usage completed');
        }

        const text = data.modelTurn.parts.map(part => part.text).join('');
        if (text) {
            logMessage(text, 'ai');
        }
    }
});

client.on('interrupted', () => {
    audioStreamer?.stop();
    isUsingTool = false;
    Logger.info('Model interrupted');
    logMessage('Model interrupted', 'system');
});

client.on('setupcomplete', () => {
    logMessage('Setup complete', 'system');
});

client.on('turncomplete', () => {
    isUsingTool = false;
    logMessage('Turn complete', 'system');
});

client.on('error', (error) => {
    if (error instanceof ApplicationError) {
        Logger.error(`Application error: ${error.message}`, error);
    } else {
        Logger.error('Unexpected error', error);
    }
    logMessage(`Error: ${error.message}`, 'system');
});

client.on('message', (message) => {
    if (message.error) {
        Logger.error('Server error:', message.error);
        logMessage(`Server error: ${message.error}`, 'system');
    }
});

sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
});

micButton.addEventListener('click', handleMicToggle);

connectButton.addEventListener('click', () => {
    if (isConnected) {
        disconnectFromWebsocket();
    } else {
        handleVerification();
    }
});

messageInput.disabled = true;
sendButton.disabled = true;
micButton.disabled = true;
connectButton.textContent = 'Connect';
connectButton.disabled = false; // Allow clicking connect to start verification

/**
 * Handles the video toggle. Starts or stops video streaming.
 * @returns {Promise<void>}
 */
async function handleVideoToggle() {
    Logger.info('Video toggle clicked, current state:', { isVideoActive, isConnected });
    
    localStorage.setItem('video_fps', fpsInput.value);

    if (!isVideoActive) {
        try {
            Logger.info('Attempting to start video');
            if (!videoManager) {
                videoManager = new VideoManager();
            }
            
            await videoManager.start(fpsInput.value,(frameData) => {
                if (isConnected) {
                    client.sendRealtimeInput([frameData]);
                }
            });

            isVideoActive = true;
            cameraIcon.textContent = 'videocam_off';
            cameraButton.classList.add('active');
            Logger.info('Camera started successfully');
            logMessage('Camera started', 'system');

        } catch (error) {
            Logger.error('Camera error:', error);
            logMessage(`Error: ${error.message}`, 'system');
            isVideoActive = false;
            videoManager = null;
            cameraIcon.textContent = 'videocam';
            cameraButton.classList.remove('active');
        }
    } else {
        Logger.info('Stopping video');
        stopVideo();
    }
}

/**
 * Stops the video streaming.
 */
function stopVideo() {
    if (videoManager) {
        videoManager.stop();
        videoManager = null;
    }
    isVideoActive = false;
    cameraIcon.textContent = 'videocam';
    cameraButton.classList.remove('active');
    logMessage('Camera stopped', 'system');
}

cameraButton.addEventListener('click', handleVideoToggle);
stopVideoButton.addEventListener('click', stopVideo);

cameraButton.disabled = true;

/**
 * Handles the screen share toggle. Starts or stops screen sharing.
 * @returns {Promise<void>}
 */
async function handleScreenShare() {
    if (!isScreenSharing) {
        try {
            screenContainer.style.display = 'block';
            
            screenRecorder = new ScreenRecorder();
            await screenRecorder.start(screenPreview, (frameData) => {
                if (isConnected) {
                    client.sendRealtimeInput([{
                        mimeType: "image/jpeg",
                        data: frameData
                    }]);
                }
            });

            isScreenSharing = true;
            screenIcon.textContent = 'stop_screen_share';
            screenButton.classList.add('active');
            Logger.info('Screen sharing started');
            logMessage('Screen sharing started', 'system');

        } catch (error) {
            Logger.error('Screen sharing error:', error);
            logMessage(`Error: ${error.message}`, 'system');
            isScreenSharing = false;
            screenIcon.textContent = 'screen_share';
            screenButton.classList.remove('active');
            screenContainer.style.display = 'none';
        }
    } else {
        stopScreenSharing();
    }
}

/**
 * Stops the screen sharing.
 */
function stopScreenSharing() {
    if (screenRecorder) {
        screenRecorder.stop();
        screenRecorder = null;
    }
    isScreenSharing = false;
    screenIcon.textContent = 'screen_share';
    screenButton.classList.remove('active');
    screenContainer.style.display = 'none';
    logMessage('Screen sharing stopped', 'system');
}

screenButton.addEventListener('click', handleScreenShare);
screenButton.disabled = true;

// Floating Action Button Logic
const fabContainer = document.querySelector('.fab-container');
const fabMain = document.querySelector('.fab-main');
const fabOptions = document.querySelectorAll('.fab-option');

fabMain.addEventListener('click', () => {
    fabContainer.classList.toggle('active');
});

function showGuide() {
    const guideText = `
        <h3 style="background: url('/images/sparkle.gif') no-repeat center center; background-size: contain; padding-top: 20px;">🎉 使用指南 🎉</h3>
        <h3>1. 模型介绍</h3>
        <p>此模型是由“高能职业技术生：学凯同志”呕心沥血养育的智能化模型以参照Google-Gemini docx创新写出更具有人性化与情感共情能力，能帮助您缓解生活压力提供高效的便捷服务，让您的生活充满更多乐趣与动力以及自信的源泉。</p>
        <h3>2. 技术核心</h3>
        <p>该模型采用世界上极其先进的Google-Gemini”模型该模型掌握了全球的信息资源，使得人人皆可访问便从中受益，它基于全球最大的搜索引擎，在全球范围内拥有无数用户（但是因为地理因素的范畴Google暂不支持中国大陆用户去使用-“除非使用外网环境”，所以为了弥补这一点，所以我将模型嵌入内置Google搜索引擎，成为没有外网环境依然可以使用“全球强大的搜索引擎”）。</p>
        <h3>3. 功能与教育价值</h3>
        <p>此模型的功能可以给你远程当作免费的教授，自身拥有浓厚的学识渊博和超强的辨别思维，优秀的指导博士给你指导在客户端上不懂的学术论语与相关的学科题型以及指导思想，将一步步的培养您的实际解决问题和解题思维的综合素养能力与论文答辩等能力、帮助您“杜绝呆滞的学习，养成“学以致用，知行合一”的学习目的以及终身学习的要令，在以后参加高考或从事职场工作时让您受益匪-浅！该功能可以在””客户端上完美运行”，移动端正在调试与Google服务商联系搭建后端移动端支持服务；各位同学们或友商“屏幕共享功能是AI可以看到您设备上的操作与信息才能给你指导与服务-此功能现阶段可以在客户端去运行，移动端可以使用音视频对话功能来实时帮助您生活中解决疑惑，以及强大的AI算法来识别您的周围环境帮助同学们讲解学科题型-内置强大的算法指导教授，讲会一道题，会做一类题的教学思想”、帮助同学们开开心心学习来，高高兴兴玩耍来！管理员作为过来人，AI辅助学习仅是一时无非一世；但同学们要铭记“学习的本质以极致的重复与底层运作的原理来支撑起来强大的知识逻辑思维框架”才能达到学习的乐趣您才能清楚的认识这个世界，发现世界问题，从而运用知识来改造这个世界，这既是高等学府遴选人才的唯一目的也是是展示自我价值的实现的途径！并非功利学习，而是拥有对某领域的热爱去包含学习知识达到内心的充盈！（若同学们，有如何有效学习，提高您的学习成绩进一步提升自己既是提高您的知识图谱框架的心思可到“青少年专区”进一步详细了解）<br>友商们您们可以通过PC端去使用共享屏幕的功能，极明科技模型将会详细的帮您们解决计算机领域方面的难题如开发系统制造软件等或探究计算机某领域的研究报告论文！</p>
        <h3>4. GPS与行程规划</h3>
        <p>该培育模型具有：自动获取GPS定位等能力，只要您要去哪里或规划行程安排此功能会精确的获取你IP地址所在的地方并连接北斗卫星以及百度地图提供的服务给您规划便利的行程和地理位置查询，给出离你这有多远，超近的行程安排自动规避有风险的行程“包括恶劣天气、堵车、意外出现交通事故，造成亲人两行泪的悲剧，基于培育的智能AI算法优化”。</p>
        <h3>5. 生活服务功能</h3>
        <p>有查询天气等功能数据来源“中国气象网”给出最近一周或十天的未来天气的精准预测（不包括在极端天气等预测-天雨冰雹那未知天命与劫数，若您发现某天天气有不好的情况可以来问问，会给出提前的预报与防范措施！）</p>
        <p>该培育模型嵌入有12306app中国铁路官方买票的服务，一站式服务，只需要说出详细的出发地点与终点皆可得到对应的信息和智能模型抢票的功能，不需要您手动去搜索即可快速得到你心中的答案，是否有票是几点的。是否是坐票，卧票和站票等，智能AI抢票将会后期步骤完善，帮助您以较低的价格获得超高的性价比乘坐票。</p>
        <h3>总结</h3>
        <p>以上是简要的培育模型的特别的功能可以帮助您获得获得较高的模型服务体验；再一次致谢“感谢您们对于极明科技的服务的支持我将秉承信念：以打造优秀高效的服务环境和现阶段免费的服务提供，谢谢您们的青睐与使用模型会不断完善”。</p>
        <img src="/images/icon.png" alt="Emoji" style="width: 50px; height: 50px;"/>
    `;
    guideContent.innerHTML = guideText;
    guideModal.style.display = 'block';
}

function hideGuide() {
    guideModal.style.display = 'none';
}

function showContact() {
    contactModal.style.display = 'block';
}

function hideContact() {
    contactModal.style.display = 'none';
}

fabOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        if (action === 'guide') {
            showGuide();
        } else if (action === 'contact') {
            showContact();
        }
        fabContainer.classList.remove('active');
    });
});

closeGuideButton.addEventListener('click', hideGuide);
closeContactButton.addEventListener('click', hideContact);

window.addEventListener('click', (event) => {
    if (event.target == guideModal) {
        hideGuide();
    }
    if (event.target == contactModal) {
        hideContact();
    }
});

// Initial check on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if already verified, if so, user can just click connect.
    // The handleVerification function will take care of the logic.
    logMessage('欢迎使用，请点击 "Connect" 开始。', 'system');
});
