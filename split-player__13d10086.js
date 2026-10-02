/* Official YouTube IFrame API. Never extracts streams or bypasses embed restrictions. */
(() => {
  'use strict';
  let apiPromise;
  function loadAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) { script.remove(); reject(error); }
        else resolve(window.YT);
      };
      const timer = setTimeout(() => finish(new Error('Không tải được YouTube Player API trong 15 giây. Kiểm tra mạng hoặc bộ chặn nội dung rồi thử lại.')), 15000);
      window.onYouTubeIframeAPIReady = () => finish();
      script.src = 'https://www.youtube.com/iframe_api';
      script.referrerPolicy = 'strict-origin-when-cross-origin';
      script.onerror = () => finish(new Error('Không tải được YouTube Player API. Kiểm tra mạng hoặc bộ chặn nội dung.'));
      document.head.appendChild(script);
    }).catch(error => { apiPromise = null; throw error; });
    return apiPromise;
  }
  const errors = {
    2: 'Video ID hoặc tham số phát không hợp lệ. Hãy kiểm tra liên kết.',
    5: 'YouTube không phát được video bằng HTML5 trong trình duyệt này. Thử lại hoặc mở YouTube gốc.',
    100: 'Video không tồn tại, đã bị xóa hoặc chuyển sang riêng tư.',
    101: 'Chủ sở hữu không cho phép nhúng video này. VELORA không thể phát video tại đây. Hãy mở YouTube gốc.',
    150: 'Chủ sở hữu không cho phép nhúng video này. VELORA không thể phát video tại đây. Hãy mở YouTube gốc.',
    153: 'YouTube thiếu HTTP Referer hoặc nhận dạng ứng dụng. Mở trang qua HTTPS; nếu vẫn lỗi trong APTV, thử Safari hoặc YouTube gốc. Website không thể ép WebView gửi Referer.'
  };
  window.CarTubePlayer = class {
    constructor(stage, notice, playButton) {
      this.stage = stage;
      this.notice = notice;
      this.playButton = playButton;
      this.generation = 0;
      playButton.addEventListener('click', () => {
        if (!this.player || this.failed) return;
        this.message('Đang yêu cầu phát… Nếu chưa phát, chạm nút ▶ ngay trong khung YouTube.');
        this.watchdog(this.generation);
        try { this.player.playVideo(); } catch (_) { this.message('Chạm nút ▶ trong khung YouTube hoặc chọn Thử lại.', true); }
      });
    }
    message(text, error = false) {
      this.notice.textContent = text;
      this.notice.classList.toggle('error', error);
    }
    watchdog(token) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (token !== this.generation || this.failed) return;
        this.message('Chưa nhận được tín hiệu phát sau 15 giây. Có thể do mạng hoặc WebView chặn playback. Chạm ▶ trong khung, chọn Thử lại hoặc YouTube gốc.', true);
      }, 15000);
    }
    close() {
      ++this.generation;
      clearTimeout(this.timer);
      if (this.player) { try { this.player.destroy(); } catch (_) {} }
      this.player = null;
      this.stage.replaceChildren();
      this.stage.hidden = false;
      this.playButton.hidden = true;
    }
    snapshot() {
      try {return {time:Math.max(0,this.player?.getCurrentTime?.()||0),state:this.player?.getPlayerState?.()??-1};} catch (_) {return {time:0,state:-1};}
    }
    async open(id, options = {}) {
      this.close();
      const token = this.generation;
      this.failed = false;
      this.message('Đang tải trình phát YouTube…');
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
        this.message(errors[2] + ' (Mã 2)', true); return;
      }
      if (!/^https?:$/.test(location.protocol)) {
        this.message('Hãy mở VELORA qua địa chỉ HTTPS của hosting, không mở file trực tiếp.', true); return;
      }
      try {
        const YT = await loadAPI();
        if (token !== this.generation) return;
        const iframe = document.createElement('iframe');
        iframe.id = 'ytFrame';
        iframe.title = 'YouTube player';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        // Set policy before navigation. origin does not substitute for HTTP Referer.
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        const params = new URLSearchParams({enablejsapi:'1', origin:location.origin, playsinline:'1', autoplay:options.autoplay===false?'0':'1', start:String(Math.max(0,Math.floor(Number(options.time)||0))), controls:'1', fs:'1', rel:'0'});
        iframe.src = `https://www.youtube.com/embed/${id}?${params}`;
        this.stage.appendChild(iframe);
        const active = () => token === this.generation && !this.failed;
        this.watchdog(token);
        this.player = new YT.Player(iframe, {events: {
          onReady: () => {
            if (!active()) return;
            this.playButton.hidden = false;
            this.message('Trình phát sẵn sàng. Nếu chưa phát, chạm ▶ trong khung YouTube hoặc nút Phát.');
          },
          onStateChange: event => {
            if (!active()) return;
            window.dispatchEvent(new CustomEvent('velora-youtube-state',{detail:event.data}));
            if (event.data === 1 || event.data === 2 || event.data === 0) {
              clearTimeout(this.timer);
              this.message(event.data === 1 ? '' : event.data === 2 ? 'Đã tạm dừng. Chạm ▶ để tiếp tục.' : 'Video đã kết thúc.');
            } else if (event.data === 3) {
              this.message('Đang tải video…'); this.watchdog(token);
            }
          },
          onAutoplayBlocked: () => {
            if (!active()) return;
            clearTimeout(this.timer);
            this.playButton.hidden = false;
            this.message('Trình duyệt chặn tự phát. Chạm ▶ ngay trong khung YouTube hoặc nút Phát. Nếu vẫn bị chặn, chọn YouTube gốc.', true);
          },
          onError: event => {
            if (!active()) return;
            this.failed = true;
            clearTimeout(this.timer);
            this.stage.hidden = true;
            this.playButton.hidden = true;
            this.message((errors[event.data] || 'YouTube không thể phát video trong trình duyệt này. Thử lại hoặc mở YouTube gốc.') + ` (Mã ${event.data})`, true);
          }
        }});
      } catch (error) {
        if (token !== this.generation) return;
        clearTimeout(this.timer);
        this.message(error.message || 'Không tạo được trình phát. Thử lại hoặc mở YouTube gốc.', true);
      }
    }
  };
})();
