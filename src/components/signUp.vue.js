"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = require("vue");
const firebase_1 = require("../firebase");
const auth_1 = require("firebase/auth");
exports.default = (0, vue_1.defineComponent)({
    name: 'SignUp',
    setup() {
        const email = (0, vue_1.ref)('');
        const password = (0, vue_1.ref)('');
        const signUp = async () => {
            try {
                await (0, auth_1.createUserWithEmailAndPassword)(firebase_1.auth, email.value, password.value);
                alert('User registered successfully!');
            }
            catch (error) {
                if (error instanceof Error) {
                    alert(error.message);
                }
                else {
                    alert('An unknown error occurred');
                }
            }
        };
        return {
            email,
            password,
            signUp,
        };
    },
});
;
function __VLS_template() {
    let __VLS_ctx;
    /* Components */
    let __VLS_otherComponents;
    let __VLS_own;
    let __VLS_localComponents;
    let __VLS_components;
    let __VLS_styleScopedClasses;
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({ type: ("email"), placeholder: ("Email"), });
    (__VLS_ctx.email);
    // @ts-ignore
    [email,];
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({ type: ("password"), placeholder: ("Password"), });
    (__VLS_ctx.password);
    // @ts-ignore
    [password,];
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({ ...{ onClick: (__VLS_ctx.signUp) }, });
    // @ts-ignore
    [signUp,];
    if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
    }
    var __VLS_slots;
    return __VLS_slots;
    const __VLS_componentsOption = {};
    const __VLS_name = 'SignUp';
    let __VLS_internalComponent;
}
