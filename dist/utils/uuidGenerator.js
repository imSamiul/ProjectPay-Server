"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUUID = generateUUID;
const uuid_1 = require("uuid");
function generateUUID() {
    const id = (0, uuid_1.v4)();
    return id.toString().substring(0, 8);
}
