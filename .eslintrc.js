module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "standard",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "web3": "readonly",
        "assert":"readonly",
        "artifacts": "readonly",
        "contract": "readonly",
        "it": "readonly",
        "describe": "readonly",
        "before": "readonly", 
        "beforeEach": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
    }
};