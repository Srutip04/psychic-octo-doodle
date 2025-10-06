const ASSETS = {
  blue: "./assets/Blue umbrella.png",
  pink: "./assets/Pink umbrella.png",
  yellow: "./assets/Yellow umbrella.png",
};

const THEME_CLASS = {
  blue: "theme-blue",
  pink: "theme-pink",
  yellow: "theme-yellow",
};

const umbrellaImg = document.getElementById("umbrellaImg");
const logoZone = document.getElementById("logoZone");
const logoImg = document.getElementById("logoImg");
const uploadBtn = document.getElementById("uploadBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const fileInput = document.getElementById("fileInput");
const swatches = Array.from(document.querySelectorAll(".swatch"));
const loader = document.getElementById("loader");
const spinnerCss = document.getElementById("spinnerCss");
const canvasEl = document.getElementById("canvas");

function showLoader() {
  const accent = getComputedStyle(document.body)
    .getPropertyValue("--accent")
    .trim();
  loader.querySelector("svg").style.stroke = accent;
  loader.style.display = "flex";
  loader.hidden = false;
}
function hideLoader() {
  loader.hidden = true;
  loader.style.display = "none";
}

function syncSpinnerColor() {
  const accent = getComputedStyle(document.body)
    .getPropertyValue("--accent")
    .trim();
  spinnerCss.style.borderTopColor = accent;
}


swatches.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.getAttribute("aria-pressed") === "true") return; 
    swatches.forEach((s) => s.setAttribute("aria-pressed", String(s === btn)));
    showLoader();
    setTimeout(() => {
      const color = btn.dataset.color;
      umbrellaImg.src = ASSETS[color];
      document.body.classList.remove(
        "theme-blue",
        "theme-pink",
        "theme-yellow"
      );
      document.body.classList.add(THEME_CLASS[color]);
      setTimeout(() => {
        hideLoader();
      }, 700);
    }, 100);
  });
});

uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  if (!/image\/(png|jpe?g)/i.test(file.type) || file.size > 5 * 1024 * 1024) {
    alert("Upload a .png or .jpg image under 5MB.");
    fileInput.value = "";
    return;
  }
  showLoader();
  const reader = new FileReader();
  reader.onload = (e) => {
    setTimeout(() => {
      logoImg.src = e.target.result;
      logoImg.hidden = false;
      logoZone.classList.add("has-logo");
      hideLoader();
    }, 800);
  };
  reader.readAsDataURL(file);
});


clearBtn.addEventListener("click", () => {
  logoImg.hidden = true;
  logoImg.removeAttribute("src");
  logoZone.classList.remove("has-logo");
  fileInput.value = "";
});

let dragging = false,
  startX = 0,
  startY = 0,
  startLeft = 0,
  startTop = 0;
logoZone.addEventListener("pointerdown", (e) => {
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
  const rect = logoZone.getBoundingClientRect();
  const parent = canvasEl.getBoundingClientRect();
  startLeft = rect.left - parent.left;
  startTop = rect.top - parent.top;
  logoZone.setPointerCapture(e.pointerId);
});
logoZone.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  const parent = canvasEl.getBoundingClientRect();
  const rect = logoZone.getBoundingClientRect();

  let nextLeft = startLeft + dx;
  let nextTop = startTop + dy;

  nextLeft = Math.max(0, Math.min(nextLeft, parent.width - rect.width));
  nextTop = Math.max(0, Math.min(nextTop, parent.height - rect.height));

  logoZone.style.left = nextLeft + "px";
  logoZone.style.top = nextTop + "px";
  logoZone.style.bottom = "auto";
});
const stopDrag = (e) => {
  dragging = false;
  try {
    logoZone.releasePointerCapture(e.pointerId);
  } catch (_) {}
};
logoZone.addEventListener("pointerup", stopDrag);
logoZone.addEventListener("pointercancel", stopDrag);

document.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  const idx = swatches.findIndex(
    (b) => b.getAttribute("aria-pressed") === "true"
  );
  const next =
    e.key === "ArrowRight"
      ? (idx + 1) % swatches.length
      : (idx - 1 + swatches.length) % swatches.length;
  swatches[next].click();
});


downloadBtn.addEventListener("click", async () => {
  
  const umbrella = await loadImg(umbrellaImg.src);
  const scale = 1000 / umbrella.width; 
  const W = Math.round(umbrella.width * scale);
  const H = Math.round(umbrella.height * scale);

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");

  ctx.drawImage(umbrella, 0, 0, W, H);

  if (!logoImg.hidden && logoImg.src) {
    const logo = await loadImg(logoImg.src);
    const domUmb = umbrellaImg.getBoundingClientRect();
    const domCanvas = canvasEl.getBoundingClientRect();
    const domZone = logoZone.getBoundingClientRect();

    const relLeft = (domZone.left - domUmb.left) / domUmb.width;
    const relTop = (domZone.top - domUmb.top) / domUmb.height;
    const relW = domZone.width / domUmb.width;
    const relH = domZone.height / domUmb.height;

    ctx.drawImage(logo, relLeft * W, relTop * H, relW * W, relH * H);
  }

  const link = document.createElement("a");
  link.href = c.toDataURL("image/png");
  link.download = "umbrella-preview.png";
  link.click();
});

function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

showLoader();
window.addEventListener("load", () => setTimeout(hideLoader, 700));

