// Local Database Engine (Unified Storage)
const DB = {
    get: (key) => JSON.parse(localStorage.getItem('NEXLORE_' + key)) || [],
    set: (key, val) => localStorage.setItem('NEXLORE_' + key, JSON.stringify(val)),
    push: (key, item) => {
        const list = DB.get(key);
        list.push({ ...item, id: Date.now(), createdAt: new Date().toLocaleDateString('fa-IR') });
        DB.set(key, list);
    }
};

// Course Data Source
const courses = [
    {
        id: 'french',
        name: 'زبان فرانسه',
        img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500',
        activeStudents: '۱,۵۶۷+',
        satisfaction: '۹۶٪',
        why: 'فرانسه دومین زبان مهم و دیپلماتیک دنیا و زبان رسمی بسیاری از سازمان‌های بین‌المللی است.'
    },
    {
        id: 'english',
        name: 'زبان انگلیسی',
        img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500',
        activeStudents: '۲,۸۴۳+',
        satisfaction: '۹۷٪',
        why: 'زبان بین‌المللی ارتباطات، تجارت جهانی و کلید دسترسی به دانش روز دنیا.'
    },
    {
        id: 'korean',
        name: 'زبان کره‌ای',
        img: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=500',
        activeStudents: '۱,۹۸۲+',
        satisfaction: '۹۵٪',
        why: 'زبان فرصت‌های شغلی نوظهور و دروازه ورود به فرهنگ مدرن شرق آسیا.'
    },
    {
        id: 'german',
        name: 'زبان آلمانی',
        img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=500',
        activeStudents: '۱,۲۴۶+',
        satisfaction: '۹۶٪',
        why: 'زبان برتر صنعت، مهندسی و تحصیل رایگان در قلب اروپا.'
    }
];

// Teachers Database for AI Matching (10 Mocked Detailed Teachers)
const teachersDB = [
    { name: 'دکتر مریم کاظمی', lang: 'english', style: 'خونگرم', level: 'advanced', focus: 'مکالمه محاوره ای' },
    { name: 'استاد امین راد', lang: 'english', style: 'جدی', level: 'intermediate', focus: 'ازمون آیلتس تافل دولینگو' },
    { name: 'سارا ملکی', lang: 'french', style: 'خونگرم', level: 'elementary', focus: 'مکالمه محاوره ای' },
    { name: 'ژان لوک پیر', lang: 'french', style: 'جدی', level: 'advanced', focus: 'مدرسه ، دانشگاه رشته خاص' },
    { name: 'پارسا احمدی', lang: 'german', style: 'منطبق بر برنامه', level: 'intermediate', focus: 'مدرسه ، دانشگاه رشته خاص' },
    { name: 'مایکل استون', lang: 'english', style: 'صبور', level: 'elementary', focus: 'مکالمه محاوره ای' },
    { name: 'لی سونگ', lang: 'korean', style: 'خونگرم', level: 'elementary', focus: 'مکالمه محاوره ای' },
    { name: 'الناز کریمی', lang: 'german', style: 'جدی', level: 'advanced', focus: 'ازمون آیلتس تافل دولینگو' },
    { name: 'دیوید بکام', lang: 'english', style: 'خونگرم', level: 'advanced', focus: 'ازمون آیلتس تافل دولینگو' },
    { name: 'کیم مین هو', lang: 'korean', style: 'صبور', level: 'intermediate', focus: 'مدرسه ، دانشگاه رشته خاص' }
];

// Current State
let aiAnswers = {};
let selectedCourse = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCourses();
    checkActiveUser();
});

function renderCourses() {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = courses.map(c => `
        <div class="course-card">
            <img src="${c.img}" alt="${c.name}">
            <h3>${c.name}</h3>
            <p style="font-size: 0.85rem; color: #cbd5e0; margin: 8px 0;">${c.why}</p>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:15px; color:var(--gold-glow);">
                <span><i class="fa-solid fa-users"></i> ${c.activeStudents}</span>
                <span><i class="fa-solid fa-star"></i> ${c.satisfaction} رضایت</span>
            </div>
            <button class="btn-primary-glow" style="width:100%;" onclick="openCourseDetails('${c.id}')">اطلاعات و خرید دوره</button>
        </div>
    `).join('');
}

// AI Matcher Logic
function openAIMatcher(presetLang = null) {
    aiAnswers = {};
    if(presetLang) {
        aiAnswers.lang = presetLang;
        showAIStep(1);
    } else {
        showAIStep(0);
    }
    openModal('aiModal');
}

