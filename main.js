/**
 * 張哲銘 Chang Che-Ming — 個人網站互動腳本
 *
 * 只做一件事：文件／影片／圖片彈窗。
 * 觸發元素：.open-modal，搭配 data-pdf 或 data-src，data-type = pdf | video | image
 */

function initModal() {
  const modal = document.getElementById("media-modal");
  if (!modal) return;

  const frame = document.getElementById("modal-frame");
  const image = document.getElementById("modal-img");
  const external = document.getElementById("modal-external");
  const closeBtn = modal.querySelector(".modal-close");
  let lastTrigger = null;

  // YouTube 嵌入網址轉成可在新分頁開啟的一般網址
  const toExternalUrl = (url) => {
    const list = url.match(/list=([\w-]+)/);
    if (list) return `https://www.youtube.com/playlist?list=${list[1]}`;
    const video = url.match(/youtube\.com\/embed\/([\w-]+)/);
    if (video && video[1] !== "videoseries") return `https://youtu.be/${video[1]}`;
    return url;
  };

  const open = (url, type, trigger) => {
    lastTrigger = trigger;
    const isImage = type === "image";
    external.href = toExternalUrl(url);
    frame.hidden = isImage;
    image.hidden = !isImage;
    if (isImage) image.src = url;
    else frame.src = url;
    document.body.style.overflow = "hidden";
    modal.classList.add("active");
    closeBtn.focus();
  };

  const close = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    frame.src = "about:blank";
    image.removeAttribute("src");
    external.href = "#";
    if (lastTrigger) lastTrigger.focus();
  };

  document.querySelectorAll(".open-modal").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const pdf = trigger.dataset.pdf;
      const url = trigger.dataset.src || pdf;
      if (url) open(url, trigger.dataset.type || (pdf ? "pdf" : "video"), trigger);
    });
  });

  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("active")) close();
  });
}

initModal();
