import { REGISTERS } from '@constants/index';

export class RegisterEntry {
  registerCache = {};

  constructor() {
    if (window[REGISTERS.WINDOW_VAR_NAME]) {
      window[REGISTERS.WINDOW_VAR_NAME].map(this.register);
    }

    window[REGISTERS.WINDOW_VAR_NAME] = [];
    window[REGISTERS.WINDOW_VAR_NAME].push = this.register;
  }

  register = ([entry, fn]) => {
    this.registerCache[entry] = fn();
  };

  findRegister = (key: string) => {
    return this.registerCache[key];
  };
}

export default RegisterEntry;
