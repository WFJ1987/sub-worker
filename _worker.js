const MY_TOKEN = '123'; // 请替换为您的实际 token，使用一个复杂的字符串
// @ts-ignore
const KV_NAMESPACE = KV; // 确保 KV 是您在 Cloudflare Workers 设置中绑定的变量名
const SUBCONVERTER = "back.889876.xyz"; // 后端地址
const SUB_CONFIG = "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini"; // 规则地址

const TARGETS = ['clash', 'sing-box', 'singbox', 'shadowrocket', 'quantumult'];
const SUBTARGET_MAP = new Map([
  ['clash', '/clash'],
  ['sing-box', '/singbox'],
  ['singbox', '/singbox'],
  ['shadowrocket', '/clash'],
  ['quantumult', '/clash']
]);

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  console.log(`Request path: ${path}`);
  console.log(`Expected token path: /${MY_TOKEN}`);

  switch (path) {
    case '/':
      return handleHomePage();
    case `/${MY_TOKEN}`:
      return handleSubscriptionRequest(request);
    case `/${MY_TOKEN}/manage`:
      return handleManagePage();
    case `/${MY_TOKEN}/saveMainData`:
      if (request.method === 'POST') return handleSaveMainData(request);
      break;
    case `/${MY_TOKEN}/saveUrls`:
      if (request.method === 'POST') return handleSaveUrls(request);
      break;
  }

  return new Response('Not Found', { status: 404 });
}

async function handleHomePage() {
  const html = `
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

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleSubscriptionRequest(request) {
  const userAgent = request.headers.get('User-Agent') || '';
  let mainData = await KV_NAMESPACE.get('MainData') || '';
  let urlsString = await KV_NAMESPACE.get('urls') || 'https://allsub.king361.cf';
  const urls = urlsString.split(',').map(url => url.trim());
  const url = new URL(request.url);

  let allContent = await fetchAllSubscriptions(urls, mainData, userAgent, url);
  return new Response(allContent, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

async function handleManagePage() {
  const mainData = await KV_NAMESPACE.get('MainData') || '';
  const urlsString = await KV_NAMESPACE.get('urls') || '';

  const html = `
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

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleSaveMainData(request) {
  try {
    const { mainData } = await request.json();
    await KV_NAMESPACE.put('MainData', mainData);
    return new Response(JSON.stringify({ success: true, message: '自定义节点保存成功' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: '自定义节点保存失败' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

async function handleSaveUrls(request) {
  try {
    const { urls } = await request.json();
    await KV_NAMESPACE.put('urls', urls);
    return new Response(JSON.stringify({ success: true, message: '订阅链接保存成功' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: '订阅链接保存失败' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

async function fetchAllSubscriptions(urls, customNodes, userAgent, url) {
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
          req_data += atob(content) + '\n';
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
  return btoa(req_data);
}

async function fetchSubscriptionContent(target, req_data, subConverter, subConfig, SubURL) {
  const subPath = SUBTARGET_MAP.get(target) || '';
  const requestUrl = `https://${subConverter}${subPath}?target=${target}&url=${encodeURIComponent(SubURL)}&config=${subConfig}`;
  
  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch subscription content for target ${target}`);
  }

  return await response.text();
}
