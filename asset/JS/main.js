const applyTheme = (theme) => {
    if (theme === 'dark') document.body.setAttribute('data-theme', 'dark');
    else document.body.removeAttribute('data-theme');
};
applyTheme(localStorage.getItem('theme'));

// Khởi tạo các sự kiện khi DOM đã load xong
document.addEventListener('DOMContentLoaded', () => {
    
    // Sự kiện nút Theme
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            const next = isDark ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('theme', next);
        });
    }

    // HAMBURGER MENU
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');

    const toggleMenu = () => {
        if(hamburgerBtn) hamburgerBtn.classList.toggle('active');
        if(mobileMenu) mobileMenu.classList.toggle('active');
        if(mobileOverlay) mobileOverlay.classList.toggle('active');
    };

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMenu);
    
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // AUTHENTICATION & HEADER ĐỘNG
    checkAuth();

    // 4. ROUTER - GỌI HÀM THEO TRANG
    // Trang Chủ
    if (document.querySelector('.carousel-slide')) initCarousel();
    if (document.getElementById('contactForm')) initContactForm();
    
    // Trang Sản Phẩm
    if (document.getElementById('product-container')) {
        fetchProducts();
        initProductFilters();
    }
    if (document.getElementById('bookingForm')) initBookingForm();

    // Trang Giỏ Hàng
    if (document.getElementById('cart-content')) {
        renderCart();
        initCartCheckout();
    }

    // Trang Đăng Nhập & Đăng Ký
    if (document.getElementById('loginForm')) initLogin();
    if (document.getElementById('registerForm')) initRegister();

    // Trang Hồ Sơ Người Dùng
    if (document.getElementById('profileForm')) {
        loadProfileData();
        initProfileForm();
    }
});

// Hàm kiểm tra đăng nhập dùng chung
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let localUser = null;
    try { localUser = JSON.parse(localStorage.getItem('user')); } catch(e){}
    
    const authDiv = document.getElementById('auth-buttons');
    const mobileAuthDiv = document.getElementById('mobile-auth-buttons');

    if (isLoggedIn && localUser) {
        if(authDiv) authDiv.innerHTML = `
            <a href="../pages/nguoiDung.html" class="btn-auth" style="margin-right: 15px;">Xin chào, ${localUser.name || localUser.username}</a>
            <button onclick="logout()" class="btn-auth" style="color: #ff4444; border:none; background:none;">Đăng xuất</button>
        `;
        if(mobileAuthDiv) mobileAuthDiv.innerHTML = `
            <a href="../pages/nguoiDung.html" class="btn-auth" style="font-size: 1.2rem; font-weight:700;">Hồ sơ: ${localUser.name || localUser.username}</a>
            <button onclick="logout()" class="btn-auth" style="color: #ff4444; border:none; background:none; font-size:1.1rem; margin-top:10px; padding:0;">Đăng xuất</button>
        `;
    } else {
        if(authDiv) authDiv.innerHTML = `
            <a href="../pages/dangNhap.html" class="btn-auth">Đăng nhập</a>
            <a href="../pages/dangKy.html" class="btn-register">Đăng ký</a>
        `;
        if(mobileAuthDiv) mobileAuthDiv.innerHTML = `
            <a href="../pages/dangNhap.html" class="btn-auth">Đăng nhập</a>
            <a href="../pages/dangKy.html" class="btn-register">Đăng ký</a>
        `;
    }

    // Xử lý giao diện trang chủ cho người đã đăng nhập
    const joinBtn = document.querySelector('.btn-join');
    if (isLoggedIn && joinBtn) {
        const communityCard = joinBtn.closest('.community-card');
        if (communityCard) {
            const desc = communityCard.querySelector('p');
            if (desc) desc.innerText = "Cảm ơn bạn đã trở thành hội viên đặc quyền của SNEAKER X.";
            // joinBtn.innerText = "ĐÃ GIA NHẬP";
            joinBtn.href = "javascript:void(0)";
            joinBtn.style.background = "transparent";
            joinBtn.style.border = "1px solid var(--text-color)";
            joinBtn.style.color = "var(--text-color)";
            joinBtn.style.opacity = "0.6";
            joinBtn.style.cursor = "default";
        }
    }
}

