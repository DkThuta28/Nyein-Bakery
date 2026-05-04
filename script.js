const firebaseConfig = {
  apiKey: "AIzaSyDXcGlUNjOdSyCxsjAcBLdleFx0WmadY14",
  authDomain: "nyein-bakery.firebaseapp.com",
  databaseURL: "https://nyein-bakery-default-rtdb.asia-southeast1.firebasedatabase.app", // Screenshot 2026-05-03 at 12.43.47.jpg အရ
  projectId: "nyein-bakery",
  storageBucket: "nyein-bakery.firebasestorage.app",
  messagingSenderId: "1087429789634",
  appId: "1:1087429789634:web:6abcc432e2e370898ef85b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();


// --- Loading Logic ---
let dotCount = 0;
const dotsElement = document.getElementById('dots');

const loadingInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    dotsElement.innerText = '.'.repeat(dotCount);
}, 1000);

setTimeout(() => {
    clearInterval(loadingInterval);
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    updateHeaderButton();
}, 3000);

let currentViewId = null;
let edit_cakeImageBase64 = ""; // Edit Page အတွက် Main Image သိမ်းရန်
let edit_currentToys = [];     // Edit Page အတွက် Toys သိမ်းရန်

// --- Navigation Logic ---
let pageHistory = ['homePage'];

function navigateTo(pageId) {
    const targetPage = document.getElementById(pageId);
    if (!targetPage) return;

    // Page ပြောင်းလဲခြင်း logic (မူလအတိုင်း)
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('page--active');
        p.style.display = 'none';
    });
    targetPage.classList.add('page--active');
    targetPage.style.display = 'block';

    if (pageHistory[pageHistory.length - 1] !== pageId) {
        pageHistory.push(pageId);
    }

    // --- ခလုတ်များ အရောင် အလှည့်ကျ ပြောင်းလဲခြင်း logic ---
    const btnOrder = document.getElementById('mainCakeOrderBtn');
    const btnMenu = document.getElementById('mainCakeMenuBtn');

    if (btnOrder && btnMenu) {
        // အရင်ဆုံး နှစ်ခုလုံးကို အဖြူရောင် (Active မဟုတ်တဲ့ပုံစံ) ပြန်လုပ်မယ်
        btnOrder.classList.remove('btn--active');
        btnMenu.classList.remove('btn--active');

        // User ရောက်နေတဲ့ Page အလိုက် ခရမ်းရောင် (Active) ပြန်ထည့်မယ်
        if (pageId === 'homePage' || pageId === 'cakeOrderPage') {
            btnOrder.classList.add('btn--active');
        } else if (pageId === 'cakeMenuGridPage') {
            btnMenu.classList.add('btn--active');
        }
    }

    // Navigation Section ပြ/ဖျောက် logic
    const mainNav = document.getElementById('mainNavigationSection');
    if (mainNav) {
        if (pageId === 'homePage' || pageId === 'cakeOrderPage' || pageId === 'cakeMenuGridPage') {
            mainNav.style.display = 'block';
        } else {
            mainNav.style.display = 'none';
        }
    }
    
    updateHeaderButton();
}

function updateHeaderButton() {
    const btn = document.getElementById('headerBtn');
    if (!btn) return;

    const currentPage = pageHistory[pageHistory.length - 1];
    console.log("Current Page in Header:", currentPage);

    // Cake Menu Page (cakeMenuGridPage) ကိုပါ ☰ ပြမယ့်စာရင်းထဲ ထည့်လိုက်ပါပြီ
    if (currentPage === 'homePage' || currentPage === 'cakeOrderPage' || currentPage === 'cakeMenuGridPage') {
        btn.innerHTML = '☰';
        btn.onclick = () => {
            console.log("Navigating to Settings...");
            navigateTo('settingMainPage');
        };
    } else {
        // ကျန်တဲ့ Page အသေးစိတ်တွေရောက်မှ ← ပြပါမယ်
        btn.innerHTML = '←';
        btn.onclick = () => {
            console.log("Back button clicked!");
            goBack();
        };
    }
}

