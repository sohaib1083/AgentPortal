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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in your .env.local file");
}
var cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
function dbConnect() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (cached.conn)
                        return [2 /*return*/, cached.conn];
                    if (!cached.promise) {
                        cached.promise = mongoose_1.default.connect(MONGODB_URI, {
                            bufferCommands: false,
                        }).then(function (mongooseInstance) { return mongooseInstance.connection; });
                    }
                    _a = cached;
                    return [4 /*yield*/, cached.promise];
                case 1:
                    _a.conn = _b.sent();
                    return [2 /*return*/, cached.conn];
            }
        });
    });
}
exports.default = dbConnect;
var Agent_1 = __importDefault(require("../models/Agent"));
function checkSchema() {
    return __awaiter(this, void 0, void 0, function () {
        var testAgent, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbConnect()];
                case 1:
                    _a.sent();
                    testAgent = new Agent_1.default({
                        name: 'Test Agent Schema',
                        email: 'schema-test@example.com',
                        password: 'password123',
                        level: 'L1',
                        totalSales: 100,
                        agentCommissionPercentage: 70,
                        organizationCommissionPercentage: 30
                    });
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, testAgent.validate()];
                case 3:
                    _a.sent();
                    console.log('Schema validation passed!');
                    console.log('Agent fields:', Object.keys(testAgent._doc).filter(function (k) { return !k.startsWith('_'); }));
                    // Don't save, just check if the fields exist in the document
                    if ('agentCommissionPercentage' in testAgent._doc && 'organizationCommissionPercentage' in testAgent._doc) {
                        console.log('Commission fields exist in the document!');
                        console.log('Agent commission:', testAgent.agentCommissionPercentage);
                        console.log('Org commission:', testAgent.organizationCommissionPercentage);
                    }
                    else {
                        console.error('Commission fields are missing from the document!');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Schema validation failed:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
checkSchema();