function showAIStep(stepIndex) {
    const container = document.getElementById('aiStepContainer');
    if(stepIndex === 0) {
        container.innerHTML = `
            <h3>مرحله ۱: زبان مورد نظر خود را انتخاب کنید</h3>
            <div style="display:grid; gap:10px; margin-top:20px;">
                <button class="btn-hero-secondary" onclick="saveAIStep('lang', 'english', 1)">انگلیسی</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('lang', 'french', 1)">فرانسه</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('lang', 'german', 1)">آلمانی</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('lang', 'korean', 1)">کره‌ای</button>
            </div>
        `;
    } else if(stepIndex === 1) {
        container.innerHTML = `
            <h3>مرحله ۲: دلیل شما برای یادگیری زبان چیست؟</h3>
            <div style="display:grid; gap:10px; margin-top:20px;">
                <button class="btn-hero-secondary" onclick="saveAIStep('reason', 'مهاجرت', 2)">مهاجرت</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('reason', 'کار', 2)">کاری</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('reason', 'تحصیل', 2)">تحصیلی</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('reason', 'سفر', 2)">سفر و تفریح</button>
            </div>
        `;
    } else if(stepIndex === 2) {
        container.innerHTML = `
            <h3>مرحله ۳: دوست دارید استادتان چطور باشد؟</h3>
            <div style="display:grid; gap:10px; margin-top:20px;">
                <button class="btn-hero-secondary" onclick="saveAIStep('style', 'جدی', 3)">جدی و سخت‌گیر</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('style', 'خونگرم', 3)">خونگرم و صمیمی</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('style', 'صبور', 3)">صبور و با حوصله</button>
            </div>
        `;
    } else if(stepIndex === 3) {
        container.innerHTML = `
            <h3>مرحله ۴: سطح فعلی خود را چگونه می‌بینید؟</h3>
            <div style="display:grid; gap:10px; margin-top:20px;">
                <button class="btn-hero-secondary" onclick="saveAIStep('level', 'elementary', 4)">مبتدی (Elementary)</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('level', 'intermediate', 4)">متوسط (Intermediate)</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('level', 'advanced', 4)">پیشرفته (Advanced)</button>
            </div>
        `;
    } else if(stepIndex === 4) {
        container.innerHTML = `
            <h3>مرحله ۵: تمرکز اصلی شما روی چیست؟</h3>
            <div style="display:grid; gap:10px; margin-top:20px;">
                <button class="btn-hero-secondary" onclick="saveAIStep('focus', 'مکالمه محاوره ای', 5)">مکالمه محاوره‌ای</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('focus', 'ازمون آیلتس تافل دولینگو', 5)">آزمون‌های بین‌المللی (آیلتس، تافل...)</button>
                <button class="btn-hero-secondary" onclick="saveAIStep('focus', 'مدرسه ، دانشگاه رشته خاص', 5)">مدرسه، دانشگاه یا رشته خاص</button>
            </div>
        `;
    } else if(stepIndex === 5) {
        // AI Processing Stars Animation (4 Seconds)
        container.innerHTML = `
            <div style="text-align:center; padding: 20px 0;">
                <h3>هوش مصنوعی نکسلور در حال تحلیل الگوها...</h3>
                <div class="ai-stars-loader">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                </div>
                <p style="color:var(--text-muted)">بهترین استاد منطبق با روحیات و هدف شما در حال شناسایی است...</p>
            </div>
        `;

        setTimeout(() => {
            finishAIMatching();
        }, 4000);
    }
}

function saveAIStep(key, value, nextStep) {
    aiAnswers[key] = value;
    showAIStep(nextStep);
}

