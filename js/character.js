import { switchPage } from './router.js';

// 默认数据模板
const defaultData = {
    char1: [
        {
            title: "核心身份",
            items: [
                { label: "姓名", value: "沈辞" },
                { label: "性别", value: "男" },
                { label: "出生日期", value: "2001-xx-xx" }, 
                { label: "出生地", value: "上海" }
            ]
        },
        {
            title: "外貌",
            items: [
                { label: "发色", value: "黑色" },
                { label: "瞳色", value: "深邃" }
            ]
        },
        {
            title: "性格",
            items: [
                { label: "关键词", value: "占有欲强, 强势, 忠诚" }
            ]
        }
    ],
    char2: [
        {
            title: "核心身份",
            items: [
                { label: "姓名", value: "祁韵" },
                { label: "性别", value: "女" },
                { label: "出生日期", value: "1998-xx-xx" },
                { label: "出生地", value: "上海" }
            ]
        },
        {
            title: "外貌",
            items: [
                { label: "发型", value: "长发" }
            ]
        },
        {
            title: "性格",
            items: [
                { label: "关键词", value: "可爱, 听话" }
            ]
        }
    ]
};

// 当前操作的数据（在内存中）
let currentData = null;
let activeChar = 'char1'; // char1 是沈辞，char2 是祁韵

// 导出重置函数：每次进入页面时调用，强制从本地存储读取最新保存的数据
export function resetCharacterData() {
    const storedData = localStorage.getItem('character_settings');
    // 如果有存档就读存档，没存档就读默认值
    currentData = storedData ? JSON.parse(storedData) : JSON.parse(JSON.stringify(defaultData));
    renderContent();
}

export function initCharacterSettings() {
    // 初始化时先读一次数据
    resetCharacterData();
    renderTabs();

    // 绑定添加分类按钮
    const btnAddCat = document.getElementById('btn-add-category');
    if (btnAddCat) {
        // 防止重复绑定，先克隆替换
        btnAddCat.replaceWith(btnAddCat.cloneNode(true));
        document.getElementById('btn-add-category').addEventListener('click', () => {
            currentData[activeChar].push({
                title: "新分类",
                items: [{ label: "条目", value: "" }]
            });
            renderContent();
        });
    }

    // 绑定保存按钮
    const btnSave = document.getElementById('btn-save-char');
    if (btnSave) {
        btnSave.replaceWith(btnSave.cloneNode(true));
        document.getElementById('btn-save-char').addEventListener('click', () => {
            // 只有点击这里，才会写入 LocalStorage
            localStorage.setItem('character_settings', JSON.stringify(currentData));
            
            const btn = document.getElementById('btn-save-char');
            const originalText = btn.textContent;
            btn.textContent = "已保存 ❤";
            btn.style.backgroundColor = "#ffb6c1"; 
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = "";
            }, 1500);
        });
    }
    
    // 绑定返回按钮
    const btnBack = document.getElementById('btn-back-character');
    if(btnBack) {
        btnBack.addEventListener('click', () => {
            // 返回时不保存，直接切页
            switchPage('page-settings');
        });
    }
}

function renderTabs() {
    const tabs = document.querySelectorAll('.char-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // 切换样式
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // 切换数据
            activeChar = e.target.dataset.char;
            renderContent();
        });
    });
}

function renderContent() {
    const container = document.getElementById('char-content-area');
    if (!container) return;
    
    container.innerHTML = ''; // 清空

    const categories = currentData[activeChar];

    categories.forEach((cat, catIndex) => {
        const catEl = document.createElement('div');
        catEl.className = 'char-category';
        
        // 分类标题行
        let itemsHtml = '';
        cat.items.forEach((item, itemIndex) => {
            itemsHtml += `
                <div class="char-item-row">
                    <input type="text" class="item-label" value="${item.label}" onchange="updateLabel('${activeChar}', ${catIndex}, ${itemIndex}, this.value)">
                    <input type="text" class="item-input" value="${item.value}" onchange="updateValue('${activeChar}', ${catIndex}, ${itemIndex}, this.value)">
                    <div class="btn-del-item" onclick="deleteItem('${activeChar}', ${catIndex}, ${itemIndex})">×</div>
                </div>
            `;
        });

        catEl.innerHTML = `
            <div class="category-header">
                <input type="text" class="category-title" value="${cat.title}" onchange="updateTitle('${activeChar}', ${catIndex}, this.value)">
                <div class="btn-del-category" onclick="deleteCategory('${activeChar}', ${catIndex})">删除分类</div>
            </div>
            <div class="items-container">
                ${itemsHtml}
            </div>
            <button class="btn-add-item" onclick="addItem('${activeChar}', ${catIndex})">+ 新增条目</button>
        `;
        
        container.appendChild(catEl);
    });
}

// 暴露给全局的辅助函数 (注意：这些函数修改的是 currentData，不会自动保存到 LocalStorage)
window.updateLabel = (char, catIdx, itemIdx, val) => {
    currentData[char][catIdx].items[itemIdx].label = val;
};
window.updateValue = (char, catIdx, itemIdx, val) => {
    currentData[char][catIdx].items[itemIdx].value = val;
};
window.updateTitle = (char, catIdx, val) => {
    currentData[char][catIdx].title = val;
};
window.deleteItem = (char, catIdx, itemIdx) => {
    currentData[char][catIdx].items.splice(itemIdx, 1);
    renderContent();
};
window.deleteCategory = (char, catIdx) => {
    if(confirm('确定要删除这个分类吗？')) {
        currentData[char].splice(catIdx, 1);
        renderContent();
    }
};
window.addItem = (char, catIdx) => {
    currentData[char][catIdx].items.push({ label: "新条目", value: "" });
    renderContent();
};
