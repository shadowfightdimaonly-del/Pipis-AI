(() => {
  'use strict';
  const norm = s => String(s || '').replace(/\\\\/g, '/').replace(/^\\/+/, '').replace(/\\/+/g, '/');
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(bytes) { let c = 0xffffffff; for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  const u16 = (v, o, n) => { v[o] = n & 255; v[o + 1] = n >>> 8 & 255; };
  const u32 = (v, o, n) => { u16(v, o, n); u16(v, o + 2, n >>> 16); };
  function zip(files) {
    const enc = new TextEncoder(), locals = [], centrals = []; let offset = 0;
    for (const f of files) {
      const name = enc.encode(f.name), data = f.data, crc = crc32(data);
      const h = new Uint8Array(30 + name.length + data.length);
      u32(h, 0, 0x04034b50); u16(h, 4, 20); u16(h, 6, 0x0800); u16(h, 8, 0);
      u32(h, 14, crc); u32(h, 18, data.length); u32(h, 22, data.length);
      u16(h, 26, name.length); h.set(name, 30); h.set(data, 30 + name.length); locals.push(h);
      const c = new Uint8Array(46 + name.length);
      u32(c, 0, 0x02014b50); u16(c, 4, 20); u16(c, 6, 20); u16(c, 8, 0x0800);
      u32(c, 16, crc); u32(c, 20, data.length); u32(c, 24, data.length);
      u16(c, 28, name.length); u32(c, 42, offset); c.set(name, 46); centrals.push(c);
      offset += h.length;
    }
    const centralSize = centrals.reduce((n, x) => n + x.length, 0), end = new Uint8Array(22);
    u32(end, 0, 0x06054b50); u16(end, 8, files.length); u16(end, 10, files.length);
    u32(end, 12, centralSize); u32(end, 16, offset);
    return new Blob([...locals, ...centrals, end], { type: 'application/zip' });
  }
  function collect(msg) {
    const files = [];
    msg.querySelectorAll('.code').forEach(block => {
      const label = block.querySelector('.fname')?.textContent.trim();
      const code = block.querySelector('pre code')?.textContent;
      if (!label || code == null) return;
      const path = norm(label);
      if (/^(BP|BehaviorPack|behavior_pack|behavior-pack|RP|ResourcePack|resource_pack|resource-pack)\\//i.test(path))
        files.push({ name: path, text: code });
    });
    return files;
  }
  function validate(files) {
    const roots = [
      { re: /^(BP|BehaviorPack|behavior_pack|behavior-pack)\\//i, label: 'Behavior Pack' },
      { re: /^(RP|ResourcePack|resource_pack|resource-pack)\\//i, label: 'Resource Pack' }
    ];
    const found = roots.map(root => {
      const pack = files.filter(f => root.re.test(f.name));
      const manifest = pack.find(f => /\\/manifest\\.json$/i.test(f.name));
      if (!pack.length) return { label: root.label, error: 'Не найден' };
      if (!manifest) return { label: root.label, error: 'Нет manifest.json' };
      try {
        const m = JSON.parse(manifest.text);
        if (!m.header?.uuid || !m.header?.version || !Array.isArray(m.modules) || !m.modules.length)
          return { label: root.label, error: 'В manifest.json отсутствуют обязательные поля header/modules' };
      } catch (e) { return { label: root.label, error: 'Ошибка JSON в manifest.json: ' + e.message }; }
      return { label: root.label, ok: true };
    });
    return found;
  }
  async function build(button, msg) {
    const files = collect(msg);
    const checks = validate(files);
    const errors = checks.filter(x => !x.ok);
    if (errors.length) { alert('Не удалось собрать аддон:\n' + errors.map(x => x.label + ': ' + x.error).join('\n')); return; }
    button.disabled = true; button.textContent = 'Собираю…';
    try {
      const packed = [];
      for (const f of files) packed.push({ name: f.name, data: new TextEncoder().encode(f.text) });
      const blob = zip(packed), b64 = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob);
      });
      if (typeof window.exportFile === 'function') await window.exportFile('PipisAddon.mcaddon', 'application/zip', b64);
      else {
        const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'PipisAddon.mcaddon'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
      button.textContent = 'Готово ✓';
    } catch (e) { console.error(e); alert('Ошибка сборки: ' + (e.message || e)); button.textContent = 'Собрать .mcaddon'; }
    finally { button.disabled = false; }
  }
  function attach(root) {
    root.querySelectorAll('.msg.bot').forEach(msg => {
      if (msg.dataset.mcaddonBuilder) return;
      const files = collect(msg);
      if (!files.length) return;
      msg.dataset.mcaddonBuilder = '1';
      const row = document.createElement('div'); row.className = 'bot-tools';
      const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = '📦 Собрать .mcaddon';
      btn.addEventListener('click', () => build(btn, msg)); row.append(btn);
      (msg.querySelector('.content') || msg).append(row);
    });
  }
  const start = () => {
    const chat = document.getElementById('chat');
    if (!chat) return;
    attach(chat);
    new MutationObserver(() => attach(chat)).observe(chat, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();