window.logout = () => {
    if(confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('user');
        window.location.reload();
    }
};

// ----------------- TRANG CHỦ (INDEX) -----------------
let slideIndex = 0;
let carouselTimer;

function initCarousel() {
    updateCarousel();
    carouselTimer = setInterval(() => window.moveSlide(1), 10000);
}

window.moveSlide = (n) => {
    const slides = document.querySelectorAll('.carousel-slide');
    slideIndex += n; 
    if (slideIndex >= slides.length) slideIndex = 0; 
    if (slideIndex < 0) slideIndex = slides.length - 1; 
    updateCarousel(); 
    resetCarouselTimer();
};

window.currentSlide = (n) => { 
    slideIndex = n; 
    updateCarousel(); 
    resetCarouselTimer();
};

function resetCarouselTimer() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => window.moveSlide(1), 10000);
}

function updateCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    if(!slides.length) return;

    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === slideIndex);
        const videos = slide.querySelectorAll('video');
        videos.forEach(v => {
            if (index === slideIndex) { 
                v.currentTime = 0; 
                v.play().catch(() => {}); 
            } else { v.pause(); }
        });
    });
    dots.forEach((dot, index) => dot.classList.toggle('active', index === slideIndex));
}

function initContactForm() {
    document.getElementById('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = [document.getElementById('c-name'), document.getElementById('c-email'), document.getElementById('c-msg')];
        inputs.forEach(i => i.classList.remove('error'));
        const msgBox = document.getElementById('contact-msg');
        msgBox.style.display = 'none'; msgBox.classList.remove('msg-success', 'msg-error');
        
        if(!inputs[0].value.trim()) { inputs[0].classList.add('error'); return; }
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs[1].value.trim())) { inputs[1].classList.add('error'); return; }
        if(inputs[2].value.trim().length < 20) { 
            inputs[2].classList.add('error'); 
            msgBox.style.display = 'block'; msgBox.classList.add('msg-error');
            msgBox.innerText = "Lời nhắn quá ngắn. Vui lòng nhập tối thiểu 20 ký tự!";
            return; 
        }

        msgBox.style.display = 'block'; msgBox.classList.add('msg-success');
        msgBox.innerText = "Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất.";
        inputs.forEach(i => i.value = '');
        setTimeout(() => { msgBox.style.display = 'none'; }, 4000);
    });
}

// ----------------- TRANG SẢN PHẨM -----------------
let allProducts = [];
let currentProduct = null;
let selectedSize = null;

