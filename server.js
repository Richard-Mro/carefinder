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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
var firebase_1 = require("./src/firebase");
var axios_1 = require("axios");
var firestore_1 = require("firebase/firestore");
var express = require('express');
var cors = require('cors');
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var app = express();
var port = process.env.PORT || 3000;
var apiKey = process.env.VITE_APP_GOOGLE_MAPS_API_KEY;
app.use(cors());
app.get('/api/hospitals', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var url, response, hospitals, hospitalsCollection_1, uploadPromises, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!firebase_1.db) {
                    res.status(500).send('Firestore database is not initialized');
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=9.0820,8.6753&radius=50000&type=hospital&key=".concat(apiKey);
                return [4 /*yield*/, axios_1.default.get(url)];
            case 2:
                response = _a.sent();
                hospitals = response.data.results.map(function (result) { return ({
                    name: result.name,
                    vicinity: result.vicinity,
                    geometry: {
                        location: {
                            lat: result.geometry.location.lat,
                            lng: result.geometry.location.lng
                        }
                    },
                    international_phone_number: result.international_phone_number || 'N/A',
                    email: result.email || 'N/A'
                }); });
                hospitalsCollection_1 = (0, firestore_1.collection)(firebase_1.db, 'hospitals');
                uploadPromises = hospitals.map(function (hospital) { return __awaiter(void 0, void 0, void 0, function () {
                    var error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, (0, firestore_1.addDoc)(hospitalsCollection_1, {
                                        name: hospital.name,
                                        address: hospital.vicinity,
                                        latitude: hospital.geometry.location.lat,
                                        longitude: hospital.geometry.location.lng,
                                        phone: hospital.international_phone_number || 'N/A',
                                        email: hospital.email || 'N/A'
                                    })];
                            case 1:
                                _a.sent();
                                console.log("Uploaded hospital: ".concat(hospital.name));
                                return [3 /*break*/, 3];
                            case 2:
                                error_2 = _a.sent();
                                console.error('Error uploading hospital:', error_2);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(uploadPromises)];
            case 3:
                _a.sent();
                res.json({ results: hospitals });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                res.status(500).send('Error fetching data from Google Places API');
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("Server running on port ".concat(port));
});
exports.default = app;
