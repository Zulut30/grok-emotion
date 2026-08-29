# Полное руководство по интеграции Emotion Studio

Emotion Studio — автономный анимированный аватар для веб-приложения, чата или ИИ-агента. Основное приложение подключает один скрипт, создаёт аватар в любом HTML-контейнере и меняет его форму, цвет и состояние через JavaScript.

## 1. Самый короткий рабочий пример

```html
<div id="agent-avatar" style="width: 160px; height: 160px"></div>
<script src="https://grok-emotion.vercel.app/embed.js"></script>
<script>
  const avatar = GrokEmotion.mount("#agent-avatar", {
    state: "idle",
    shape: "teardrop",
    color: "#08a96f",
    eyes: "#08110d",
    size: 160
  });

  avatar.setState("thinking");
</script>
```

Контейнер обязан иметь видимую ширину и высоту. Скрипт создаёт внутри него изолированный `iframe`, поэтому стили и зависимости вашего приложения не конфликтуют с анимацией.

## 2. Конфигурация

| Поле | Тип | Значение по умолчанию | Допустимые значения |
|---|---|---|---|
| `state` | `string` | `idle` | одно из 39 состояний |
| `shape` | `string` | `blob` | одна из 18 форм |
| `color` | `string` | `#08a96f` | цвет тела строго в формате `#RRGGBB` |
| `eyes` | `string` | `#08110d` | цвет глаз строго в формате `#RRGGBB` |
| `size` | `number` | `280` | от 40 до 800 пикселей |
| `autoCycle` | `boolean` | `false` | автоматически переключать демонстрационные состояния |

Некорректные значения безопасно заменяются значениями по умолчанию. Фактический размер на странице определяется контейнером; `size` сообщает движку внутренний размер отрисовки.

## 3. API в браузере

После загрузки `embed.js` доступен глобальный объект `window.GrokEmotion`:

```js
GrokEmotion.version;     // "1.1.0"
GrokEmotion.baseUrl;     // адрес развернутого Emotion Studio
GrokEmotion.manifestUrl; // адрес manifest.json
GrokEmotion.states;      // все состояния
GrokEmotion.shapes;      // все формы
GrokEmotion.colors;      // готовые пары цвет тела + цвет глаз
GrokEmotion.mount(target, config);
```

`target` — CSS-селектор или DOM-элемент. `mount()` возвращает контроллер:

```js
const avatar = GrokEmotion.mount("#avatar", config);

avatar.getConfig();
avatar.setState("happy");
avatar.setShape("cloud");
avatar.setColor("#dc3188", "#16040d");
avatar.update({ state: "working", shape: "hex", size: 240 });
avatar.replay();

const unsubscribe = avatar.onChange((nextConfig) => {
  console.log("Новая конфигурация", nextConfig);
});
unsubscribe();

avatar.destroy();
```

### Методы контроллера

| Метод | Назначение |
|---|---|
| `getConfig()` | возвращает копию текущей конфигурации |
| `update(partial)` | применяет несколько параметров одним обновлением и возвращает контроллер |
| `setState(state)` | переключает анимацию и отключает `autoCycle` |
| `setShape(shape)` | меняет форму без сброса состояния и цвета |
| `setColor(color, eyes?)` | меняет цвет тела и при необходимости цвет глаз |
| `replay()` | повторно отправляет текущую конфигурацию, чтобы перезапустить эффект |
| `onChange(listener)` | подписывает на локальные изменения; сразу отдаёт текущую конфигурацию |
| `destroy()` | удаляет iframe, обработчик сообщений и подписчиков |

Каждое изменение также создаёт DOM-событие `grok-emotion:change` на контейнере:

```js
document.querySelector("#avatar").addEventListener("grok-emotion:change", (event) => {
  saveAvatarToProfile(event.detail);
});
```

## 4. Все формы

Форма не меняет API состояний: любая эмоция работает с любой формой.

| ID | Внешний характер |
|---|---|
| `blob` | мягкая органическая базовая форма |
| `pebble` | округлая галька |
| `bean` | асимметричный боб |
| `egg` | вертикальное яйцо |
| `squircle` | квадрат со сглаженными углами |
| `tablet` | компактная вертикальная таблетка |
| `capsule` | широкая горизонтальная капсула |
| `cylinder` | высокий округлый цилиндр |
| `hex` | мягкий шестиугольник |
| `gem` | огранённый кристалл |
| `crystal` | вытянутый кристалл |
| `wedge` | треугольный клин |
| `shield` | щит |
| `dome` | купол |
| `arch` | арочная форма |
| `cloud` | облако из нескольких округлостей |
| `teardrop` | капля, близкая к показанному интерфейсу Grok Bot |
| `leaf` | наклонный лист |

Получение списка для собственного `<select>`:

