/* ==========================================================================
   KONFIGURASI KONTEN — ganti path/URL di bawah dengan karya kamu sendiri
   ========================================================================== */

// Foto yang bergantian di bagian About.
// File yang belum ada otomatis dilewati, jadi aman menaruh path lebih dulu.
const SLIDESHOW_PHOTOS = {
    // pos = titik fokus crop (CSS background-position) supaya wajah tidak terpotong
    about: [
        { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8n6979zV7F6XjdnVNgB9a6XvaBFAdp0sQWmGJR2KKfITZly-Cb-EGjTsrJT7Efe6b0BsSaVGs7TW0GcT6UP62PaIaBdpK1zwYF-y4FKhaOF8oRsqQb8o36LjviMwVF7o7BN5RFn7wEbKsWQl6jKov4WS6uqyNup1AadeSUrFLpXic1odT11qRzzkYx2tYGCr0l5QhGNkJlfVLjvQCPlg3mCNm3bfzFlE140-AAT-vokC7BwU-mHeryzSYvsS48uwBzMI4BU1Z4PSBp3E" }, // foto asli — hapus baris ini kalau tidak mau ikut
        { src: "assets/SPOILER_Tired.jpg", pos: "50% 20%" },
        { src: "assets/Your paragraph text.png", pos: "50% 30%" },
        { src: "assets/Stay_Gold.png", pos: "75% 20%" },
        { src: "assets/SPOILER_eee.jpg", pos: "50% 30%" },
        { src: "assets/SPOILER_hmmm.jpg", pos: "50% 30%" },
    ],
};
const SLIDESHOW_INTERVAL = 2500; // jeda antar foto (ms)
const SLIDESHOW_FADE = 1000;     // lama transisi fade (ms)

// Isi galeri Table Of Content.
// type: "image" | "video" (file .mp4/.webm) | "embed" (YouTube/Vimeo iframe)
const GALLERIES = {
    commission: {
        title: "Commission",
        subtitle: "Artwork & ilustrasi pesanan",
        items: [
            { type: "image", src: "assets/Your paragraph text.png", title: "Commission" },
            { type: "image", src: "assets/Stay_Gold.png", title: "Stay Gold" },
            { type: "image", src: "assets/SPOILER_Tired.jpg", title: "Tired (sketch)" },
            { type: "image", src: "assets/SPOILER_eee.jpg", title: "Hooded (lineart)" },
            { type: "image", src: "assets/SPOILER_hmmm.jpg", title: "Jersey 24 (lineart)" },
        ],
    },
    editor: {
        title: "Video & Photo Editor",
        subtitle: "Hasil edit video dan foto",
        items: [
            { type: "video", src: "assets/F18.mp4", title: "F-18 Hornet" },
            // Contoh YouTube: { type: "embed", src: "https://www.youtube.com/embed/VIDEO_ID", title: "Showreel" },
        ],
    },
};

/* ==========================================================================
   Navbar: ganti latar saat halaman di-scroll melewati 50px
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("mainNav");
    if (nav) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                nav.classList.add("shadow-md");
                nav.classList.replace("bg-background", "bg-tertiary-fixed");
            } else {
                nav.classList.remove("shadow-md");
                nav.classList.replace("bg-tertiary-fixed", "bg-background");
            }
        });
    }

    document.querySelectorAll("[data-slideshow]").forEach(initSlideshow);
    initGallery();
});

/* ==========================================================================
   Slideshow crossfade
   Gambar berikutnya sudah ada di layer belakang; layer depan memudar perlahan.
   ========================================================================== */
function preload(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

async function initSlideshow(el) {
    const entries = SLIDESHOW_PHOTOS[el.dataset.slideshow] || [];
    const loaded = await Promise.all(entries.map((e) => preload(e.src)));
    entries.forEach((e, i) => { if (!loaded[i]) console.warn("[slideshow] gambar tidak ditemukan:", e.src); });
    const photos = entries.filter((_, i) => loaded[i]);
    if (!photos.length) return;

    const fadeTransition = `opacity ${SLIDESHOW_FADE}ms ease-in-out`;

    const layerClass = el.dataset.layerClass || "";
    const makeLayer = () => {
        const d = document.createElement("div");
        d.className = layerClass;
        d.style.cssText = "position:absolute;inset:0;background-size:cover;background-repeat:no-repeat;opacity:1;will-change:opacity;transition:" + fadeTransition;
        el.appendChild(d);
        return d;
    };

    let top = makeLayer();
    let bottom = makeLayer();
    top.style.zIndex = 2;
    bottom.style.zIndex = 1;
    const paint = (layer, p) => {
        layer.style.backgroundImage = `url("${p.src}")`;
        layer.style.backgroundPosition = p.pos || "center";
    };
    paint(top, photos[0]);

    if (photos.length < 2) return;

    // Indikator titik
    const dots = document.createElement("div");
    dots.style.cssText = "position:absolute;left:50%;bottom:12px;transform:translateX(-50%);z-index:5;display:flex;gap:6px;padding:6px 10px;background:#f9f9f9;border:1px solid #1a1c1c;border-radius:9999px;";
    dots.setAttribute("aria-hidden", "true");
    photos.forEach(() => {
        const dot = document.createElement("span");
        dot.style.cssText = "height:8px;border-radius:9999px;border:1px solid #1a1c1c;transition:width .4s ease,background-color .4s ease;";
        dots.appendChild(dot);
    });
    el.appendChild(dots);
    const setDot = (i) => [...dots.children].forEach((d, n) => {
        d.style.width = n === i ? "22px" : "8px";
        d.style.backgroundColor = n === i ? "#ffb800" : "transparent";
    });
    setDot(0);

    let index = 0;
    const step = () => {
        index = (index + 1) % photos.length;
        paint(bottom, photos[index]); // muncul di belakang
        top.style.opacity = "0";                                    // layer depan menghilang
        setDot(index);

        setTimeout(() => {
            // Tukar urutan layer tanpa terlihat (layer belakang menutup penuh)
            top.style.transition = "none";
            top.style.opacity = "1";
            top.style.zIndex = 1;
            bottom.style.zIndex = 2;
            void top.offsetWidth;
            top.style.transition = fadeTransition;
            [top, bottom] = [bottom, top];
            setTimeout(step, SLIDESHOW_INTERVAL);
        }, SLIDESHOW_FADE + 50);
    };
    setTimeout(step, SLIDESHOW_INTERVAL);
}

/* ==========================================================================
   Gallery modal (Table Of Content)
   ========================================================================== */
function placeholderSVG(label, kind) {
    const icon = kind === "video" ? "▶" : "✦";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
<rect width="1280" height="720" fill="#ffb800"/>
<rect x="40" y="40" width="1200" height="640" rx="40" fill="#f9f9f9" stroke="#1a1c1c" stroke-width="6"/>
<text x="640" y="350" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="150" fill="#1a1c1c">${icon}</text>
<text x="640" y="450" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="54" fill="#1a1c1c">${label}</text>
<text x="640" y="510" text-anchor="middle" font-family="Manrope, sans-serif" font-size="28" fill="#5f5e5e">File belum ditemukan - ganti di GALLERIES (script.js)</text>
</svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const GALLERY_CSS = `
.gx-modal{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .25s ease}
.gx-modal.is-flex{display:flex}
.gx-modal.is-open{opacity:1}
.gx-backdrop{position:absolute;inset:0;background:rgba(26,28,28,.88);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.gx-panel{position:relative;width:100%;max-width:960px;max-height:100%;display:flex;flex-direction:column;align-items:center;gap:16px;transform:translateY(24px) scale(.97);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.gx-modal.is-open .gx-panel{transform:none}
.gx-top{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px}
.gx-title{min-width:0;margin:0;background:#ffb800;border:2px solid #1a1c1c;border-radius:9999px;padding:8px 20px;box-shadow:4px 4px 0 #1a1c1c;font:400 28px/1 Anton,sans-serif;letter-spacing:.01em;text-transform:uppercase;color:#1a1c1c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gx-btn{flex:none;width:44px;height:44px;padding:0;border-radius:9999px;border:2px solid #1a1c1c;background:#ffb800;color:#1a1c1c;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:3px 3px 0 #1a1c1c;transition:background-color .2s,color .2s}
.gx-btn:hover{background:#f9f9f9}
.gx-btn.gx-close{background:#f9f9f9}
.gx-btn.gx-close:hover{background:#1a1c1c;color:#f9f9f9}
.gx-btn:focus-visible{outline:3px solid #f9f9f9;outline-offset:3px}
.gx-row{width:100%;display:flex;align-items:center;gap:12px}
.gx-stage{flex:1;min-width:0;height:min(68vh,680px);padding:0 10px 10px 0;box-sizing:border-box;display:flex;align-items:center;justify-content:center}
.gx-media{display:block;box-sizing:border-box;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;border:2px solid #1a1c1c;border-radius:24px;box-shadow:8px 8px 0 #ffb800;animation:gxIn .35s ease both}
.gx-embed{width:100%;height:auto;aspect-ratio:16/9;background:#1a1c1c}
.gx-foot{display:flex;align-items:center;gap:12px;max-width:100%}
.gx-caption{min-width:0;margin:0;background:#f9f9f9;border:2px solid #1a1c1c;border-radius:9999px;padding:4px 16px;font:700 14px/18px "Space Grotesk",sans-serif;color:#1a1c1c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gx-count{flex:none;background:#ffb800;border:2px solid #1a1c1c;border-radius:9999px;padding:4px 12px;font:700 14px/18px "Space Grotesk",sans-serif;color:#1a1c1c}
@keyframes gxIn{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:none}}
@media (max-width:640px){.gx-title{font-size:22px;padding:6px 16px}.gx-btn{width:40px;height:40px}.gx-row{gap:6px}.gx-stage{height:62vh}}
@media (prefers-reduced-motion:reduce){.gx-modal,.gx-panel{transition:none}.gx-media{animation:none}}
`;

function initGallery() {
    console.info("[gallery] v3 - preview satu per satu, tanpa thumbnail");
    const triggers = document.querySelectorAll("[data-gallery]");
    if (!triggers.length) return;

    // Modal dibangun di sini (tidak bergantung pada markup lama di index.html / style.css)
    document.getElementById("galleryModal")?.remove();
    const styleEl = document.createElement("style");
    styleEl.textContent = GALLERY_CSS;
    document.head.appendChild(styleEl);

    const modal = document.createElement("div");
    modal.className = "gx-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "gxTitle");
    modal.innerHTML = `
        <div class="gx-backdrop" data-close></div>
        <div class="gx-panel">
            <div class="gx-top">
                <h3 class="gx-title" id="gxTitle"></h3>
                <button type="button" class="gx-btn gx-close" data-close aria-label="Tutup galeri">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="gx-row">
                <button type="button" class="gx-btn" data-prev aria-label="Sebelumnya">
                    <span class="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <div class="gx-stage"></div>
                <button type="button" class="gx-btn" data-next aria-label="Berikutnya">
                    <span class="material-symbols-outlined">arrow_forward_ios</span>
                </button>
            </div>
            <div class="gx-foot">
                <p class="gx-caption"></p>
                <span class="gx-count"></span>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const q = (sel) => modal.querySelector(sel);
    const stage = q(".gx-stage");
    const prevBtn = q("[data-prev]");
    const nextBtn = q("[data-next]");

    let current = null;
    let index = 0;
    let lastTrigger = null;
    let closeTimer = null;

    function renderStage(item) {
        stage.replaceChildren(); // juga menghentikan video sebelumnya
        let node;

        if (item.type === "video") {
            node = document.createElement("video");
            node.className = "gx-media";
            node.controls = true;
            node.playsInline = true;
            node.preload = "metadata";
            if (item.poster) node.poster = item.poster;
            node.src = item.src;
            node.addEventListener("error", () => {
                const img = document.createElement("img");
                img.className = "gx-media";
                img.alt = item.title;
                img.src = placeholderSVG(item.title, "video");
                node.replaceWith(img);
            }, { once: true });
        } else if (item.type === "embed") {
            node = document.createElement("iframe");
            node.className = "gx-media gx-embed";
            node.src = item.src;
            node.title = item.title;
            node.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen";
            node.allowFullscreen = true;
        } else {
            node = document.createElement("img");
            node.className = "gx-media";
            node.alt = item.title;
            node.src = item.src;
            node.addEventListener("error", () => { node.src = placeholderSVG(item.title, "image"); }, { once: true });
        }
        stage.appendChild(node);
    }

    function show(i) {
        const items = current.items;
        index = (i + items.length) % items.length;
        const item = items[index];
        renderStage(item);
        q(".gx-caption").textContent = item.title;
        q(".gx-count").textContent = `${index + 1} / ${items.length}`;
        const multi = items.length > 1;
        prevBtn.style.display = nextBtn.style.display = multi ? "" : "none";
    }

    function open(key, trigger) {
        const data = GALLERIES[key];
        if (!data || !data.items.length) return;
        current = data;
        lastTrigger = trigger || null;
        clearTimeout(closeTimer);

        q(".gx-title").textContent = data.title;
        show(0);

        modal.classList.add("is-flex");
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => {
            modal.classList.add("is-open");
            q(".gx-close").focus();
        });
    }

    function close() {
        if (!modal.classList.contains("is-open")) return;
        modal.classList.remove("is-open");
        closeTimer = setTimeout(() => {
            modal.classList.remove("is-flex");
            stage.replaceChildren(); // hentikan video
            document.body.style.overflow = "";
            if (lastTrigger) lastTrigger.focus();
        }, 280);
    }

    triggers.forEach((card) => card.addEventListener("click", () => open(card.dataset.gallery, card)));
    modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close));
    prevBtn.addEventListener("click", () => show(index - 1));
    nextBtn.addEventListener("click", () => show(index + 1));

    // Keyboard: Esc, panah kiri/kanan, Tab tetap di dalam modal
    document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("is-open")) return;
        if (e.key === "Escape") return close();
        if (e.key === "ArrowLeft" && e.target.tagName !== "VIDEO") return show(index - 1);
        if (e.key === "ArrowRight" && e.target.tagName !== "VIDEO") return show(index + 1);
        if (e.key === "Tab") {
            const f = [...modal.querySelectorAll("button, video, iframe")].filter((n) => n.offsetParent !== null);
            if (!f.length) return;
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    // Geser di layar sentuh
    let touchX = null;
    stage.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
        touchX = null;
    });
}