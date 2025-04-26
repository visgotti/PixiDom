export class Color {
  private r: number = 0;
  private g: number = 0;
  private b: number = 0;
  private a: number = 1;

  constructor(value?: string | number | Color | number[]) {
    if (value === undefined) {
      return;
    }

    if (typeof value === 'string') {
      this.parseColorString(value);
    } else if (typeof value === 'number') {
      this.parseHex(value);
    } else if (Array.isArray(value)) {
      this.setRgb(value);
    } else if (value instanceof Color) {
      this.r = value.r;
      this.g = value.g;
      this.b = value.b;
      this.a = value.a;
    }
  }

  private parseColorString(color: string): void {
    // Handle hex
    if (color.startsWith('#')) {
      this.parseHexString(color);
      return;
    }

    // Handle rgb/rgba
    if (color.startsWith('rgb')) {
      this.parseRgbString(color);
      return;
    }

    // Default to black if format not recognized
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 1;
  }

  private parseHexString(hex: string): void {
    // Remove the hash
    hex = hex.replace('#', '');

    // Handle shorthand hex (#RGB)
    if (hex.length === 3) {
      this.r = parseInt(hex[0] + hex[0], 16);
      this.g = parseInt(hex[1] + hex[1], 16);
      this.b = parseInt(hex[2] + hex[2], 16);
      this.a = 1;
      return;
    }

    // Handle standard hex (#RRGGBB)
    if (hex.length === 6) {
      this.r = parseInt(hex.substring(0, 2), 16);
      this.g = parseInt(hex.substring(2, 4), 16);
      this.b = parseInt(hex.substring(4, 6), 16);
      this.a = 1;
      return;
    }

    // Handle hex with alpha (#RRGGBBAA)
    if (hex.length === 8) {
      this.r = parseInt(hex.substring(0, 2), 16);
      this.g = parseInt(hex.substring(2, 4), 16);
      this.b = parseInt(hex.substring(4, 6), 16);
      this.a = parseInt(hex.substring(6, 8), 16) / 255;
      return;
    }
  }

  private parseHex(hex: number): void {
    this.r = (hex >> 16) & 0xFF;
    this.g = (hex >> 8) & 0xFF;
    this.b = hex & 0xFF;
    this.a = 1;
  }

  private parseRgbString(rgb: string): void {
    // Extract numbers from rgb(r, g, b) or rgba(r, g, b, a)
    const values = rgb.match(/\d+(\.\d+)?/g);
    
    if (values && values.length >= 3) {
      this.r = parseInt(values[0], 10);
      this.g = parseInt(values[1], 10);
      this.b = parseInt(values[2], 10);
      this.a = values.length >= 4 ? parseFloat(values[3]) : 1;
    } else {
      // Default to black if parsing fails
      this.r = 0;
      this.g = 0;
      this.b = 0;
      this.a = 1;
    }
  }

  public rgb(): Color {
    return this;
  }

  public array(): number[] {
    return [this.r, this.g, this.b];
  }

  public hex(): string {
    const r = this.padZero(this.r.toString(16));
    const g = this.padZero(this.g.toString(16));
    const b = this.padZero(this.b.toString(16));
    return `#${r}${g}${b}`;
  }
  
  private padZero(str: string): string {
    return str.length === 1 ? '0' + str : str;
  }

  public toString(): string {
    if (this.a < 1) {
      return `rgba(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)}, ${this.a})`;
    }
    return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
  }

  public setRgb(values: number[]): Color {
    if (values.length >= 3) {
      this.r = values[0];
      this.g = values[1];
      this.b = values[2];
      if (values.length >= 4) {
        this.a = values[3];
      }
    }
    return this;
  }

  // Static helper methods
  public static rgb(values: number[]): Color {
    return new Color(values);
  }
}

export default Color;