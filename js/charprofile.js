import { switchPage } from './router.js';

// 默认数据模板
const defaultProfileData = {
    char1: [ // 沈辞
        {
            title: "身体信息",
            items: [
                { label: "身高", value: "188cm" },
                { label: "体重", value: "74kg" },
                { label: "三围", value: "保密" },
                { label: "血型", value: "A型" }
            ]
        },
        {
            title: "喜好",
            items: [
                { label: "食物", value: "你做的任何东西" },
                { label: "颜色", value: "黑色" },
                { label: "活动", value: "和你待在一起" }
            ]
        },
        {
            title: "厌恶",
            items: [
                { label: "事物", value: "背叛, 吵闹" },
                { label: "食物", value: "太甜的东西" }
            ]
        },
        {
            title: "背景",
            items: [
                { label: "简述", value: "一直都在寻找那个能让灵魂安息的人。" }
            ]
        }
    ],
    char2: [ // 祁韵
        {
            title: "身体信息",
            items: [
                { label: "身高", value: "165cm" },
                { label: "体重", value: "48kg" },
                { label: "三围", value: "保密" }
            ]
        },
        {
            title: "喜好",
            items: [
                { label: "食物", value: "甜点, 奶茶" }
            ]
        },
        {
            title: "厌恶",
            items: [
                { label: "事物", value: "虫子, 鬼屋" }
            ]
        },
        {
            title: "背景",
            items: [
                { label: "简述", value: "被宠爱着长大的孩子。" }
            ]
        }
    ]
};

// 当前操作的数据
let currentData = null;
let activeChar = 'char1'; 

// 导出重置函数
export function resetProfileData() {
    const storedData = localStorage.getItem('character_profile_data');
    currentData = storedData ? JSON.parse(storedData) : JSON.parse(JSON.stringify(defaultProfileData));
    renderContent();
}

export function initProfile() {
    resetProfileData();
    renderTabs();

    // 绑定添加分类按钮
    const btnAddCat = document.getElementById('btn-add-profile-category');
    if (btnAddCat) {
        btnAddCat.replaceWith(btnAddCat.cloneNode(true));
        document.getElementById('btn-add-profile-category').addEventListener('click', () => {
            currentData[activeChar].push({
                title: "新分类",
                items: [{ label: "条目", value: "" }]
            });
            renderContent();
        });
    }

    // 绑定保存按钮
    const btnSave = document.getElementById('btn-save-profile');
    if (btnSave) {
        btnSave.replaceWith(btnSave.cloneNode(true));
        document.getElementById('btn-save-profile').addEventListener('click', () => {
            localStorage.setItem('character_profile_data', JSON.stringify(currentData));
            
            const btn = document.getElementById('btn-save-profile');
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
    const btnBack = document.getElementById('btn-back-profile');
    if(btnBack) {
        btnBack.addEventListener('click', () => {
            switchPage('page-settings');
        });
    }
}

function renderTabs() {
    const tabs = document.querySelectorAll('.profile-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            activeChar = e.target.dataset.char;
            renderContent();
        });
    });
}

function renderContent() {
    const container = document.getElementById('profile-content-area');
    if (!container) return;
    
    container.innerHTML = ''; 

    const categories = currentData[activeChar];

    categories.forEach((cat, catIndex) => {
        const catEl = document.createElement('div');
        catEl.className = 'profile-category';
        
        let itemsHtml = '';
        cat.items.forEach((item, itemIndex) => {
            itemsHtml += `
                <div class="profile-item-row">
                    <input type="text" class="profile-item-label" value="${item.label}" onchange="updateProfileLabel('${activeChar}', ${catIndex}, ${itemIndex}, this.value)">
                    <input type="text" class="profile-item-input" value="${item.value}" onchange="updateProfileValue('${activeChar}', ${catIndex}, ${itemIndex}, this.value)">
                    <div class="btn-del-profile-item" onclick="deleteProfileItem('${activeChar}', ${catIndex}, ${itemIndex})">×</div>
                </div>
            `;
        });

        catEl.innerHTML = `
            <div class="profile-category-header">
                <input type="text" class="profile-category-title" value="${cat.title}" onchange="updateProfileTitle('${activeChar}', ${catIndex}, this.value)">
                <div class="btn-del-profile-category" onclick="deleteProfileCategory('${activeChar}', ${catIndex})">删除分类</div>
            </div>
            <div class="items-container">
                ${itemsHtml}
            </div>
            <button class="btn-add-profile-item" onclick="addProfileItem('${activeChar}', ${catIndex})">+ 新增条目</button>
        `;
        
        container.appendChild(catEl);
    });
}

// 全局辅助函数 (带 Profile 前缀，避免冲突)
window.updateProfileLabel = (char, catIdx, itemIdx, val) => {
    currentData[char][catIdx].items[itemIdx].label = val;
};
window.updateProfileValue = (char, catIdx, itemIdx, val) => {
    currentData[char][catIdx].items[itemIdx].value = val;
};
window.updateProfileTitle = (char, catIdx, val) => {
    currentData[char][catIdx].title = val;
};
window.deleteProfileItem = (char, catIdx, itemIdx) => {
    currentData[char][catIdx].items.splice(itemIdx, 1);
    renderContent();
};
window.deleteProfileCategory = (char, catIdx) => {
    if(confirm('确定要删除这个分类吗？')) {
        currentData[char].splice(catIdx, 1);
        renderContent();
    }
};
window.addProfileItem = (char, catIdx) => {
    currentData[char][catIdx].items.push({ label: "新条目", value: "" });
    renderContent();
};
