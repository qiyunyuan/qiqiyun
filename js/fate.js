import { switchPage } from './router.js';

// --- 1. 数据管理部分 ---

let fateData = {};
let currentCategory = "";

// 读取数据
try {
    const saved = localStorage.getItem('fateData');
    if (saved) {
        fateData = JSON.parse(saved);
    }
} catch (e) {
    console.error("读取缓存出错", e);
}

// 默认数据
if (Object.keys(fateData).length === 0) {
    fateData = {
        "今天吃啥": ["火锅", "日料", "自己做", "西北风", "烧烤", "麻辣烫"],
        "谁去洗碗": ["老公", "老婆", "猜拳"]
    };
}
currentCategory = Object.keys(fateData)[0] || "";

function saveData() {
    localStorage.setItem('fateData', JSON.stringify(fateData));
}

// --- 2. 页面逻辑部分 ---

export function initFate() {
    console.log("老虎机初始化...");

    const btnBack = document.getElementById('btn-back-fate');
    if (btnBack) btnBack.onclick = () => switchPage('page-daily');

    // 初始化渲染
    renderSlot();
    updateTitle(); // 【新增】更新标题

    const startBtn = document.getElementById('btn-start-fate');
    if(startBtn) {
        startBtn.onclick = () => {
            if (!checkData()) return;
            spinSlot();
        };
    }

    setupSettings();
}

function checkData() {
    if (!currentCategory || !fateData[currentCategory] || fateData[currentCategory].length === 0) {
        alert("当前分类没东西，快去设置里加！");
        return false;
    }
    return true;
}

// 【新增】更新页面上的分类标题
function updateTitle() {
    const titleEl = document.getElementById('current-category-title');
    if (titleEl) {
        titleEl.textContent = currentCategory || "暂无分类";
    }
}

// =======================
//      老虎机逻辑
// =======================
function renderSlot() {
    const strip = document.querySelector('.slot-strip');
    if (!strip) return;
    const items = fateData[currentCategory] || [];
    
    // 如果没数据，显示提示
    if (items.length === 0) {
        strip.innerHTML = `<div class="slot-item" style="font-size:16px; color:#999;">空空如也</div>`;
        return;
    }

    strip.innerHTML = `<div class="slot-item">${items[0]}</div>`;
    strip.style.top = '0px';
    strip.style.transition = 'none';
}

function spinSlot() {
    const strip = document.querySelector('.slot-strip');
    const items = fateData[currentCategory] || [];
    if (items.length === 0) return;

    const targetIndex = Math.floor(Math.random() * items.length);
    const targetItem = items[targetIndex];
    
    let html = '';
    // 增加滚动圈数
    for(let i=0; i<5; i++) {
        items.forEach(item => {
            html += `<div class="slot-item">${item}</div>`;
        });
    }
    html += `<div class="slot-item" id="slot-target">${targetItem}</div>`;
    
    strip.innerHTML = html;
    strip.style.transition = 'none';
    strip.style.top = '0px';
    strip.offsetHeight; // 强制重绘
    
    // 注意：这里的高度要和 CSS 里的 .slot-item 高度一致 (140px)
    const itemHeight = 140; 
    const totalItems = strip.querySelectorAll('.slot-item').length;
    const finalTop = -(totalItems - 1) * itemHeight;
    
    strip.style.transition = 'top 3s cubic-bezier(0.1, 0.9, 0.2, 1)';
    strip.style.top = `${finalTop}px`;
    
    setTimeout(() => {
        alert(`✨ 命运选择了：${targetItem}`);
    }, 3100);
}

// =======================
//      设置相关逻辑
// =======================
function setupSettings() {
    const btnSettings = document.getElementById('btn-fate-settings');
    const modal = document.getElementById('fate-settings-modal');
    const btnClose = document.getElementById('btn-close-settings');
    
    if (btnSettings) {
        btnSettings.onclick = () => {
            renderSettingsPanel();
            modal.classList.remove('hidden');
        };
    }
    if (btnClose) {
        btnClose.onclick = () => {
            modal.classList.add('hidden');
            saveData();
            // 关闭设置后刷新显示
            renderSlot();
            updateTitle(); // 【新增】关闭设置时也要更新标题
        };
    }
    bindSettingsInternalEvents();
}

function renderSettingsPanel() {
    const select = document.getElementById('category-select');
    const list = document.getElementById('item-list');
    
    select.innerHTML = '';
    const keys = Object.keys(fateData);
    
    if (keys.length === 0) {
        select.innerHTML = '<option>暂无分类</option>';
        list.innerHTML = '';
        return;
    }

    keys.forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key;
        if(key === currentCategory) opt.selected = true;
        select.appendChild(opt);
    });

    renderItemList();
}

function renderItemList() {
    const list = document.getElementById('item-list');
    list.innerHTML = '';
    const items = fateData[currentCategory] || [];
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="item-text" data-index="${index}">${item}</span>
            <span class="del" data-index="${index}">×</span>
        `;
        list.appendChild(li);
    });
}

function bindSettingsInternalEvents() {
    const select = document.getElementById('category-select');
    const btnNewCat = document.getElementById('btn-new-category');
    const btnDelCat = document.getElementById('btn-del-category');
    const btnAddItem = document.getElementById('btn-add-item');
    const inputItem = document.getElementById('new-item-input');
    const list = document.getElementById('item-list');

    if(select) {
        select.onchange = (e) => {
            currentCategory = e.target.value;
            renderItemList();
        };
    }

    if(btnNewCat) {
        btnNewCat.onclick = () => {
            const name = prompt("新分类名称：");
            if(name && !fateData[name]) {
                fateData[name] = [];
                currentCategory = name;
                saveData();
                renderSettingsPanel();
            }
        };
    }

    if(btnDelCat) {
        btnDelCat.onclick = () => {
            if(confirm(`删除分类 ${currentCategory}?`)) {
                delete fateData[currentCategory];
                const keys = Object.keys(fateData);
                currentCategory = keys[0] || "";
                saveData();
                renderSettingsPanel();
            }
        };
    }

    if(btnAddItem) {
        btnAddItem.onclick = () => {
            const val = inputItem.value.trim();
            if(val && currentCategory) {
                fateData[currentCategory].push(val);
                inputItem.value = '';
                saveData();
                renderItemList();
            }
        };
    }

    if(list) {
        list.onclick = (e) => {
            const idx = e.target.dataset.index;
            if(idx === undefined) return;
            
            if(e.target.classList.contains('del')) {
                fateData[currentCategory].splice(idx, 1);
                saveData();
                renderItemList();
            }
        };
    }
}
