<template>
  <footer class="footer">
    <p>
      A postagem automática será enviada por um backend em Go + API do TikTok.
      Esta tela já define a ordem, o formato 9:16 e os horários da fila.
    </p>
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
</style>
