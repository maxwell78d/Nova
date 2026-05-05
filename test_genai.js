const { GoogleGenAI } = require('@google/genai');
const genAI = new GoogleGenAI('test');
console.log('Methods of GoogleGenAI instance:', Object.getOwnPropertyNames(Object.getPrototypeOf(genAI)));
const model = genAI.getGenerativeModel ? genAI.getGenerativeModel({model: 'test'}) : null;
if (model) console.log('Model methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(model)));
