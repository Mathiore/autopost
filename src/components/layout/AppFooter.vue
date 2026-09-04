<template>
  <footer class="footer">
    <p>
      A postagem automática será enviada por um backend em Go + API do TikTok.
      Esta tela já define a ordem, o formato 9:16 e os horários da fila.
    </p>
    <nav class="footer__legal" aria-label="Documentos legais">
      <RouterLink to="/privacy">Privacy Policy</RouterLink>
      <RouterLink to="/terms">Terms of Service</RouterLink>
    </nav>
  </footer>
</template>

<style scoped>
.footer {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto 28px;
  color: var(--text-dim);
  font-size: 13px;
}

.footer p {
  margin: 0;
}

.footer__legal {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 14px;
}

.footer__legal a {
  color: var(--text-soft);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.footer__legal a.router-link-exact-active {
  color: var(--cyan);
}
</style>
