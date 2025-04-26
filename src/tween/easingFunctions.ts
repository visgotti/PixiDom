/*
Easing Types extracted from tween.js
https://github.com/tweenjs/tween.js

Available functions can be referenced by name, or by name.In, name.Out, and name.InOut

linear, quadratic, cubic, quartic, quintic, sinusoidal, exponential, circular, elastic, back, bounce
*/

export interface EasingFunction {
  (k: number): number;
  In?: (k: number) => number;
  Out?: (k: number) => number;
  InOut?: (k: number) => number;
}

export interface EasingFunctions {
  [key: string]: EasingFunction;
}

const Bounce = {
  In: function(k: number): number {
    return 1 - Bounce.Out(1 - k);
  },
  Out: function(k: number): number {
    if (k < (1 / 2.75)) {
      return 7.5625 * k * k;
    } else if (k < (2 / 2.75)) {
      return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
    } else if (k < (2.5 / 2.75)) {
      return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
    } else {
      return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
    }
  },
  InOut: function(k: number): number {
    if (k < 0.5) {
      return Bounce.In(k * 2) * 0.5;
    }
    return Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
  }
};

const easingFunctions: Record<string, Record<string, EasingFunction>> = {
  linear: {
    In: function(k: number): number {
      return k;
    },
    Out: function(k: number): number {
      return k;
    },
    InOut: function(k: number): number {
      return k;
    }
  },
  quadratic: {
    In: function(k: number): number {
      return k * k;
    },
    Out: function(k: number): number {
      return k * (2 - k);
    },
    InOut: function(k: number): number {
      if ((k *= 2) < 1) {
        return 0.5 * k * k;
      }
      return -0.5 * (--k * (k - 2) - 1);
    }
  },
  cubic: {
    In: function(k: number): number {
      return k * k * k;
    },
    Out: function(k: number): number {
      return --k * k * k + 1;
    },
    InOut: function(k: number): number {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k;
      }
      return 0.5 * ((k -= 2) * k * k + 2);
    }
  },
  quartic: {
    In: function(k: number): number {
      return k * k * k * k;
    },
    Out: function(k: number): number {
      return 1 - (--k * k * k * k);
    },
    InOut: function(k: number): number {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k * k;
      }
      return -0.5 * ((k -= 2) * k * k * k - 2);
    }
  },
  quintic: {
    In: function(k: number): number {
      return k * k * k * k * k;
    },
    Out: function(k: number): number {
      return --k * k * k * k * k + 1;
    },
    InOut: function(k: number): number {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k * k * k;
      }
      return 0.5 * ((k -= 2) * k * k * k * k + 2);
    }
  },
  sinusoidal: {
    In: function(k: number): number {
      return 1 - Math.cos(k * Math.PI / 2);
    },
    Out: function(k: number): number {
      return Math.sin(k * Math.PI / 2);
    },
    InOut: function(k: number): number {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }
  },
  exponential: {
    In: function(k: number): number {
      return k === 0 ? 0 : Math.pow(1024, k - 1);
    },
    Out: function(k: number): number {
      return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    },
    InOut: function(k: number): number {
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      if ((k *= 2) < 1) {
        return 0.5 * Math.pow(1024, k - 1);
      }
      return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    }
  },
  circular: {
    In: function(k: number): number {
      return 1 - Math.sqrt(1 - k * k);
    },
    Out: function(k: number): number {
      return Math.sqrt(1 - (--k * k));
    },
    InOut: function(k: number): number {
      if ((k *= 2) < 1) {
        return -0.5 * (Math.sqrt(1 - k * k) - 1);
      }
      return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    }
  },
  elastic: {
    In: function(k: number): number {
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
    },
    Out: function(k: number): number {
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
    },
    InOut: function(k: number): number {
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      k *= 2;
      if (k < 1) {
        return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
      }
      return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
    }
  },
  back: {
    In: function(k: number): number {
      const s = 1.70158;
      return k * k * ((s + 1) * k - s);
    },
    Out: function(k: number): number {
      const s = 1.70158;
      return --k * k * ((s + 1) * k + s) + 1;
    },
    InOut: function(k: number): number {
      const s = 1.70158 * 1.525;
      if ((k *= 2) < 1) {
        return 0.5 * (k * k * ((s + 1) * k - s));
      }
      return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }
  },
  bounce: Bounce
};

// Apply shorthand to each easing function
const processedEasingFunctions: EasingFunctions = {};

Object.keys(easingFunctions).forEach(key => {
  const easingGroup = easingFunctions[key];
  const mainFunction = easingGroup.InOut;
  
  // Add In, Out, InOut properties to the main function
  mainFunction.In = easingGroup.In;
  mainFunction.Out = easingGroup.Out;
  mainFunction.InOut = easingGroup.InOut;
  
  // Add the main function to the processed functions
  processedEasingFunctions[key] = mainFunction;
});

export default processedEasingFunctions;