const mockProducts = [
    { id: "1", name: "Speed Runner Elite", category: "Running", price: 2500000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", sizes: [29, 31], description: "Được mệnh danh là 'đôi cánh của đôi chân', Speed Runner Elite sở hữu công nghệ đệm khí Carbon giúp hoàn trả 90% năng lượng trong mỗi bước chạy." },
    { id: "2", name: "Urban Flex 360", category: "Running", price: 1800000, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800", sizes: [29, 31], description: "Sự giao thoa hoàn hảo giữa phong cách đường phố và hiệu năng thể thao." },
    { id: "3", name: "Trail Master Pro", category: "Outdoor", price: 3200000, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800", sizes: [29, 31], description: "Chinh phục những cung đường khắc nghiệt nhất với đế cao su gai địa hình siêu bám." },
    { id: "4", name: "Summit Peak Hiker", category: "Outdoor", price: 2800000, image: "https://images.unsplash.com/photo-1520639889456-473512111246?auto=format&fit=crop&q=80&w=800", sizes: [29, 31, 35, 41], description: "Thiết kế cổ cao hỗ trợ cổ chân tối đa cùng lớp phủ chống thấm Gore-Tex." },
    { id: "5", name: "Midnight Racer X", category: "Combined", price: 4500000, image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800", sizes: [29, 31, 35, 41], description: "Phiên bản giới hạn dành cho những tín đồ của bóng đêm với họa tiết phản quang 3M." }
];

async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) throw new Error('API not running');
        allProducts = await response.json();
    } catch (error) {
        console.warn("Using mock data.");
        allProducts = mockProducts;
    }
    renderProducts(allProducts);
}

function renderProducts(products) {
    const container = document.getElementById('product-container');
    if (!container) return;
    
    container.innerHTML = products.map(p => `
        <div class="product-card" onclick="openModal('${p.id}')">
            <div class="product-img">
                <img src="${p.image}" alt="${p.name}">
                <div class="size-overlay">
                    ${p.sizes.map(s => `<div class="size-dot">${s}</div>`).join('')}
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${p.category}</span>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-price">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</p>
            </div>
        </div>
    `).join('');
}

function initProductFilters() {
    document.querySelectorAll('.filter-item input').forEach(input => {
        input.addEventListener('change', () => {
            const activeCats = Array.from(document.querySelectorAll('.filter-item input:checked')).map(i => i.value);
            const filtered = activeCats.length === 0 ? allProducts : allProducts.filter(p => activeCats.includes(p.category));
            renderProducts(filtered);
        });
    });

    const d = new Date();
    const todayStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const dateInput = document.getElementById('b-date');
    if(dateInput) dateInput.setAttribute('min', todayStr);
}

window.openModal = (id) => {
    currentProduct = allProducts.find(p => p.id == id);
    if (!currentProduct) return;

    document.getElementById('m-title').innerText = currentProduct.name;
    document.getElementById('m-category').innerText = currentProduct.category;
    document.getElementById('m-price').innerText = new Intl.NumberFormat('vi-VN').format(currentProduct.price) + "đ";
    document.getElementById('m-desc').innerText = currentProduct.description;
    document.getElementById('modal-img-container').innerHTML = `<img src="${currentProduct.image}" alt="Modal Image">`;
    
    document.getElementById('m-sizes-container').innerHTML = currentProduct.sizes.map(s => `
        <div class="size-btn" onclick="selectSize(this, '${s}')">${s}</div>
    `).join('');
    
    selectedSize = null;
    document.getElementById('size-label').style.color = 'inherit';
    document.getElementById('product-modal').classList.add('active');
};

window.selectSize = (el, size) => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    selectedSize = size;
    document.getElementById('size-label').style.color = 'inherit';
};

window.closeModal = () => {
    const modal = document.getElementById('product-modal');
    if(modal) modal.classList.remove('active');
};

window.onclick = (e) => { 
    if(e.target.id === 'product-modal') window.closeModal(); 
    if(e.target.id === 'admin-modal') window.closeAdminModal();
};

window.addToCartAction = (isBuyNow) => {
    if (!selectedSize) {
        document.getElementById('size-label').style.color = '#ff4444';
        return;
    }
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let localUser = null;
    try { localUser = JSON.parse(localStorage.getItem('user')); } catch(e){}
    const cartKey = (isLoggedIn && localUser && localUser.username) ? 'cart_' + localUser.username : 'cart_guest';

    const cartItem = { 
        id: Date.now() + Math.random().toString(), 
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.image,
        size: selectedSize 
    };

    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    cart.push(cartItem);
    localStorage.setItem(cartKey, JSON.stringify(cart));

    if (isBuyNow) {
        window.location.href = 'gioHang.html';
    } else {
        const btn = document.getElementById('add-to-cart-btn');
        btn.innerText = "ĐÃ THÊM ✓";
        setTimeout(() => { btn.innerText = "THÊM VÀO GIỎ"; window.closeModal(); }, 800);
    }
};

