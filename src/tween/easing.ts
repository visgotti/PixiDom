import easingFunctions, { EasingFunction } from './easingFunctions';

/**
 * Parse easing name into array
 * example: `cubic` becomes ['cubic']
 * example: `cubicInOut' becomes ['cubic', 'InOut']
 */
function parseName(name: string): string[] {
  const tests = [/InOut$/, /In$/, /Out$/];
  
  for (const regex of tests) {
    const match = regex.exec(name);
    if (match) {
      return [name.substr(0, match.index), match[0]];
    }
  }
  
  return [name];
}

/**
 * Return easing function given a name like 'cubicInOut'
 */
function getEasing(name: string): EasingFunction {
  const path = parseName(name);
  
  if (!easingFunctions[path[0]]) {
    // Return linear function as default if easing not found
    return easingFunctions.linear;
  }
  
  if (path.length === 1) {
    return easingFunctions[path[0]];
  }
  
  const easingGroup = easingFunctions[path[0]];
  return easingGroup[path[1] as keyof EasingFunction] || easingGroup;
}

export default getEasing;