<template>
  <header class="header">
    <div class="header__inner">
      <div class="brand">
        <span class="brand__mark" aria-hidden="true">
          <span class="brand__dot brand__dot--red"></span>
          <span class="brand__dot brand__dot--cyan"></span>
        </span>
        <div>
          <strong>AutoTok</strong>
          <p>Cortes verticais e fila de postagem</p>
        </div>
      </div>

      <div class="header__meta">
        <span class="chip">Interface</span>
        <span class="chip">TikTok 9:16</span>
        <span class="chip">1:01 — 1:05</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: var(--header-h);
  border-bottom: 1px solid var(--line);
  background: rgba(11, 11, 15, 0.82);
  backdrop-filter: blur(16px);
}

.header__inner {
  width: min(1280px, calc(100% - 40px));
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand strong {
  display: block;
  font-family: var(--font-display);
  font-size: 18px;
}

.brand p {
  margin: 2px 0 0;
  color: var(--text-dim);
  font-size: 12px;
}

.brand__mark {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #1a1a22;
  border: 1px solid var(--line-strong);
}

.brand__dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.brand__dot--red {
  top: 8px;
  left: 9px;
  background: var(--accent);
}

.brand__dot--cyan {
  right: 8px;
  bottom: 8px;
  background: var(--cyan);
}

.header__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 720px) {
  .header__meta {
    display: none;
  }
}
</style>