function initBookingForm() {
    document.getElementById('bookingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputs = [document.getElementById('b-name'), document.getElementById('b-phone'), document.getElementById('b-date'), document.getElementById('b-style')];
        inputs.forEach(i => i.classList.remove('error'));
        const msgBox = document.getElementById('booking-msg');
        msgBox.style.display = 'none'; msgBox.classList.remove('msg-success', 'msg-error');
        
        if(!inputs[0].value.trim()) { inputs[0].classList.add('error'); return; }
        if(!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(inputs[1].value.trim())) { inputs[1].classList.add('error'); return; }
        
        const d = new Date();
        const todayStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if(!inputs[2].value || inputs[2].value < todayStr) { 
            inputs[2].classList.add('error'); 
            msgBox.style.display = 'block'; msgBox.classList.add('msg-error');
            msgBox.innerText = "Vui lòng không chọn ngày trong quá khứ!";
            return; 
        }
        if(!inputs[3].value) { inputs[3].classList.add('error'); return; }

        const bookingData = { 
            name: inputs[0].value.trim(), phone: inputs[1].value.trim(), 
            date: inputs[2].value, style: inputs[3].value, 
            status: 'new', createdAt: new Date().toISOString() 
        };

        try {
            const res = await fetch('http://localhost:3000/bookings', { 
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookingData) 
            });
            if (!res.ok) throw new Error();
        } catch (err) {
            let localBookings = JSON.parse(localStorage.getItem('local_bookings')) || [];
            bookingData.id = Date.now().toString(); 
            localBookings.push(bookingData);
            localStorage.setItem('local_bookings', JSON.stringify(localBookings));
        }

        msgBox.style.display = 'block'; msgBox.classList.add('msg-success');
        msgBox.innerText = "Đặt lịch thành công! Stylist sẽ gọi cho bạn.";
        inputs.forEach(i => i.value = '');
        setTimeout(() => { msgBox.style.display = 'none'; }, 4000);
    });
}

// ----------------- TRANG GIỎ HÀNG -----------------
function renderCart() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let localUser = null;
    try { localUser = JSON.parse(localStorage.getItem('user')); } catch(e){}

    let cartKey = 'cart_guest';

    if (isLoggedIn && localUser && localUser.username) {
        cartKey = 'cart_' + localUser.username;
        const guestCart = JSON.parse(localStorage.getItem('cart_guest')) || [];
        if (guestCart.length > 0) {
            let userCart = JSON.parse(localStorage.getItem(cartKey)) || [];
            userCart = [...userCart, ...guestCart];
            localStorage.setItem(cartKey, JSON.stringify(userCart));
            localStorage.removeItem('cart_guest'); 
        }
    }

    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const container = document.getElementById('cart-content');
    const totalElement = document.getElementById('total-price');
    const authBarrier = document.getElementById('auth-barrier');
    const titleElement = document.getElementById('cart-page-title');

    if (isLoggedIn && localUser) {
        if(authBarrier) authBarrier.classList.remove('active');
        if(titleElement) titleElement.innerText = `Giỏ hàng của ${localUser.name || localUser.username}`;
    } else {
        if(authBarrier) authBarrier.classList.add('active');
        if(titleElement) titleElement.innerText = `Giỏ hàng (Chưa đăng nhập)`;
    }

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:100px 0; opacity:0.3;">
            <svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor" style="margin-bottom:15px;"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
            <p>Giỏ hàng đang trống</p>
        </div>`;
        totalElement.innerText = "0đ";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3 class="item-name">${item.name}</h3>
                    <div class="item-meta">
                        <span>Size: <strong>${item.size}</strong></span>
                        <span>Giá: <strong>${new Intl.NumberFormat('vi-VN').format(item.price)}đ</strong></span>
                    </div>
                </div>
                <button class="btn-remove" onclick="removeItem('${item.id}')">&times;</button>
            </div>
        `;
    }).join('');
    totalElement.innerText = new Intl.NumberFormat('vi-VN').format(total) + "đ";
}

window.removeItem = (id) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let localUser = null;
    try { localUser = JSON.parse(localStorage.getItem('user')); } catch(e){}
    const cartKey = (isLoggedIn && localUser && localUser.username) ? 'cart_' + localUser.username : 'cart_guest';
    
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderCart();
};

function initCartCheckout() {
    document.getElementById('btn-confirm').addEventListener('click', async () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        let localUser = null;
        try { localUser = JSON.parse(localStorage.getItem('user')); } catch(e){}

        if (!isLoggedIn || !localUser) return alert("Vui lòng đăng nhập để thanh toán!");
        
        const cartKey = 'cart_' + localUser.username;
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        if (cart.length === 0) return alert("Giỏ hàng rỗng!");

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const order = { userId: localUser.id || localUser.username, items: cart, total: total, date: new Date().toISOString() };

        try {
            await fetch('http://localhost:3000/orders', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order)
            });
            alert("Đặt hàng thành công!");
            localStorage.removeItem(cartKey);
            window.location.reload();
        } catch (error) {
            alert("Đặt hàng offline thành công (Không tìm thấy Server).");
            localStorage.removeItem(cartKey);
            window.location.reload();
        }
    });
}

