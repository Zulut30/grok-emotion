# Emotion Studio

Интерактивная лаборатория анимированных аватаров для персональных ИИ-агентов. Она объединяет редактор внешнего вида, 39 эмоций и рабочих состояний, 18 форм, палитру и готовый браузерный API для внедрения в чат.

- [Открыть Emotion Studio](https://grok-emotion.vercel.app)
- [Открыть готовый пример чата с настройками](https://grok-emotion.vercel.app/examples/chat)
- [Полное руководство по API и интеграции](./docs/INTEGRATION.md)
- [Практическая интеграция в чат/ИИ-агента](./docs/CHAT-INTEGRATION.md)
- [Машиночитаемый manifest](https://grok-emotion.vercel.app/manifest.json)

## Возможности

- 18 форм головы: от `blob` и `bean` до `cloud`, `teardrop` и `leaf`;
- 11 цветовых тем с контрастным цветом глаз;
- 39 состояний: эмоции, жизненный цикл, спецэффекты и действия;
- поиск и фильтры по библиотеке состояний;
- сохранение собственных аватаров в `localStorage`;
- автоцикл и ручной перезапуск одноразовых эффектов;
- автономный embed-режим без зависимости от стека основного приложения;
- готовые методы `setState`, `setShape`, `setColor`, `update` и `destroy`.
- готовая панель выбора формы, анимации и цвета для конкретного чата;
- `manifest.json` для автоматической генерации настроек;
- примеры для обычного JavaScript, React, Next.js и Vue;
- подписка `onChange()` и DOM-событие `grok-emotion:change` для сохранения выбора.

## Локальный запуск

Проект не требует сборки или установки зависимостей.

```bash
python3 -m http.server 8765
```

После этого откройте `http://127.0.0.1:8765/`.

## Внедрение в ИИ-агента

```html
<div id="agent-avatar" style="width:280px;height:280px"></div>
<script src="https://grok-emotion.vercel.app/embed.js"></script>
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

### Выбор формы и цвета в интерфейсе чата

Все варианты уже экспортируются самим скриптом:

```js
GrokEmotion.shapes.forEach((shape) => {
  shapeSelect.add(new Option(shape, shape));
});

GrokEmotion.colors.forEach((theme) => {
  const button = document.createElement("button");
  button.style.background = theme.value;
  button.setAttribute("aria-label", theme.name);
  button.onclick = () => avatar.setColor(theme.value, theme.eyes);
  palette.append(button);
});

shapeSelect.onchange = () => avatar.setShape(shapeSelect.value);
stateSelect.onchange = () => avatar.setState(stateSelect.value);
```

Полная реализация находится в [`examples/chat.html`](./examples/chat.html). Выбор сохраняется в `localStorage`; в реальном приложении сохраните `{ shape, color, eyes }` в профиле пользователя или настройках конкретного чата.

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
avatar.getConfig();
const unsubscribe = avatar.onChange((config) => saveAvatar(config));
unsubscribe();
avatar.destroy();
```

`GrokEmotion.states`, `GrokEmotion.shapes` и `GrokEmotion.colors` содержат полный список поддерживаемых значений. Та же информация доступна как JSON в [`manifest.json`](./manifest.json).

## Как работает embed

`embed.js` создаёт изолированный iframe с прозрачным фоном и управляет им через `postMessage`. Поэтому движок анимации не конфликтует с React, Vue, Next.js, CSS и зависимостями приложения агента.

Прямой URL embed-режима:

```text
/?embed=1&state=thinking&shape=cloud&color=%2308a96f&eyes=%2308110d&size=280
```

## Структура

- `index.html` — Emotion Studio и автономный движок;
- `embed.js` — лёгкий адаптер для внедрения;
- `manifest.json` — публичный каталог форм, цветов, состояний и значений по умолчанию;
- `examples/chat.html` — рабочий чат с персонализацией аватара;
- `docs/INTEGRATION.md` — полный справочник API, форм, цветов, состояний и фреймворков;
- `docs/CHAT-INTEGRATION.md` — модель данных и сценарии интеграции с жизненным циклом ИИ-агента;
- `src/shapes-module.js` — аннотированные формы и выражения;
- `src/grokbot-module.js` — аннотированный движок состояний;
- `vercel.json` — настройки статического деплоя.

## Авторство и ограничения

Разрешено для частных проектов

