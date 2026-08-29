# Внедрение в чат или ИИ-агента

Готовая демонстрация: [grok-emotion.vercel.app/examples/chat](https://grok-emotion.vercel.app/examples/chat)

## Рекомендуемая модель данных

Храните внешний вид отдельно от текущей активности агента:

```ts
type AvatarAppearance = {
  shape: string;
  color: `#${string}`;
  eyes: `#${string}`;
};

type AgentPresence = {
  state: string;
};
```

- `appearance` сохраняется в профиле пользователя, настройках ассистента или конкретного чата;
- `state` меняется на время запроса и после завершения возвращается в `idle` или `happy`;
- если у каждого чата свой цвет, сохраняйте `appearance` по `chatId`;
- если цвет является частью бренда агента, сохраняйте его по `agentId` и не разрешайте пользователю менять его глобально.

Пример структуры на сервере:

```json
{
  "chatId": "chat_123",
  "avatar": {
    "shape": "teardrop",
    "color": "#7042d6",
    "eyes": "#ffffff"
  }
}
```

## Сценарий интерфейса настроек

1. Покажите небольшой аватар в шапке чата.
2. В настройках дайте выбор `shape`, стартового `state` и палитры.
3. Применяйте изменения сразу через `avatar.update()`.
4. Сохраняйте `{ shape, color, eyes }` после каждого изменения или по кнопке «Сохранить».
5. Во время ответа временно меняйте только `state`.

```js
const avatar = GrokEmotion.mount("#chat-avatar", {
  ...savedAppearance,
  state: "idle",
  size: 72
});

shapeSelect.onchange = () => {
  savedAppearance.shape = shapeSelect.value;
  avatar.setShape(savedAppearance.shape);
  saveChatAppearance(savedAppearance);
};

GrokEmotion.colors.forEach((theme) => {
  const swatch = document.createElement("button");
  swatch.style.background = theme.value;
  swatch.setAttribute("aria-label", theme.name);
  swatch.onclick = () => {
    savedAppearance.color = theme.value;
    savedAppearance.eyes = theme.eyes;
    avatar.setColor(theme.value, theme.eyes);
    saveChatAppearance(savedAppearance);
  };
  palette.append(swatch);
});
```

## Связь с жизненным циклом ответа

```js
async function sendMessage(text) {
  try {
    avatar.setState("thinking");
    setStatus("Думает…");

    const stream = await agent.respond(text);
    avatar.setState("writing");
    setStatus("Пишет ответ…");

    for await (const chunk of stream) appendText(chunk);

    avatar.setState("happy");
    setStatus("Ответ готов");
    window.setTimeout(() => avatar.setState("idle"), 1800);
  } catch (error) {
    avatar.setState("alerting");
    setStatus("Не удалось получить ответ");
    throw error;
  }
}
```

Если агент сообщает о вызовах инструментов, добавьте промежуточные состояния:

```js
agent.on("search:start", () => avatar.setState("searching"));
agent.on("tool:start", () => avatar.setState("working"));
agent.on("upload:start", () => avatar.setState("uploading"));
agent.on("voice:listening", () => avatar.setState("listening"));
agent.on("voice:speaking", () => avatar.setState("dictating"));
```

## Несколько чатов или агентов

Каждый вызов `mount()` создаёт независимый контроллер:

```js
const avatars = new Map();

function mountChat(chat) {
  const controller = GrokEmotion.mount(`#avatar-${chat.id}`, {
    ...chat.avatar,
    state: chat.isBusy ? "working" : "idle",
    size: 64
  });
  avatars.set(chat.id, controller);
}

function setChatState(chatId, state) {
  avatars.get(chatId)?.setState(state);
}

function closeChat(chatId) {
  avatars.get(chatId)?.destroy();
  avatars.delete(chatId);
}
```

Не создавайте десятки больших активных аватаров вне экрана. Для списка чатов можно показывать статичные миниатюры, а анимацию монтировать только для открытого чата.

## React: панель персонализации

```jsx
function AvatarSettings({ value, onChange }) {
  return (
    <section aria-label="Настройки аватара">
      <label>
        Форма
        <select
          value={value.shape}
          onChange={(e) => onChange({ ...value, shape: e.target.value })}
        >
          {window.GrokEmotion.shapes.map((shape) => (
            <option key={shape} value={shape}>{shape}</option>
          ))}
        </select>
      </label>

      <div aria-label="Цвет для чата">
        {window.GrokEmotion.colors.map((theme) => (
          <button
            key={theme.value}
            type="button"
            aria-label={theme.name}
            aria-pressed={value.color === theme.value}
            style={{ background: theme.value }}
            onClick={() => onChange({ ...value, color: theme.value, eyes: theme.eyes })}
          />
        ))}
      </div>
    </section>
  );
}
```

После `onChange` обновите контроллер локально, а сохранение на сервер выполняйте с debounce, чтобы не делать запрос на каждый пиксель изменения произвольного цвета.

## Выбор цвета именно для чата

Простой ключ локального хранения:

```js
const key = `avatar:${userId}:${chatId}`;
localStorage.setItem(key, JSON.stringify({ shape, color, eyes }));
```

Пример REST-контракта:

```http
PATCH /api/chats/:chatId/avatar
Content-Type: application/json

{
  "shape": "cloud",
  "color": "#2f80ed",
  "eyes": "#07101c"
}
```

На сервере проверяйте:

- `shape` входит в список из `manifest.json`;
- `color` и `eyes` соответствуют `^#[0-9a-fA-F]{6}$`;
- пользователь имеет право изменять этот чат;
- `state` не принимается как постоянная настройка, если им управляет сервер агента.

## Что копировать в своё приложение

Минимальный вариант: подключить публичный `embed.js` и использовать API. Автономный вариант: скопировать `index.html`, `embed.js`, `src/`, `manifest.json` и развернуть их на собственном домене. В обоих случаях интерфейс выбора формы и цвета остаётся частью вашего приложения; Emotion Studio отвечает за отрисовку и анимацию.

Полный API, таблицы всех значений, React/Vue-примеры, безопасность и диагностика находятся в [INTEGRATION.md](./INTEGRATION.md).