function finishAIMatching() {
    // Basic AI Matching Algorithm
    let matchedTeacher = teachersDB.find(t => t.lang === aiAnswers.lang && t.style === aiAnswers.style) 
                        || teachersDB.find(t => t.lang === aiAnswers.lang) 
                        || teachersDB[0];

    DB.push('ai_logs', { ...aiAnswers, teacherMatched: matchedTeacher.name });

    const container = document.getElementById('aiStepContainer');
    container.innerHTML = `
        <div style="text-align:center;">
            <i class="fa-solid fa-circle-check" style="font-size: 3rem; color: #2ec4b6;"></i>
            <h2 style="margin-top:10px;">استاد پیشنهادی هوش مصنوعی</h2>
            <div style="background:#1b263b; padding:20px; border-radius:12px; margin:20px 0; border:1px solid var(--gold-glow);">
                <h3 style="color:var(--gold-glow); font-size:1.4rem;">${matchedTeacher.name}</h3>
                <p style="margin:8px 0; font-size:0.9rem;">ویژگی: ${matchedTeacher.style} | سطح: ${matchedTeacher.level}</p>
                <p style="font-size:0.85rem; color:#cbd5e0;">تخصص اصلی: ${matchedTeacher.focus}</p>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:20px;">
                شما می‌توانید اولین جلسه رایگان رزرو کنید تا با روش کار و اخلاق استاد آشنا شوید.
            </p>
            <button class="btn-primary-glow" style="width:100%;" onclick="closeModal('aiModal'); openCourseDetails('${matchedTeacher.lang}');">
                ثبت‌نام و رزرو جلسه رایگان
            </button>
        </div>
    `;
}

// Course Invoice Logic
function openCourseDetails(courseId) {
    selectedCourse = courses.find(c => c.id === courseId);
    const container = document.getElementById('courseModalContent');

    container.innerHTML = `
        <h3>فاکتور رسمی و انتخاب پکیج آموزشی - ${selectedCourse.name}</h3>
        <p style="color:var(--text-muted); margin-bottom:20px;">${selectedCourse.why}</p>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <!-- Package 24 Sessions -->
            <div style="background:#1b263b; border:1px solid #415a77; border-radius:12px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h4 style="color:var(--accent-glow); font-size:1.2rem;">دوره ۲۴ جلسه‌ای</h4>
                    <p style="font-size:0.8rem; color:#cbd5e0; margin:10px 0;">مناسب برای یادگیری استاندارد و رفع اشکال پایه.</p>
                    <ul style="font-size:0.85rem; line-height:1.8; margin-right:20px; color:#e2e8f0;">
                        <li>پشتیبانی ۲۴ ساعته استاد مجرب</li>
                        <li>فایل اختصاصی مجموعه بر اساس سطح</li>
                        <li>جزوه اختصاصی جلسات</li>
                    </ul>
                </div>
                <div style="margin-top:20px;">
                    <div style="text-decoration:line-through; color:red; font-size:0.9rem;">۱۸,۰۰۰,۰۰۰ تومان</div>
                    <div style="font-size:1.3rem; font-weight:bold; color:var(--gold-glow);">۱۴,۵۵۹,۰۰۰ تومان</div>
                    <button class="btn-primary-glow" style="width:100%; margin-top:10px;" onclick="goToPayment('${selectedCourse.name} - ۲۴ جلسه', '14559000')">انتخاب و پرداخت آنلاین</button>
                </div>
            </div>

            <!-- Package 38 Sessions VIP -->
            <div style="background:#1b263b; border:2px solid var(--gold-glow); border-radius:12px; padding:20px; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                <span style="position:absolute; top:-12px; left:20px; background:var(--gold-glow); color:black; font-size:0.75rem; font-weight:bold; padding:2px 8px; border-radius:4px;">پیشنهاد ویژه VIP</span>
                <div>
                    <h4 style="color:var(--gold-glow); font-size:1.2rem;">دوره ۳۸ جلسه‌ای VIP</h4>
                    <p style="font-size:0.8rem; color:#cbd5e0; margin:10px 0;">آموزش کامل و عمیق، تمرکز بر آزمون‌ها و مکالمه همزمان.</p>
                    <ul style="font-size:0.85rem; line-height:1.8; margin-right:20px; color:#e2e8f0;">
                        <li>تمامی امکانات دوره ۲۴ جلسه‌ای</li>
                        <li>برنامه اختصاصی زبان‌خوانی شخصی</li>
                        <li>مشاوره اختصاصی چگونگی مطالعه زبان</li>
                        <li>جلسات Free Discussion رایگان</li>
                        <li>تمرکز بر آزمون و مکالمه همزمان</li>
                    </ul>
                </div>
                <div style="margin-top:20px;">
                    <div style="text-decoration:line-through; color:red; font-size:0.9rem;">۲۵,ef900,000 تومان</div>
                    <div style="font-size:1.3rem; font-weight:bold; color:#2ec4b6;">۱۹,۵۰۰,۰۰۰ تومان</div>
                    <button class="btn-primary-glow" style="width:100%; margin-top:10px; background:linear-gradient(135deg,#e76f51,#f4a261);" onclick="goToPayment('${selectedCourse.name} - ۳۸ جلسه VIP', '19500000')">انتخاب و پرداخت آنلاین</button>
                </div>
            </div>
        </div>
    `;

    openModal('courseModal');
}

