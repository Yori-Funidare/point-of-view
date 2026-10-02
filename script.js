let currentChapter = 1;
const totalChapters = 4;
let currentFontSize = 1.1;

function startReading() {
    const landing = document.getElementById('landingPage');
    const reader = document.getElementById('readerContainer');

    landing.classList.remove('active-page');

    setTimeout(() => {
        landing.style.display = 'none';
        reader.style.display = 'block';
        showChapter(1);

        void reader.offsetWidth;
        reader.classList.add('active-page');
    }, 400);
}

function showLandingPage() {
    const landing = document.getElementById('landingPage');
    const reader = document.getElementById('readerContainer');

    closeTopMenu();

    reader.classList.remove('active-page');

    setTimeout(() => {
        reader.style.display = 'none';
        landing.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        void landing.offsetWidth;
        landing.classList.add('active-page');
    }, 400);
}

function showChapter(chapterNumber) {
    const chapters = document.querySelectorAll('.chapter');
    chapters.forEach(chap => chap.classList.remove('active'));

    const targetChapter = document.getElementById(`bab-${chapterNumber}`);
    if (targetChapter) {
        targetChapter.classList.add('active');
        currentChapter = chapterNumber;
    }

    for (let i = 1; i <= totalChapters; i++) {
        const link = document.getElementById(`link-${i}`);
        if (link) {
            if (i === chapterNumber) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    }

    document.getElementById('pageIndicator').innerText = `BAB ${currentChapter}`;
    document.getElementById('prevBtn').disabled = (currentChapter === 1);
    document.getElementById('nextBtn').disabled = (currentChapter === totalChapters);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeTopMenu();
}

function nextChapter() {
    if (currentChapter < totalChapters) {
        showChapter(currentChapter + 1);
    }
}

function prevChapter() {
    if (currentChapter > 1) {
        showChapter(currentChapter - 1);
    }
}

function toggleTopMenu() {
    const topMenu = document.getElementById('topMenu');
    const menuBtn = document.getElementById('menuBtn');
    const overlay = document.getElementById('overlay');

    topMenu.classList.toggle('open');
    menuBtn.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeTopMenu() {
    document.getElementById('topMenu').classList.remove('open');
    document.getElementById('menuBtn').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
}

function changeFontSize(direction) {
    currentFontSize += direction * 0.1;
    if (currentFontSize < 0.9) currentFontSize = 0.9;
    if (currentFontSize > 1.5) currentFontSize = 1.5;

    const paragraphs = document.querySelectorAll('.chapter p');
    paragraphs.forEach(p => {
        p.style.fontSize = `${currentFontSize}rem`;
    });
}