function openCakeMenuGrid() {
    listenToCakeMenu(); // Firebase က ပုံတွေဆွဲထုတ်ဖို့ ခေါ်မယ်
    navigateTo('cakeMenuGridPage'); // Cake Menu Page ဆီ သွားမယ်
}

function showPageOnly(pageId) {
    const targetPage = document.getElementById(pageId);
    if (!targetPage) return;

    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('page--active');
    });

    targetPage.style.display = 'block';
    targetPage.classList.add('page--active');

    const mainNav = document.getElementById('mainNavigationSection');
    if (mainNav) {
        // ဒီနေရာမှာလည်း cakeMenuGridPage ကို ထည့်ထားပါတယ်
        if (pageId === 'homePage' || pageId === 'cakeOrderPage' || pageId === 'cakeMenuGridPage') {
            mainNav.style.display = 'block';
        } else {
            mainNav.style.display = 'none';
        }
    }

    updateHeaderButton(); 
}

function goBack() {
    console.log("History before pop:", [...pageHistory]);

    if (pageHistory.length > 1) {
        pageHistory.pop(); // လက်ရှိ page ကို ဖယ်လိုက်ပြီ
        const prevPage = pageHistory[pageHistory.length - 1];
        
        console.log("Going back to:", prevPage);
        showPageOnly(prevPage); 
    } else {
        console.warn("No more history to go back!");
        navigateTo('homePage'); // History မရှိတော့ရင် Home ကိုပဲ ပြန်ပို့မယ်
    }
}


// --- Theme Logic ---
function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// --- Alert Logic ---
function showDeleteAlert(event) {
    if (event) event.stopPropagation();
    document.getElementById('alertOverlay').style.display = 'flex';
}

function closeAlert() {
    document.getElementById('alertOverlay').style.display = 'none';
}

let currentToys = [];

// Home Page က Cake Order ကို နှိပ်လျှင်ခေါ်ရန် (ပုံ ၁)
function openCakeOrder() {
    const btn = document.querySelector('.main-nav__btn');
    btn.classList.add('btn--active');
    navigateTo('cakeOrderPage');
    listenToOrders();
}
// လက်ရှိ Home Page HTML ထဲက Cake Order ခလုတ်မှာ onclick="openCakeOrder()" ထည့်ပေးပါ

function listenToOrders() {
    database.ref('orders/').on('value', (snapshot) => {
        const container = document.getElementById('orderListContainer');
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = '<div style="text-align:center; padding:50px; opacity:0.5;">There is no order data.</div>';
            return;
        }

        container.innerHTML = "";
        Object.keys(data).forEach(id => {
            const order = data[id];
            const card = `
                <div class="order-card" onclick="viewOrderDetail('${id}')">
                    <div class="order-card__title">${order.name}</div>
                    <div class="order-card__info">${order.phNumber}</div>
                    <div class="order-card__badges">
                        <span class="badge">Cake Amount: ${Number(order.size).toLocaleString()} MMK</span>
                        <span class="badge">Deli Date: ${order.deliDate}</span>
                    </div>
                    <div class="order-card__delete-icon" onclick="event.stopPropagation(); deleteOrder('${id}')">🗑️</div>
                </div>`;
            container.innerHTML += card;
        });
    });
}

// Toy Upload Logic
function handleToyUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentToys.push(e.target.result);
            renderToyGrid();
            // ပုံစံတူပုံကို ထပ်ရွေးရင်လည်း အလုပ်လုပ်အောင် value ကို clear လုပ်ပေးရပါမယ်
            input.value = ""; 
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function renderToyGrid() {
    const grid = document.getElementById('toyGrid');
    
    // Grid ကို အရင်ရှင်းမယ်
    grid.innerHTML = "";

    // ၁။ အရင်ထည့်ထားတဲ့ ပုံတွေကို အရင်ထုတ်ပြမယ်
    currentToys.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'toy-item';
        item.innerHTML = `
            <img src="${src}">
            <span class="toy-remove" onclick="removeToy(${index})">✕</span>
        `;
        grid.appendChild(item);
    });

    // ၂။ ပုံအသစ်ထည့်မယ့် (+) box ကို အမြဲတမ်း နောက်ဆုံးမှာ ပြန်ထည့်မယ်
    const addBox = document.createElement('div');
    addBox.className = 'upload-box';
    addBox.style.cssText = "width:60px; height:60px; border:1px dashed var(--card-border); display:flex; align-items:center; justify-content:center; cursor:pointer;";
    addBox.innerText = "+";
    
    // click ရင် input ကို သွားခေါ်မယ်
    addBox.onclick = () => {
        const toyInput = document.getElementById('toyInput');
        if (toyInput) toyInput.click();
    };

    grid.appendChild(addBox);
}