```js
GrokEmotion.shapes.forEach((shape) => {
  shapeSelect.add(new Option(shape, shape));
});
```

## 5. Все цвета

Палитра содержит цвет тела и подобранный контрастный цвет глаз. Можно передать любой собственный цвет `#RRGGBB`.

| Название | Тело | Глаза |
|---|---|---|
| Белый | `#f4f4f4` | `#0a0a0a` |
| Коричневый | `#946b43` | `#0a0a0a` |
| Красный | `#dc2942` | `#0a0a0a` |
| Оранжевый | `#ee6200` | `#0a0a0a` |
| Янтарный | `#f39a08` | `#0a0a0a` |
| Зелёный | `#08a96f` | `#08110d` |
| Бирюзовый | `#11a99f` | `#07100f` |
| Синий | `#2f80ed` | `#07101c` |
| Фиолетовый | `#7042d6` | `#ffffff` |
| Розовый | `#dc3188` | `#16040d` |
| Серый | `#b7b7b7` | `#0a0a0a` |

Палитра для интерфейса выбора:

```js
GrokEmotion.colors.forEach(({ name, value, eyes }) => {
  const button = document.createElement("button");
  button.title = name;
  button.style.background = value;
  button.onclick = () => avatar.setColor(value, eyes);
  palette.append(button);
});
```

Для произвольного `<input type="color">` выберите контраст глаз самостоятельно:

```js
colorInput.addEventListener("input", () => {
  avatar.setColor(colorInput.value, "#0a0a0a");
});
```

## 6. Все состояния и рекомендуемое применение

### Жизненный цикл агента

| Состояние | Когда использовать |
|---|---|
| `sleeping` | агент неактивен длительное время |
| `waking` | открытие чата или возвращение из сна |
| `idle` | агент ждёт пользователя |
| `listening` | запись голоса или ввод пользователя |
| `thinking` | модель формирует план или ответ |
| `searching` | поиск в интернете, базе знаний или файлах |
| `working` | вызов инструмента или длительная задача |

### Эмоциональные реакции

| Состояние | Смысл |
|---|---|
| `excited` | сильное воодушевление |
| `surprised` | неожиданное событие |
| `suspicious` | сомнение, проверка факта |
| `angry` | резкая негативная реакция |
| `drowsy` | усталость или медленная операция |
| `happy` | успешное завершение |
| `curious` | вопрос или исследование |
| `confused` | недостаточно контекста |
| `bored` | ожидание без активности |
| `proud` | важный успешный результат |
| `shy` | мягкая, сдержанная реакция |
| `sad` | неудача без аварии |
| `laughing` | юмористическая реакция |
| `scared` | серьёзное предупреждение |
| `playful` | игровая или неформальная реакция |
| `celebrate` | завершение большого этапа |

### Визуальные эффекты

| Состояние | Смысл |
|---|---|
| `orbit` | активное исследование нескольких источников |
| `radar` | сканирование и обнаружение |
| `progress` | длительный процесс с визуальным ожиданием |

### Действия

| Состояние | Когда использовать |
|---|---|
| `spawning` | первое появление агента |
| `humming` | фоновая спокойная работа |
| `loading` | загрузка данных или интерфейса |
| `dictating` | озвучивание или диктовка |
| `writing` | потоковая генерация текста |
| `sending` | отправка данных |
| `receiving` | получение данных |
| `uploading` | загрузка файла на сервер |
| `notifying` | обычное уведомление |
| `alerting` | ошибка или важное предупреждение |
| `dragging` | перенос объекта или файла |
| `bouncing` | привлечение внимания |
| `powering-down` | завершение сессии |

## 7. Рекомендуемая карта событий ИИ-агента

```js
const emotionByEvent = {
  waiting: "idle",
  userSpeaking: "listening",
  thinking: "thinking",
  searching: "searching",
  toolStart: "working",
  responseStreaming: "writing",
  done: "happy",
  error: "alerting"
};

function handleAgentEvent(eventName) {
  avatar.setState(emotionByEvent[eventName] || "idle");
}
```

Форму и цвет лучше считать постоянной персонализацией пользователя или чата, а `state` — краткоживущим состоянием текущего запроса.

## 8. Сохранение выбора пользователя

Локальный вариант без сервера:

```js
const key = "my-chat-avatar";
const stored = JSON.parse(localStorage.getItem(key) || "null");
const avatar = GrokEmotion.mount("#avatar", stored || {
  state: "idle",
  shape: "blob",
  color: "#08a96f",
  eyes: "#08110d"
});

avatar.onChange((config) => {
  localStorage.setItem(key, JSON.stringify(config));
});
```

В приложении с аккаунтами сохраните минимум `{ shape, color, eyes }` в настройках пользователя либо конкретного чата. `state` обычно не нужно сохранять на сервере.

## 9. React / Next.js

