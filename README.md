# Emotion Studio

Интерактивная лаборатория анимированных аватаров для персональных ИИ-агентов. Она объединяет редактор внешнего вида, 39 эмоций и рабочих состояний, сохранение пресетов и готовый способ внедрения через `embed.js`.

## Возможности

- 18 форм головы: от `blob` и `bean` до `cloud`, `teardrop` и `leaf`;
- 11 цветовых тем с контрастным цветом глаз;
- 39 состояний: эмоции, жизненный цикл, спецэффекты и действия;
- поиск и фильтры по библиотеке состояний;
- сохранение собственных аватаров в `localStorage`;
- автоцикл и ручной перезапуск одноразовых эффектов;
- автономный embed-режим без зависимости от стека основного приложения;
- готовые методы `setState`, `setShape`, `setColor`, `update` и `destroy`.

## Локальный запуск

Проект не требует сборки или установки зависимостей.

```bash
python3 -m http.server 8765
```

После этого откройте `http://127.0.0.1:8765/`.

## Внедрение в ИИ-агента

```html
<div id="agent-avatar" style="width:280px;height:280px"></div>
<script src="https://YOUR-DEPLOYMENT.vercel.app/embed.js"></script>
<script>
  const avatar = GrokEmotion.mount("#agent-avatar", {
    state: "idle",
    shape: "teardrop",
    color: "#08a96f",
    eyes: "#08110d",
    size: 280
  });

  avatar.setState("thinking");
</script>
```

### Связь с событиями агента

```js
agent.on("thinking", () => avatar.setState("thinking"));
agent.on("tool:start", () => avatar.setState("working"));
agent.on("response:stream", () => avatar.setState("writing"));
agent.on("done", () => avatar.setState("happy"));
agent.on("error", () => avatar.setState("alerting"));
```

### API контроллера

```js
avatar.setState("happy");
avatar.setShape("cloud");
avatar.setColor("#dc3188", "#16040d");
avatar.update({ state: "working", shape: "hex", size: 240 });
avatar.replay();
avatar.destroy();
```

`GrokEmotion.states` и `GrokEmotion.shapes` содержат полный список поддерживаемых значений.

## Как работает embed

`embed.js` создаёт изолированный iframe с прозрачным фоном и управляет им через `postMessage`. Поэтому движок анимации не конфликтует с React, Vue, Next.js, CSS и зависимостями приложения агента.

Прямой URL embed-режима:

```text
/?embed=1&state=thinking&shape=cloud&color=%2308a96f&eyes=%2308110d&size=280
```

## Структура

- `index.html` — Emotion Studio и автономный движок;
- `embed.js` — лёгкий адаптер для внедрения;
- `src/shapes-module.js` — аннотированные формы и выражения;
- `src/grokbot-module.js` — аннотированный движок состояний;
- `vercel.json` — настройки статического деплоя.

## Авторство и ограничения

Проект основан на техническом воспроизведении Grok Bot icon из `x.ai/bot`. Графика и исходная анимационная система принадлежат xAI. Сохранена исходная лицензия репозитория; перед публичным или коммерческим использованием проверьте права и при необходимости замените фирменную графику собственной.