function removeToy(index) {
    currentToys.splice(index, 1);
    renderToyGrid();
}

function viewOrderDetail(id) {
    currentViewId = id;
    database.ref('orders/' + id).once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // ၁။ အခြေခံ အချက်အလက်များ ထည့်သွင်းခြင်း
            document.getElementById('detailName').innerText = data.name || "";
            document.getElementById('detailAge').innerText = data.age || "-";
            document.getElementById('detailSize').innerText = (data.size ? Number(data.size).toLocaleString() : "0") + " MMK";
            document.getElementById('detailColor').innerText = data.color || "-";
            
            // ၂။ Order Date နှင့် Deli Date
            document.getElementById('detailOrderDate').innerText = data.orderDate || "-";
            document.getElementById('detailDeliDate').innerText = data.deliDate || "-";
            
            // ၃။ Acc Name (User မဖြည့်ထားရင် "On Person" ဟု ပြမည်)
            document.getElementById('detailAccName').innerText = data.accName ? data.accName : "On Person";
            
            // ၄။ Phone နှင့် Pre Money
            document.getElementById('detailPhone').innerText = data.phNumber || "-";
            document.getElementById('detailPreMoney').innerText = data.preMoney || "No";
            
            // ၅။ Description About Cake (Notes)
            document.getElementById('detailNotes').innerText = data.description || "-";

            // ၆။ ပုံ (Main Cake Image) ထည့်သွင်းခြင်း
            const imgTag = document.getElementById('detailImg');
            if (data.cakeImage) {
                imgTag.src = data.cakeImage;
                imgTag.style.display = 'block';
            } else {
                imgTag.style.display = 'none';
            }

            // ၇။ Toys များ ထည့်သွင်းခြင်း (List ကို loop ပတ်၍ ထည့်သည်)
            const toyListDiv = document.getElementById('detailToyList');
            toyListDiv.innerHTML = ""; // အဟောင်းများ ရှင်းထုတ်ရန်
            if (data.toys && data.toys.length > 0) {
                data.toys.forEach(toyUrl => {
                    const img = document.createElement('img');
                    img.src = toyUrl;
                    img.className = 'toy-thumb';
                    toyListDiv.appendChild(img);
                });
            } else {
                toyListDiv.innerHTML = '<span style="opacity:0.5;">No toys</span>';
            }

            // ၈။ နောက်ဆုံးတွင် Detail Page သို့ ပြောင်းမည်
            navigateTo('orderDetailPage');
        }
    });
}

// --- Save Order Logic (Updated) ---
function saveOrderData() {
    const orderObj = {
        name: document.getElementById('cakeName').value,
        age: document.getElementById('cakeAge').value,
        size: document.getElementById('cakeSize').value,
        color: document.getElementById('cakeColor').value,
        orderDate: document.getElementById('orderDate').value,
        deliDate: document.getElementById('deliDate').value,
        preMoney: document.getElementById('preYes').checked ? "Yes" : "No",
        description: document.getElementById('cakeDesc').value,
        accName: document.getElementById('accName').value,
        phNumber: document.getElementById('phNumber').value,
        toys: currentToys,
        cakeImage: cakeImageBase64 // <--- ဒါလေး ထည့်ပေးဖို့ လိုပါတယ်
    };

    const requiredFields = ['name', 'age', 'size', 'color', 'orderDate', 'deliDate', 'phNumber'];
    const isMiss = requiredFields.some(f => !orderObj[f]);

    if (isMiss) {
        document.getElementById('missAlertOverlay').style.display = 'flex';
        return;
    }

    database.ref('orders/').push(orderObj).then(() => {
        document.getElementById('alertOverlay').style.display = 'flex';
        document.getElementById('orderForm').reset();
        
        // Reset state and UI
        currentToys = [];
        cakeImageBase64 = "";
        document.getElementById('cakeImagePreview').innerHTML = '<span style="font-size: 24px; opacity: 0.5;">+</span>';
        renderToyGrid();
    }).catch(error => {
        console.error("Data save error: ", error);
        alert("Error saving data!");
    });
}