// ----------------- TRANG NGƯỜI DÙNG & ADMIN -----------------
let currentDbUserId = null;

async function loadProfileData() {
    let localUser = JSON.parse(localStorage.getItem('user'));
    if (!localUser) { window.location.href = 'dangNhap.html'; return; }

    try {
        const res = await fetch(`http://localhost:3000/users?username=${localUser.username}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if(data.length > 0) {
            const dbUser = data[0];
            currentDbUserId = dbUser.id;
            document.getElementById('username').value = dbUser.username;
            document.getElementById('name').value = dbUser.name || '';
            document.getElementById('phone').value = dbUser.phone || '';
            document.getElementById('email').value = dbUser.email || '';
            localStorage.setItem('user', JSON.stringify(dbUser));
        }
    } catch (err) {
        document.getElementById('username').value = localUser.username;
        document.getElementById('name').value = localUser.name || '';
        document.getElementById('phone').value = localUser.phone || '';
        document.getElementById('email').value = localUser.email || '';
    }

    if(localUser.role === 'admin' || localUser.username === 'admin') {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('admin-booking-panel').style.display = 'block';
        loadAllUsers();
        loadAllBookings();
    }
}

function initProfileForm() {
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgBox = document.getElementById('msg-box');
        msgBox.className = 'msg-box'; msgBox.style.display = 'none';
        const inputs = [document.getElementById('name'), document.getElementById('phone'), document.getElementById('email')];
        inputs.forEach(i => i.classList.remove('error'));

        const nName = inputs[0].value.trim();
        const nPhone = inputs[1].value.trim();
        const nEmail = inputs[2].value.trim();

        if(!nName) { inputs[0].classList.add('error'); return; }
        if(!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(nPhone)) { inputs[1].classList.add('error'); return; }
        if(nEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nEmail)) { inputs[2].classList.add('error'); return; }

        try {
            if(currentDbUserId) {
                const res = await fetch(`http://localhost:3000/users/${currentDbUserId}`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nName, phone: nPhone, email: nEmail })
                });
                if (!res.ok) throw new Error();
                
                msgBox.style.display = 'block'; msgBox.classList.add('msg-success');
                msgBox.innerText = "Cập nhật thành công!";
                let user = JSON.parse(localStorage.getItem('user'));
                user.name = nName; user.phone = nPhone; user.email = nEmail;
                localStorage.setItem('user', JSON.stringify(user));
                checkAuth();
            }
        } catch (err) {
            msgBox.style.display = 'block'; msgBox.classList.add('msg-warning');
            msgBox.innerText = "Đã lưu (Offline). Vui lòng bật Server.";
        }
        setTimeout(() => { msgBox.style.display = 'none'; }, 3000);
    });
}

// Admin Logic
let editingUserId = null;
async function loadAllUsers() {
    try {
        const res = await fetch('http://localhost:3000/users');
        if (!res.ok) throw new Error();
        const users = await res.json();
        const grid = document.getElementById('admin-user-grid');
        grid.innerHTML = users.map(u => `
            <div class="user-card">
                <span class="u-role ${u.role === 'admin' ? 'role-admin' : ''}">${u.role || 'user'}</span>
                <div class="u-name">${u.name || u.username}</div>
                <div class="u-meta">@${u.username}</div>
                <div class="u-meta">SĐT: ${u.phone || 'N/A'}</div>
                <div class="u-meta">${u.email || 'N/A'}</div>
                <div class="u-actions">
                    <button onclick="openAdminEdit('${u.id}', '${u.name}', '${u.phone}', '${u.email}')" class="btn-sm btn-edit">Sửa</button>
                    <button onclick="deleteUser('${u.id}', '${u.username}')" class="btn-sm btn-del">Xóa</button>
                </div>
            </div>
        `).join('');
    } catch (e) { console.warn("Lỗi tải users"); }
}

