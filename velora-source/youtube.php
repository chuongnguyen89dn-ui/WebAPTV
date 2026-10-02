<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <link rel="icon" href="favicon.ico?v=1.4.1" sizes="any">
  <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png?v=1.4.1">
  <meta name="apple-mobile-web-app-title" content="VELORA">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="theme-color" content="#0b0f16">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>VELORA CarTube</title>
  <link rel="stylesheet" href="assets/app.css?v=1.3.0">
<link rel="stylesheet" href="assets/site-system.css?v=2.30.0"></head>
<body>
  <div id="app" class="app-shell">
    <header class="topbar">
      <button class="brand" id="homeBtn" aria-label="Trang chủ">
        <span class="brand-mark">▶</span>
        <span class="brand-text">VELORA <b>CarTube</b></span>
      </button>
      <form id="searchForm" class="searchbar" autocomplete="off">
        <input id="searchInput" type="search" inputmode="search" placeholder="Tìm YouTube hoặc dán liên kết…" aria-label="Tìm YouTube">
        <button type="submit" class="search-btn">Tìm</button>
      </form>
      <button id="fitBtn" class="fit-btn" type="button" title="Đổi kích thước giao diện">Fit 90%</button>
    </header>

    <main class="main">
      <aside class="sidebar" aria-label="Điều hướng">
        <a class="nav-item" href="index.php" style="text-decoration:none"><span>▦</span><small>Dashboard</small></a>
        <button class="nav-item active" data-view="home"><span>⌂</span><small>Trang chủ</small></button>
        <button class="nav-item" data-query="Nhạc Nhật mới"><span>♫</span><small>Nhạc</small></button>
        <button class="nav-item" data-query="Tin tức Nhật Bản trực tiếp"><span>◉</span><small>Tin tức</small></button>
        <button class="nav-item" data-query="Thiếu nhi tiếng Việt"><span>★</span><small>Thiếu nhi</small></button>
        <button class="nav-item" data-query="Du lịch Nhật Bản"><span>⌖</span><small>Du lịch</small></button>
        <button class="nav-item" id="historyBtn"><span>↺</span><small>Đã xem</small></button>
      </aside>

      <section class="content">
        <section id="hero" class="hero">
          <div>
            <p class="eyebrow">TỐI ƯU CHO APTV / CARPLAY</p>
            <h1>YouTube vừa màn hình, không cần pinch-zoom.</h1>
            <p class="hero-copy">Dán liên kết để mở video YouTube. Video phải cho phép nhúng; trình duyệt có thể yêu cầu chạm nút phát.</p>
          </div>
          <div class="quick-play">
            <input id="urlInput" type="url" placeholder="https://youtube.com/watch?v=…">
            <button id="playUrlBtn" type="button">Phát video</button>
          </div>
        </section>

        <section id="statusBar" class="status-bar" hidden></section>
        <section id="results" class="video-grid" aria-live="polite"></section>
      </section>
    </main>
  </div>

  <div id="playerModal" class="player-modal" role="dialog" aria-modal="true" aria-labelledby="playerTitle" hidden>
    <div class="player-panel">
      <div class="player-head">
        <div class="player-title-wrap">
          <strong id="playerTitle">YouTube</strong>
          <span id="playerChannel"></span>
        </div>
        <div class="player-actions">
          <button id="openYoutubeBtn" type="button">YouTube gốc</button>
          <button id="closePlayerBtn" type="button" class="close-btn" aria-label="Đóng trình phát">✕</button>
        </div>
      </div>
      <div id="playerStage" class="player-stage"></div>
      <div class="player-feedback">
        <p id="playerHint" class="player-hint" role="status" aria-live="polite">Đang tải trình phát…</p>
        <div class="player-actions">
          <button id="manualPlayBtn" type="button" hidden>▶ Phát</button>
          <button id="retryPlayerBtn" type="button">Thử lại</button>
          <button id="playerFitBtn" type="button">Fit 90%</button>
        </div>
      </div>
    </div>
  </div>

  <template id="cardTemplate">
    <article class="video-card">
      <button class="thumb-btn" type="button">
        <img class="thumb" alt="">
        <span class="duration"></span>
        <span class="live-badge" hidden>LIVE</span>
      </button>
      <div class="meta">
        <h3 class="title"></h3>
        <p class="channel"></p>
      </div>
    </article>
  </template>

  <script>
    window.CARTUBE_CONFIG = {
      appName: "VELORA CarTube",
      hasApiKey: true    };
  </script>
  <script src="assets/player.js?v=1.3.0"></script>
  <script src="assets/app.js?v=1.3.0"></script>
<script src="assets/site-system.js?v=2.30.0"></script></body>
</html>