// Payment Gateway Simulator Logic
function goToPayment(title, amount) {
    closeModal('courseModal');
    const paySummary = document.getElementById('paySummary');
    paySummary.innerHTML = `
        <p><strong>محصول:</strong> ${title}</p>
        <p><strong>مبلغ قابل پرداخت:</strong> ${Number(amount).toLocaleString('fa-IR')} تومان</p>
        <p><strong>کد پیگیری سفارش:</strong> NEX-${Math.floor(100000 + Math.random() * 900000)}</p>
    `;
    openModal('paymentModal');
}

function processPayment(e) {
    e.preventDefault();
    alert('پرداخت شما با موفقیت در شبکه‌ی شتاب انجام شد. ثبت‌نام شما تایید گردید.');
    closeModal('paymentModal');
}

// Advisory Form Logic
function openAdvisoryModal() { openModal('advisoryModal'); }
function submitAdvisory(e) {
    e.preventDefault();
    const name = document.getElementById('advName').value;
    const phone = document.getElementById('advPhone').value;
    DB.push('advisories', { name, phone });
    alert('درخواست مشاوره شما با موفقیت ثبت شد. به‌زودی تماس خواهیم گرفت.');
    closeModal('advisoryModal');
}

// User Auth & Google Login
function openAuthModal() { openModal('authModal'); }
function submitUserAuth(e) {
    e.preventDefault();
    const name = document.getElementById('authName').value;
    const email = document.getElementById('authEmail').value;
    const phone = document.getElementById('authPhone').value;
    
    const user = { name, email, phone };
    DB.push('users', user);
    localStorage.setItem('NEXLORE_ACTIVE_USER', JSON.stringify(user));
    checkActiveUser();
    closeModal('authModal');
}

function handleCredentialResponse(response) {
    // Decode JWT from Google
    const responsePayload = parseJwt(response.credential);
    const user = {
        name: responsePayload.name,
        email: responsePayload.email,
        phone: 'ورود با گوگل'
    };
    DB.push('users', user);
    localStorage.setItem('NEXLORE_ACTIVE_USER', JSON.stringify(user));
    checkActiveUser();
    closeModal('authModal');
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function checkActiveUser() {
    const user = JSON.parse(localStorage.getItem('NEXLORE_ACTIVE_USER'));
    if(user) {
        document.getElementById('authModalBtn').classList.add('hidden');
        document.getElementById('userWelcome').classList.remove('hidden');
        document.getElementById('userNameDisplay').innerText = `سلام، ${user.name}`;
    }
}

function logoutUser() {
    localStorage.removeItem('NEXLORE_ACTIVE_USER');
    document.getElementById('authModalBtn').classList.remove('hidden');
    document.getElementById('userWelcome').classList.add('hidden');
}

// Admin Logic & Auth
function openAdminAuthModal() { openModal('adminAuthModal'); }
function submitAdminAuth(e) {
    e.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;

    if(user === 'Asena ahadi' && pass === 'Asenaahadi22##') {
        closeModal('adminAuthModal');
        loadAdminData();
        openModal('adminPanelModal');
    } else {
        alert('خطا: نام کاربری یا رمز عبور اشتباه است!');
    }
}

function loadAdminData() {
    const users = DB.get('users');
    const advisories = DB.get('advisories');
    const aiLogs = DB.get('ai_logs');

    document.getElementById('adminUsersTable').innerHTML = users.map(u => `
        <tr><td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td><td>${u.createdAt}</td></tr>
    `).join('');

    document.getElementById('adminAdvisoryTable').innerHTML = advisories.map(a => `
        <tr><td>${a.name}</td><td>${a.phone}</td><td>${a.createdAt}</td></tr>
    `).join('');

    document.getElementById('adminAiTable').innerHTML = aiLogs.map(a => `
        <tr><td>${a.lang || '-'}</td><td>${a.reason || '-'}</td><td>${a.teacherMatched}</td><td>${a.createdAt}</td></tr>
    `).join('');
}

function switchAdminTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// Modal Helpers
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