function deleteOrder(id) {
    if(confirm("Are you sure you want to delete this order?")) {
        database.ref('orders/' + id).remove();
    }
}

let cakeImageBase64 = ""; // ပုံကို သိမ်းထားဖို့ variable

function handleCakeImageUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewBox = document.getElementById('cakeImagePreview');
            // ပုံကို ချက်ချင်းပြမယ်၊ Placeholder icon ကို ဖျောက်မယ်
            previewBox.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
            cakeImageBase64 = e.target.result; // ဒါကို saveOrderData ထဲမှာ သုံးပါမယ်
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Date format (DD.MM.YYYY) အတွက် နံပါတ်နဲ့ အစက်ပဲ ရိုက်လို့ရအောင် ထိန်းမယ်
const dateInputs = [document.getElementById('orderDate'), document.getElementById('deliDate')];

dateInputs.forEach(input => {
    if (input) {
        input.addEventListener('input', function(e) {
            // ၁။ နံပါတ်နဲ့ အစက် ( . ) ကလွဲရင် ကျန်တာ အကုန်ဖျက်မယ်
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // ၂။ Format အလိုအလျောက် ဖြစ်အောင် (နံပါတ် ၂ လုံးရိုက်ပြီးတိုင်း အစက်ထည့်ပေးမယ်)
            if (e.inputType !== 'deleteContentBackward') {
                if (this.value.length === 2 || this.value.length === 5) {
                    this.value += '.';
                }
            }

            // ၃။ အက္ခရာ ၁၀ လုံးထက် ပိုရိုက်လို့မရအောင် ကန့်သတ်မယ် (DD.MM.YYYY က ၁၀ လုံးရှိလို့ပါ)
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        });
    }
});

let editingOrderId = null; // ဘယ် item ကို ပြင်နေတာလဲ မှတ်ထားဖို့

function renderEditToyGrid() {
    const grid = document.getElementById('edit_toyGrid');
    if (!grid) return;
    
    grid.innerHTML = "";

    // ၁။ လက်ရှိ ရှိနေတဲ့ ပုံတွေကို ထုတ်ပြမယ်
    edit_currentToys.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'toy-item';
        item.innerHTML = `
            <img src="${src}">
            <span class="toy-remove" onclick="removeEditToy(${index})">✕</span>
        `;
        grid.appendChild(item);
    });

    // ၂။ ပုံအသစ်ထည့်မည့် (+) box
    const addBox = document.createElement('div');
    addBox.className = 'upload-box';
    addBox.style.cssText = "width:60px; height:60px; border:1px dashed var(--card-border); display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:8px;";
    addBox.innerText = "+";
    
    addBox.onclick = () => {
        document.getElementById('edit_toyInput').click();
    };

    grid.appendChild(addBox);
}


function handleEditImageUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewBox = document.getElementById('edit_cakeImagePreview');
            previewBox.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
            edit_cakeImageBase64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function handleEditToyUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            edit_currentToys.push(e.target.result);
            renderEditToyGrid();
            input.value = ""; 
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Toy ပုံပြန်ဖြုတ်ရန်
function removeEditToy(index) {
    edit_currentToys.splice(index, 1);
    renderEditToyGrid();
}