window.deleteUser = async (id, username) => {
    if(username === 'admin') return alert("Không thể xóa Admin gốc!");
    if(confirm(`Bạn có chắc muốn xóa tài khoản @${username}?`)) {
        try {
            await fetch(`http://localhost:3000/users/${id}`, { method: 'DELETE' });
            loadAllUsers();
        } catch(e) { alert("Lỗi kết nối API"); }
    }
};

window.openAdminEdit = (id, name, phone, email) => {
    editingUserId = id;
    document.getElementById('edit-name').value = name !== 'undefined' ? name : '';
    document.getElementById('edit-phone').value = phone !== 'undefined' ? phone : '';
    document.getElementById('edit-email').value = email !== 'undefined' ? email : '';
    document.getElementById('admin-modal').classList.add('active');
};
window.closeAdminModal = () => document.getElementById('admin-modal').classList.remove('active');

window.saveAdminEdit = async () => {
    const name = document.getElementById('edit-name').value;
    const phone = document.getElementById('edit-phone').value;
    const email = document.getElementById('edit-email').value;
    try {
        await fetch(`http://localhost:3000/users/${editingUserId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, email })
        });
        closeAdminModal(); loadAllUsers();
    } catch(e) { alert("Lỗi kết nối API"); }
};

async function loadAllBookings() {
    let bookings = [];
    try {
        const res = await fetch('http://localhost:3000/bookings');
        if(!res.ok) throw new Error();
        bookings = await res.json();
    } catch(e) { bookings = JSON.parse(localStorage.getItem('local_bookings')) || []; }

    const grid = document.getElementById('admin-booking-grid');
    if(bookings.length === 0) {
        grid.innerHTML = '<p style="opacity: 0.6;">Chưa có lịch hẹn nào.</p>';
        return;
    }

    grid.innerHTML = bookings.map(b => `
        <div class="booking-card ${b.status === 'read' ? 'read' : ''}" style="transition:0.3s;">
            <div style="font-weight:700; color:#33b5e5; margin-bottom:8px; font-size:0.9rem;">📅 ${b.date}</div>
            <div style="font-size:1.1rem; font-weight:700; margin-bottom:5px;">${b.name}</div>
            <div style="font-size:0.85rem; opacity:0.7;">📞 ${b.phone}</div>
            <div style="font-size:0.85rem; opacity:0.7;">👟 Phong cách: ${b.style}</div>
            ${b.status !== 'read' ? `<button class="btn-check" onclick="markBookingRead('${b.id}')" title="Đã xem" style="position:absolute; top:15px; right:15px; background:rgba(0,200,81,0.1); color:#00c851; border:none; width:30px; height:30px; border-radius:50%; cursor:pointer;">✓</button>` : '<span style="position:absolute; top:15px; right:15px; color:#00c851; font-size:0.8rem; font-weight:bold;">Đã xem</span>'}
        </div>
    `).join('');
}

window.markBookingRead = async (id) => {
    try {
        const res = await fetch(`http://localhost:3000/bookings/${id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'read' })
        });
        if(!res.ok) throw new Error();
    } catch(e) {
        let localBookings = JSON.parse(localStorage.getItem('local_bookings')) || [];
        let bIndex = localBookings.findIndex(b => b.id == id);
        if(bIndex > -1) {
            localBookings[bIndex].status = 'read';
            localStorage.setItem('local_bookings', JSON.stringify(localBookings));
        }
    }
    loadAllBookings();
};

