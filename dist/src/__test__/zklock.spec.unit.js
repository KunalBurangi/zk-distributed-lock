"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ClientClass_1 = require("./helper/ClientClass");
function delay(ms) {
    return new Promise((rs) => setTimeout(rs, ms));
}
describe('myClass', function test() {
    this.timeout(5000);
    it('should do some task after acquiring the lock', () => __awaiter(this, void 0, void 0, function* () {
        const myclass = new ClientClass_1.MyClass("localhost:2182");
        const result = yield myclass.acquireLockAndDoWork();
        yield delay(3000);
        (0, chai_1.expect)(result).equal("task done");
        (0, chai_1.expect)(myclass.response).equal("Lock released");
    }));
    it('should create 2 instance of app and only one instance should do some task after acquiring the lock', () => __awaiter(this, void 0, void 0, function* () {
        const myclass1 = new ClientClass_1.MyClass("localhost:2182");
        const myclass2 = new ClientClass_1.MyClass("localhost:2182");
        const promises = [];
        promises.push(myclass1.acquireLockAndDoWork());
        promises.push(myclass2.acquireLockAndDoWork());
        yield Promise.all(promises);
        yield delay(3000);
        if ((myclass1.response === "Lock released" && myclass2.response === "initial") ||
            (myclass2.response === "Lock released" && myclass1.response === "initial")) {
            (0, chai_1.expect)(true).equal(true);
        }
        else {
            (0, chai_1.expect)(true).equal(false);
        }
    }));
});

//# sourceMappingURL=zklock.spec.unit.js.map

//# sourceMappingURL=zklock.spec.unit.js.map
