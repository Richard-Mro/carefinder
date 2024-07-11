export declare const registerWithEmailAndPassword: (email: string, password: string) => Promise<import("@firebase/auth").User>;
export declare const loginWithEmailAndPassword: (email: string, password: string) => Promise<import("@firebase/auth").User>;
export declare const logout: () => Promise<void>;
export declare const isAuthenticated: () => boolean;
export declare const getCurrentUser: () => import("@firebase/auth").User | null;
