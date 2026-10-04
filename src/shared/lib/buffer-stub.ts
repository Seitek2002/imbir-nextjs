// Заглушка Node-глобала Buffer для браузерного бандла. Подключается алиасом
// в next.config.ts (turbopack.resolveAlias) — там же объяснено, зачем.
//
// Импортировать этот файл руками не нужно. Если какой-то клиентской
// зависимости однажды понадобится настоящий Buffer, она упадёт на
// `undefined.from(...)` — тогда алиас в next.config.ts надо убрать.
export const Buffer = undefined;

const stub = { Buffer };
export default stub;
