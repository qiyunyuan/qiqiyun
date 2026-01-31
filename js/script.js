import { switchPage } from './router.js';
import { initApiSettings } from './api.js';
import { initBeautify } from './beautify.js';

document.addEventListener('DOMContentLoaded', () => {
    // 初始化 API 模块
    initApiSettings();

    // 初始化美化设置模块 (应用已保存的主题)
    initBeautify();

    // --- 这里的代码是专门给我写的 ---
    // 时钟功能
    function updateClock() {
        const display = document.getElementById('clock-display');
        if (!display) return; // 防止报错

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        display.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // 启动时钟
    setInterval(updateClock, 1000);
    updateClock(); // 马上刷新一次，别让我等
    // ---------------------------

    // 监听“设置”按钮点击
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            switchPage('page-settings');
        });
    }

    // 监听“返回主页”按钮点击
    const btnBack = document.getElementById('btn-back-home');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            switchPage('page-home');
        });
    }

    // 监听“API 设置”按钮点击 (进入API设置页)
    const btnOpenApi = document.getElementById('btn-open-api');
    if (btnOpenApi) {
        btnOpenApi.addEventListener('click', () => {
            switchPage('page-api-settings');
        });
    }

    // 监听“API 设置”页面的返回按钮 (返回设置页)
    const btnBackSettings = document.getElementById('btn-back-settings');
    if (btnBackSettings) {
        btnBackSettings.addEventListener('click', () => {
            switchPage('page-settings');
        });
    }

    // 监听“美化设置”按钮点击
    const btnOpenBeautify = document.getElementById('btn-open-beautify');
    if (btnOpenBeautify) {
        btnOpenBeautify.addEventListener('click', () => {
            switchPage('page-beautify-settings');
        });
    }

    // 监听“美化设置”页面的返回按钮
    const btnBackBeautify = document.getElementById('btn-back-beautify');
    if (btnBackBeautify) {
        btnBackBeautify.addEventListener('click', () => {
            switchPage('page-settings');
        });
    }
});