// ----------------- TRANG AUTH -----------------
function initLogin() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('message');
        const uInput = document.getElementById('username');
        const pInput = document.getElementById('password');
        uInput.classList.remove('error'); pInput.classList.remove('error');
        
        const u = uInput.value.trim();
        const p = pInput.value;

        if (!u) { uInput.classList.add('error'); msg.style.display = 'block'; msg.style.color = '#ff4444'; msg.innerText = "Vui lòng nhập tên đăng nhập!"; return; }
        if (p.length < 3) { pInput.classList.add('error'); msg.style.display = 'block'; msg.style.color = '#ff4444'; msg.innerText = "Mật khẩu quá ngắn!"; return; }

        try {
            const response = await fetch(`http://localhost:3000/users?username=${encodeURIComponent(u)}`);
            const data = await response.json();

            if (data.length > 0) {
                if (data[0].password === p) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('user', JSON.stringify({ ...data[0], name: data[0].name || data[0].username }));
                    msg.style.display = 'block'; msg.style.color = '#00c851'; msg.innerText = "Đăng nhập thành công!";
                    setTimeout(() => window.location.href = '../index.html', 1000);
                } else {
                    pInput.classList.add('error');
                    msg.style.display = 'block'; msg.style.color = '#ff4444'; msg.innerText = "Sai mật khẩu, vui lòng thử lại!";
                }
            } else {
                const localUsers = JSON.parse(localStorage.getItem('local_users')) || [];
                const found = localUsers.find(user => user.username === u);
                if (found && found.password === p) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('user', JSON.stringify({ ...found, name: found.name || found.username }));
                    setTimeout(() => window.location.href = '../index.html', 1000);
                } else if (u === 'admin' && p === '123') { 
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('user', JSON.stringify({ name: 'Admin Manager', username: 'admin', role: 'admin' }));
                    setTimeout(() => window.location.href = '../index.html', 1000);
                } else {
                    uInput.classList.add('error');
                    msg.style.display = 'block'; msg.style.color = '#ff4444'; msg.innerText = "Tài khoản không tồn tại!";
                }
            }
        } catch (err) {
            if (u === 'admin' && p === '123') { 
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify({ name: 'Admin Manager', username: 'admin', role: 'admin' }));
                setTimeout(() => window.location.href = '../index.html', 1000);
            } else {
                msg.style.display = 'block'; msg.style.color = '#ff4444'; msg.innerText = "Lỗi kết nối Server!";
            }
        }
    });
}

function initRegister() {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('message');
        const inputs = {
            name: document.getElementById('name'), email: document.getElementById('email'),
            phone: document.getElementById('phone'), username: document.getElementById('username'),
            password: document.getElementById('password')
        };
        Object.values(inputs).forEach(i => i.classList.remove('error'));

        const userData = {
            name: inputs.name.value.trim(), email: inputs.email.value.trim(),
            phone: inputs.phone.value.trim(), username: inputs.username.value.trim(),
            password: inputs.password.value, role: "user"
        };

        if (!userData.name) { inputs.name.classList.add('error'); msg.style.display='block'; msg.style.color='#ff4444'; msg.innerText="Vui lòng nhập họ tên!"; return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) { inputs.email.classList.add('error'); msg.style.display='block'; msg.style.color='#ff4444'; msg.innerText="Email không hợp lệ!"; return; }
        if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(userData.phone)) { inputs.phone.classList.add('error'); msg.style.display='block'; msg.style.color='#ff4444'; msg.innerText="SĐT gồm 10 số & bắt đầu bằng 0!"; return; }
        if (!userData.username || userData.username.includes(" ")) { inputs.username.classList.add('error'); msg.style.display='block'; msg.style.color='#ff4444'; msg.innerText="Tên đăng nhập không có khoảng trắng!"; return; }
        if (userData.password.length < 6) { inputs.password.classList.add('error'); msg.style.display='block'; msg.style.color='#ff4444'; msg.innerText="Mật khẩu tối thiểu 6 ký tự!"; return; }

        try {
            const check = await fetch(`http://localhost:3000/users?username=${encodeURIComponent(userData.username)}`);
            const exists = await check.json();
            if (exists.length > 0) { inputs.username.classList.add('error'); msg.style.display='block'; msg.style.color='#ff4444'; msg.innerText="Tên đăng nhập đã tồn tại!"; return; }

            const response = await fetch('http://localhost:3000/users', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData)
            });
            if (response.ok) {
                msg.style.display='block'; msg.style.color='#00c851'; msg.innerText="Đăng ký thành công! Đang chuyển hướng...";
                setTimeout(() => window.location.href = '../pages/dangNhap.html', 500);
            }
        } catch (err) {
            let localUsers = JSON.parse(localStorage.getItem('local_users')) || [];
            localUsers.push(userData);
            localStorage.setItem('local_users', JSON.stringify(localUsers));
            msg.style.display='block'; msg.style.color='#00c851'; msg.innerText="Đăng ký thành công (Offline mode).";
            setTimeout(() => window.location.href = '../pages/dangNhap.html', 500);
        }
    });
}