Компонент должен создаваться только в браузере и уничтожать контроллер при размонтировании:

```jsx
import { useEffect, useRef } from "react";

export function AgentAvatar({ state, shape, color, eyes }) {
  const hostRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    avatarRef.current = window.GrokEmotion.mount(hostRef.current, {
      state, shape, color, eyes, size: 160
    });
    return () => avatarRef.current?.destroy();
  }, []);

  useEffect(() => {
    avatarRef.current?.update({ state, shape, color, eyes });
  }, [state, shape, color, eyes]);

  return <div ref={hostRef} style={{ width: 160, height: 160 }} />;
}
```

В Next.js подключите скрипт через `next/script` с `strategy="afterInteractive"` и монтируйте компонент после `onLoad`, либо загрузите скрипт программно. Не обращайтесь к `window` во время серверного рендера.

## 10. Vue

```vue
<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps(["state", "shape", "color", "eyes"]);
const host = ref(null);
let avatar;

onMounted(() => {
  avatar = window.GrokEmotion.mount(host.value, { ...props, size: 160 });
});
watch(() => ({ ...props }), (next) => avatar?.update(next), { deep: true });
onBeforeUnmount(() => avatar?.destroy());
</script>

<template><div ref="host" class="agent-avatar" /></template>
<style>.agent-avatar { width: 160px; height: 160px; }</style>
```

## 11. Прямой iframe без `embed.js`

```html
<iframe
  title="Аватар ИИ-агента"
  src="https://grok-emotion.vercel.app/?embed=1&state=thinking&shape=cloud&color=%2308a96f&eyes=%2308110d&size=280"
  style="width:280px;height:280px;border:0;background:transparent"
></iframe>
```

Параметры цвета в URL должны быть URL-кодированы: символ `#` превращается в `%23`. Для динамического управления и проверки origin предпочтительнее `embed.js`.

## 12. Машиночитаемый manifest

Полная текущая схема доступна по адресу:

```text
https://grok-emotion.vercel.app/manifest.json
```

Manifest содержит версию, адреса, значения по умолчанию, ограничения, все формы, цвета, категории состояний и рекомендованную карту событий. Его можно использовать для автоматической генерации панели настроек.

## 13. Безопасность и эксплуатация

- `embed.js` принимает только цвета `#RRGGBB`, известные формы и известные состояния.
- Сообщения в iframe отправляются с точным `targetOrigin`, а ответы проверяются по `origin` и `source`.
- Не вставляйте пользовательский HTML в подписи; используйте `textContent`.
- Если вы копируете проект на свой домен, задайте `data-base` у скрипта: `<script src="/embed.js" data-base="https://avatar.example.com"></script>`.
- При строгой Content Security Policy разрешите адрес Emotion Studio в `script-src` и `frame-src`.
- Для полностью автономного продукта разверните копию проекта на своём домене и зафиксируйте версию скрипта в релизе.

## 14. Доступность и reduced motion

- Дайте контейнеру или iframe понятный `aria-label`/`title`.
- Не используйте одну эмоцию как единственный канал сообщения об ошибке: добавляйте текстовый статус.
- Кнопки цветов должны иметь текстовые `aria-label`.
- Для пользователей, предпочитающих меньше движения, оставляйте спокойное `idle` и не включайте `autoCycle`.
- Избегайте слишком частого переключения: для быстрого потока событий полезна задержка 150–300 мс.

## 15. Типичные проблемы

| Симптом | Что проверить |
|---|---|
| Аватар не виден | у контейнера есть ненулевая ширина и высота; `embed.js` загрузился без блокировки CSP |
| Всегда отображается `idle` | ID состояния есть в `GrokEmotion.states`; регистр букв совпадает |
| Цвет не применяется | используется полный формат `#RRGGBB`, а не `#RGB` или имя CSS |
| Аватар обрезан | контейнер не слишком мал и родитель не задаёт нежелательный `overflow: hidden` |
| В React появляется второй iframe | контроллер создаётся один раз, а cleanup вызывает `destroy()` |
| Настройки теряются | сохраните `getConfig()` или подпишитесь через `onChange()` |
| Одноразовый эффект не повторяется | вызовите `replay()` после `setState()` |

## 16. Версии и совместимость

Текущая версия браузерного API: `1.1.0`. Новые формы и состояния добавляются без удаления существующих идентификаторов. Приложение без сборки и внешних runtime-зависимостей работает в современных Chrome, Safari, Firefox и Edge.

## 17. Авторство и права

Проект создан как техническое воспроизведение визуальной идеи Grok Bot icon. Графика и исходная фирменная анимационная система связаны с xAI. Для публичного или коммерческого продукта проверьте права на визуальные элементы и при необходимости замените их собственным дизайном. Код интеграции и ваша конфигурация приложения — отдельный слой.
