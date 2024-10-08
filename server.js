import express from 'express';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const MY_TOKEN = '123'; // 请替换为您的实际 token
const DATA_FILE = path.join(__dirname, 'data.json');
const SUBCONVERTER = "back.889876.xyz";
const SUB_CONFIG = "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini";

const TARGETS = ['clash', 'sing-box', 'singbox', 'shadowrocket', 'quantumult'];
const SUBTARGET_MAP = new Map([
  ['clash', '/clash'],
  ['sing-box', '/singbox'],
  ['singbox', '/singbox'],
  ['shadowrocket', '/clash'],
  ['quantumult', '/clash']
]);

app.use(express.json());

async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { MainData: '', urls: 'https://allsub.king361.cf' };
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
  res.send(handleHomePage());
});

app.get(`/${MY_TOKEN}`, async (req, res) => {
  const result = await handleSubscriptionRequest(req);
  res.set('Content-Type', 'text/plain; charset=utf-8').send(result);
});

app.get(`/${MY_TOKEN}/manage`, async (req, res) => {
  const data = await readData();
  res.send(handleManagePage(data.MainData, data.urls));
});

app.post(`/${MY_TOKEN}/saveMainData`, async (req, res) => {
  const result = await handleSaveMainData(req);
  res.json(result);
});

app.post(`/${MY_TOKEN}/saveUrls`, async (req, res) => {
  const result = await handleSaveUrls(req);
  res.json(result);
});

function handleHomePage() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>项目主页</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #00CED1;
                color: white; 
            }
            .container {
                max-width: 800px;
                margin: auto;
                background: #2F4F4F;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #fff; 
            }
            p {
                margin-bottom: 20px;
            }
            a {
                color: #00CED1; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>项目 Worker Subscription</h1>
            <p>作者: MJJONONE</p>
            <p>仓库地址: <a href="https://github.com/mjjonone/sub-worker">https://github.com/mjjonone/sub-worker</a></p>
            <p>This project is a Worker Subscription service.</p>
            <p>Author: MJJONONE</p>
            <p>Repository: <a href="https://github.com/mjjonone/sub-worker">https://github.com/mjjonone/sub-worker</a></p>
        </div>
    </body>
    </html>
  `;
}

async function handleSubscriptionRequest(req) {
  const userAgent = req.get('User-Agent') || '';
  const data = await readData();
  const mainData = data.MainData;
  const urlsString = data.urls;
  const urls = urlsString.split(',').map(url => url.trim());
  const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);

  return await fetchAllSubscriptions(urls, mainData, userAgent, url);
}

function handleManagePage(mainData, urlsString) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>管理数据</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #00CED1; 
                color: white; 
            }
            .container {
                max-width: 800px;
                margin: auto;
                background: #2F4F4F; 
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #fff;
            }
            textarea {
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                border-radius: 5px;
                border: 1px solid #ddd;
            }
            button {
                background-color: #4CAF50;
                color: white;
                padding: 10px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            button:hover {
                background-color: #45a049;
            }
            .message {
                margin-top: 10px;
                padding: 10px;
                border-radius: 4px;
            }
            .success {
                background-color: #dff0d8;
                color: #3c763d;
            }
            .error {
                background-color: #f2dede;
                color: #a94442;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>管理数据</h1>
            <form id="mainDataForm">
                <label for="mainData">自定义节点:</label><br>
                <textarea id="mainData" name="mainData" rows="10" cols="50">${mainData}</textarea><br>
                <button type="button" onclick="saveMainData()">保存自定义节点</button>
                <div id="mainDataMessage" class="message"></div>
            </form>
            <form id="urlsForm">
                <label for="urls">订阅链接 (以逗号分隔):</label><br>
                <textarea id="urls" name="urls" rows="4" cols="50">${urlsString}</textarea><br>
                <button type="button" onclick="saveUrls()">保存订阅链接</button>
                <div id="urlsMessage" class="message"></div>
            </form>
        </div>
        <script>
            async function saveMainData() {
                const mainData = document.getElementById('mainData').value;
                const response = await fetch('/${MY_TOKEN}/saveMainData', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mainData }),
                });
                const result = await response.json();
                showMessage('mainDataMessage', result.message, result.success);
            }

            async function saveUrls() {
                const urls = document.getElementById('urls').value;
                const response = await fetch('/${MY_TOKEN}/saveUrls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ urls }),
                });
                const result = await response.json();
                showMessage('urlsMessage', result.message, result.success);
            }

            function showMessage(elementId, message, success) {
                const element = document.getElementById(elementId);
                element.textContent = message;
                element.className = 'message ' + (success ? 'success' : 'error');
            }
        </script>
    </body>
    </html>
  `;
}

async function handleSaveMainData(req) {
  try {
    const { mainData } = req.body;
    const data = await readData();
    data.MainData = mainData;
    await writeData(data);
    return { success: true, message: '自定义节点保存成功' };
  } catch (error) {
    return { success: false, message: '自定义节点保存失败' };
  }
}

async function handleSaveUrls(req) {
  try {
    const { urls } = req.body;
    const data = await readData();
    data.urls = urls;
    await writeData(data);
    return { success: true, message: '订阅链接保存成功' };
  } catch (error) {
    return { success: false, message: '订阅链接保存失败' };
  }
}

async function fetchAllSubscriptions
(urls, customNodes, userAgent, url) {
    let req_data = customNodes;
    let SubURL = `${url.origin}/${MY_TOKEN}`;
  
    try {
      const responses = await Promise.all(urls.map(url => fetch(url, {
        method: 'get',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;',
          'User-Agent': 'worker/sub/mjjonone'
        }
      })));
  
      for (const response of responses) {
        if (response.ok) {
          const content = await response.text();
          try {
            req_data += Buffer.from(content, 'base64').toString('utf-8') + '\n';
          } catch (error) {
            console.error(`Error decoding content: ${error.message}`);
            req_data += content + '\n';
          }
        } else {
          console.error(`Error fetching subscription: ${response.status} ${response.statusText}`);
        }
      }
  
      return await processSubscriptions(req_data, userAgent, SubURL);
    } catch (error) {
      console.error(`Unexpected error in fetchAllSubscriptions: ${error.message}`);
      throw error;
    }
  }
  
  async function processSubscriptions(req_data, userAgent, SubURL) {
    for (const target of TARGETS) {
      if (userAgent.toLowerCase().includes(target)) {
        try {
          return await fetchSubscriptionContent(target, req_data, SUBCONVERTER, SUB_CONFIG, SubURL);
        } catch (error) {
          console.error(`Error with target ${target}: ${error.message}`);
        }
      }
    }
    console.log("User-Agent not matched, returning encoded data");
    return Buffer.from(req_data).toString('base64');
  }
  
  async function fetchSubscriptionContent(target, req_data, subConverter, subConfig, SubURL) {
    const subPath = SUBTARGET_MAP.get(target) || '';
    const requestUrl = `https://${subConverter}${subPath}?target=${target}&url=${encodeURIComponent(SubURL)}&config=${subConfig}`;
    console.log("Request URL: ", requestUrl);
    const response = await fetch(requestUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch subscription content for target ${target}`);
    }
  
    return await response.text();
  }
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  