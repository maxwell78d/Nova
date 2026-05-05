const text = `
--------------------------------------------------
[M1]
Nombre del módulo: Fundamentos y Conceptos Básicos
--------------------------------------------------`;
const moduleMatch = text.match(/\[(M\d+)\]\s+Nombre del módulo: (.*)/);
console.log(moduleMatch);