function renderEditToys() {
    const toyList = document.getElementById('edit_toyList');
    if (!toyList) return; // ဒီ line ပါမှ error မတက်မှာပါ

    toyList.innerHTML = '';
    edit_currentToys.forEach((toy, index) => {
        const toyItem = document.createElement('div');
        toyItem.className = 'toy-item';
        toyItem.innerHTML = `
            <img src="${toy}" alt="toy">
            <span class="remove-toy" onclick="removeEditToy(${index})">&times;</span>
        `;
        toyList.appendChild(toyItem);
    });

    // Add button လေး အမြဲရှိနေအောင် လုပ်မယ်
    const addBtn = document.createElement('div');
    addBtn.className = 'add-toy-btn';
    addBtn.innerHTML = '+';
    addBtn.onclick = () => document.getElementById('edit_toyInput').click();
    toyList.appendChild(addBtn);
}

function openEditPage() {
    if (!currentViewId) {
        alert("Order data ရှာမတွေ့ပါဘူး။");
        return;
    }
    editingOrderId = currentViewId;

    database.ref('orders/' + editingOrderId).once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Value တွေကို သေချာထည့်မယ်
            document.getElementById('edit_cakeName').value = data.name || "";
            document.getElementById('edit_cakeAge').value = data.age || "";
            document.getElementById('edit_cakeSize').value = data.size || "";
            document.getElementById('edit_cakeColor').value = data.color || "";
            document.getElementById('edit_orderDate').value = data.orderDate || "";
            document.getElementById('edit_deliDate').value = data.deliDate || "";
            document.getElementById('edit_cakeDesc').value = data.description || "";
            document.getElementById('edit_accName').value = data.accName || "";
            document.getElementById('edit_phNumber').value = data.phNumber || "";

            // Radio Button စစ်ဆေးခြင်း
            if (data.preMoney === "Yes") {
                document.getElementById('edit_preYes').checked = true;
            } else {
                document.getElementById('edit_preNo').checked = true;
            }

            // Image Preview အပိုင်း (အခုနက ပြင်ထားတဲ့အတိုင်း)
            const preview = document.getElementById('edit_cakeImagePreview');
            if (preview) {
                if (data.cakeImage && data.cakeImage !== "") {
                    preview.innerHTML = `<img src="${data.cakeImage}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
                    edit_cakeImageBase64 = data.cakeImage;
                } else {
                    preview.innerHTML = `<span style="font-size: 24px; opacity: 0.5;">+</span>`;
                    edit_cakeImageBase64 = "";
                }
            }

            // Toy List ပြန်ပြခြင်း (ဒီနေရာမှာ error တက်တတ်ပါတယ်)
            edit_currentToys = data.toys || [];
            renderEditToyGrid();

            // အားလုံးပြီးမှ Page ပြောင်းမယ်
            navigateTo('orderEditPage');
        }
    });
}

function updateOrderData() {
    if (!editingOrderId) return;

    const updatedObj = {
        name: document.getElementById('edit_cakeName').value,
        age: document.getElementById('edit_cakeAge').value,
        size: document.getElementById('edit_cakeSize').value,
        color: document.getElementById('edit_cakeColor').value,
        orderDate: document.getElementById('edit_orderDate').value,
        deliDate: document.getElementById('edit_deliDate').value,
        preMoney: document.getElementById('edit_preYes').checked ? "Yes" : "No",
        description: document.getElementById('edit_cakeDesc').value,
        accName: document.getElementById('edit_accName').value,
        phNumber: document.getElementById('edit_phNumber').value,
        toys: edit_currentToys,
        cakeImage: edit_cakeImageBase64
    };

    database.ref('orders/' + editingOrderId).update(updatedObj).then(() => {
        // browser alert အစား မင်းရဲ့ Custom Overlay ကို သုံးမယ်
        const alertBox = document.getElementById('alertOverlay');
        if (alertBox) {
            // Alert box ထဲက စာသားကို Update အောင်မြင်ကြောင်း ပြောင်းမယ် (Optional)
            const alertText = alertBox.querySelector('p'); 
            if (alertText) alertText.innerText = "Order Updated Successfully!";
            
            alertBox.style.display = 'flex';

            // ခလုတ်နှိပ်လိုက်ရင် List page ကို ပြန်သွားဖို့ logic ထည့်မယ်
            const alertBtn = alertBox.querySelector('button');
            if (alertBtn) {
                alertBtn.onclick = () => {
                    closeAlert();
                    navigateTo('cakeOrderPage');
                };
            }
        }
    }).catch(error => {
        console.error("Update error: ", error);
        alert("Error updating order!");
    });
}

// ၁။ Confirm ပိတ်တဲ့ function
function closeConfirm() {
    document.getElementById('confirmOverlay').style.display = 'none';
}

// ၂။ Order ဖျက်တဲ့ function
function deleteOrder(orderId) {
    const confirmOverlay = document.getElementById('confirmOverlay');
    const confirmYesBtn = document.getElementById('confirmYesBtn');

    confirmOverlay.style.display = 'flex';

    confirmYesBtn.onclick = function() {
        database.ref('orders/' + orderId).remove()
            .then(() => {
                closeConfirm();
                showCustomAlert("Order moved to trash!"); 
            })
            .catch(err => console.log(err));
    };
}

// ၃။ Error တက်နေတဲ့ showCustomAlert ကို ဒီလိုပြင်ပါ
function showCustomAlert(message) {
    const alertBox = document.getElementById('alertOverlay');
    if (alertBox) {
        // <p> tag ရှိမရှိ သေချာစစ်ပြီးမှ စာသားထည့်ပါ
        const alertText = alertBox.querySelector('p');
        if (alertText) {
            alertText.innerText = message;
        }
        alertBox.style.display = 'flex';
    }
}

function listenToOrders() {
    database.ref('orders/').on('value', (snapshot) => {
        const container = document.getElementById('orderListContainer');
        const searchInput = document.getElementById('orderSearch');
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = '<div style="text-align:center; padding:50px; opacity:0.5;">There is no order data.</div>';
            return;
        }

        // Search လုပ်တဲ့ Function
        const renderOrders = (filterText = "") => {
            container.innerHTML = "";
            const searchTerm = filterText.toLowerCase();

            Object.keys(data).forEach(id => {
                const order = data[id];
                const name = (order.name || "").toLowerCase();
                const deliDate = (order.deliDate || "").toLowerCase();

                // Name သို့မဟုတ် Deli Date တစ်ခုခုနဲ့ ကိုက်ညီရင် ပြမယ်
                if (name.includes(searchTerm) || deliDate.includes(searchTerm)) {
                    const card = `
                        <div class="order-card" onclick="viewOrderDetail('${id}')">
                            <div class="order-card__title">${order.name}</div>
                            <div class="order-card__info">${order.phNumber}</div>
                            <div class="order-card__badges">
                                <span class="badge">Cake Amount: ${Number(order.size).toLocaleString()} MMK</span>
                                <span class="badge">Deli Date: ${order.deliDate}</span>
                            </div>
                            <div class="order-card__delete-icon" onclick="event.stopPropagation(); deleteOrder('${id}')">🗑️</div>
                        </div>`;
                    container.innerHTML += card;
                }
            });

            // ရှာတာမတွေ့ရင် ပြမယ့်စာ
            if (container.innerHTML === "") {
                container.innerHTML = '<div style="text-align:center; padding:50px; opacity:0.5;">No matching orders found.</div>';
            }
        };

        // အစပိုင်းမှာ အကုန်ပြထားမယ်
        renderOrders(searchInput.value);

        // Search ရိုက်လိုက်တိုင်း စစ်ပေးမယ့် event listener
        searchInput.oninput = (e) => {
            renderOrders(e.target.value);
        };
    });
}


let isMenuEditMode = false;

// ၁။ Menu ပုံများကို Firebase မှ နားထောင်ပြီး ပြသခြင်း
function listenToCakeMenu() {
    database.ref('cake_menu/').on('value', (snapshot) => {
        const grid = document.getElementById('cakeMenuGrid');
        const data = snapshot.val();
        grid.innerHTML = "";

        if (!data) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; opacity:0.5;">No menu photos yet.</div>';
            return;
        }

        Object.keys(data).forEach(id => {
            const item = data[id];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cake-menu-item';
            
            // Edit mode ဖြစ်မှ အနီရောင် 'X' ပြမယ်
            const deleteIcon = isMenuEditMode ? 
                `<div class="menu-delete-trigger" onclick="event.stopPropagation(); deleteMenuItem('${id}')">✖</div>` : '';

            itemDiv.innerHTML = `
                <img src="${item.imageUrl}" class="menu-thumb-img" onclick="openMenuFullView('${item.imageUrl}')">
                ${deleteIcon}
            `;
            grid.appendChild(itemDiv);
        });
    });
}

// ၂။ Edit Mode အဖွင့်အပိတ် (ပုံ ၄ နှင့် ၅ အရ)
function toggleMenuEditMode() {
    isMenuEditMode = !isMenuEditMode;
    const btnText = document.getElementById('menuEditText');
    const btnIcon = document.getElementById('menuEditIcon');
    
    if (isMenuEditMode) {
        btnText.innerText = "Unedit";
        btnIcon.innerText = "✖"; 
    } else {
        btnText.innerText = "Edit";
        btnIcon.innerText = "✎";
    }
    listenToCakeMenu(); // UI ပြန်ဆွဲရန်
}

// ၃။ ပုံကို အကြီးချဲ့ကြည့်ခြင်း (ပုံ ၂ အရ)
function openMenuFullView(url) {
    if (isMenuEditMode) return; 
    const overlay = document.getElementById('menuImageOverlay');
    const img = document.getElementById('menuFullImage');
    img.src = url;
    overlay.style.display = 'flex';
}

function closeMenuFullView() {
    document.getElementById('menuImageOverlay').style.display = 'none';
}

// ၄။ Menu ပုံဖျက်ခြင်း
function deleteMenuItem(id) {
    if (confirm("Delete this menu photo?")) {
        database.ref('cake_menu/' + id).remove();
    }
}

let selectedMenuImageBase64 = "";

function handleMenuImagePreview(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewBox = document.getElementById('menuImagePreview');
            // ပုံကို Full size ပြမယ်
            previewBox.innerHTML = `<img src="${e.target.result}">`;
            selectedMenuImageBase64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function uploadMenuData() {
    if (!selectedMenuImageBase64) {
        alert("Please select an image first!");
        return;
    }

    // Loading ပြရင် ပိုကောင်းပါတယ်
    const saveBtn = document.querySelector('.btn-save-menu');
    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;

    const newMenuRef = database.ref('cake_menu/').push();
    newMenuRef.set({
        imageUrl: selectedMenuImageBase64,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        // အောင်မြင်ရင် ပုံဟောင်းဖြုတ်ပြီး ရှေ့စာမျက်နှာ ပြန်သွားမယ်
        selectedMenuImageBase64 = "";
        saveBtn.innerText = "Save Menu";
        saveBtn.disabled = false;
        
        // Cake Menu Grid ကို Refresh လုပ်ဖို့ လိုအပ်ရင် ခေါ်ပေးပါ
        if (typeof listenToCakeMenu === "function") listenToCakeMenu();
        
        goBack();
    }).catch(err => {
        console.error(err);
        alert("Failed to save menu.");
        saveBtn.innerText = "Save Menu";
        saveBtn.disabled = false;
    });
}

function prepareCreateNewMenu() {
    // ၁။ အရင်တင်ထားတဲ့ ပုံဒေတာကို ရှင်းမယ်
    selectedMenuImageBase64 = ""; 
    
    // ၂။ UI မှာ ပေါ်နေတဲ့ ပုံဟောင်းကို ဖြုတ်ပြီး Placeholder ပြန်ပြမယ်
    const previewBox = document.getElementById('menuImagePreview');
    if (previewBox) {
        previewBox.innerHTML = `
            <span style="font-size: 50px; margin-bottom: 10px;">📷</span>
            <p>Tap to upload cake photo</p>
        `;
    }
    
    // ၃။ ပြီးမှ Page ကို သွားမယ်
    navigateTo('createMenuPage');
}