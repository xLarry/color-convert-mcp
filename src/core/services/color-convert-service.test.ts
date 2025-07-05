import { ColorConvertService } from "./color-convert-service.js";
import { describe, it, expect } from "bun:test";

function parseLab(str: string): number[] {
  const match = str.match(/lab\(([-\d.]+)[, ]+([-\d.]+)[, ]+([-\d.]+)\)/);
  if (!match) throw new Error("Invalid lab string: " + str);
  return match.slice(1).map(Number);
}
function parseOklch(str: string): number[] {
  const match = str.match(/oklch\(([-\d.]+)[, ]+([-\d.]+)[, ]+([-\d.]+)\)/);
  if (!match) throw new Error("Invalid oklch string: " + str);
  return match.slice(1).map(Number);
}
function parseCmyk(str: string): number[] {
  const match = str.match(/cmyk\(([-\d.]+)%?,\s*([-\d.]+)%?,\s*([-\d.]+)%?,\s*([-\d.]+)%?\)/);
  if (!match) throw new Error("Invalid cmyk string: " + str);
  return match.slice(1).map(Number);
}
function parseHsl(str: string): number[] {
  const match = str.match(/hsl\(([-\d.]+)[, ]+([-\d.]+)%?,?[, ]+([-\d.]+)%?\)/);
  if (!match) throw new Error("Invalid hsl string: " + str);
  return match.slice(1).map(Number);
}
function expectArrayCloseTo(arr1: number[], arr2: number[], tolerance = 1) {
  expect(arr1.length).toBe(arr2.length);
  for (let i = 0; i < arr1.length; ++i) {
    expect(arr1[i]).toBeCloseTo(arr2[i], tolerance);
  }
}

describe("ColorConvertService", () => {
  // RGB <-> HEX
  it("converts rgb to hex and back", () => {
    const rgb = "rgb(255, 0, 128)";
    const hex = ColorConvertService.convertColor("rgb", "hex", rgb);
    expect(hex).toBe("#ff0080");
    const rgbBack = ColorConvertService.convertColor("hex", "rgb", hex);
    expect(rgbBack).toBe("rgb(255,0,128)");
  });

  // RGBA <-> HEX
  it("converts rgba to hex and back", () => {
    const rgba = "rgba(255, 128, 0, 64)";
    const hex = ColorConvertService.convertColor("rgba", "hex", rgba);
    expect(hex).toBe("#ff800040");
    const rgbaBack = ColorConvertService.convertColor("hex", "rgba", hex);
    expect(rgbaBack).toBe("rgba(255,128,0,64)");
  });

  // HEX <-> HEX (8-digit)
  it("converts 8-digit hex to 6-digit hex and back", () => {
    const hex8 = "#12345678";
    const hex = ColorConvertService.convertColor("hex", "hex", hex8);
    expect(hex).toBe("#12345678");
    const hex8Back = ColorConvertService.convertColor("hex", "hex", hex);
    expect(hex8Back).toBe("#12345678");
  });

  // HSL <-> HEX
  it("converts hsl to hex and back", () => {
    const hsl = "hsl(0, 100%, 50%)";
    const hex = ColorConvertService.convertColor("hsl", "hex", hsl);
    expect(hex).toBe("#ff0000");
    const hslBack = ColorConvertService.convertColor("hex", "hsl", hex);
    expectArrayCloseTo(parseHsl(hslBack), parseHsl(hsl), 1);
  });

  // OKLCH <-> HEX
  it("converts oklch to hex and back", () => {
    const oklch = "oklch(0.7 0.1 208)";
    const hex = ColorConvertService.convertColor("oklch", "hex", oklch);
    expect(hex).toBe("#42b0bf");
    const oklchBack = ColorConvertService.convertColor("hex", "oklch", hex);
    expectArrayCloseTo(parseOklch(oklchBack), parseOklch(oklch), 0.05);
  });

  // LAB <-> HEX
  it("converts lab to hex and back", () => {
    const lab = "lab(78.25, -17.71, 76.47)";
    const hex = ColorConvertService.convertColor("lab", "hex", lab);
    expect(hex).toBe("#bfc907");
    const labBack = ColorConvertService.convertColor("hex", "lab", hex);
    expectArrayCloseTo(parseLab(labBack), parseLab(lab), 0.01);
  });

  // CMYK <-> HEX
  it("converts cmyk to hex and back", () => {
    const cmyk = "cmyk(0%, 0%, 90%, 21.57%)";
    const hex = ColorConvertService.convertColor("cmyk", "hex", cmyk);
    expect(hex.length).toBe(7);
    const cmykBack = ColorConvertService.convertColor("hex", "cmyk", hex);
    expectArrayCloseTo(parseCmyk(cmykBack), parseCmyk(cmyk), 0.1);
  });

  // RGB <-> HSL
  it("converts rgb to hsl and back", () => {
    const rgb = "rgb(255, 0, 0)";
    const hsl = ColorConvertService.convertColor("rgb", "hsl", rgb);
    expectArrayCloseTo(parseHsl(hsl), [0, 100, 50], 1);
    const rgbBack = ColorConvertService.convertColor("hsl", "rgb", hsl);
    expect(rgbBack).toBe("rgb(255,0,0)");
  });

  // HEX <-> OKLCH
  it("converts hex to oklch and back", () => {
    const hex = "#42b0bf";
    const oklch = ColorConvertService.convertColor("hex", "oklch", hex);
    expectArrayCloseTo(parseOklch(oklch), [0.42, 0.25, 208], 0.05);
    const hexBack = ColorConvertService.convertColor("oklch", "hex", oklch);
    expect(hexBack).toBe("#42b0bf");
  });

  // HEX <-> LAB
  it("converts hex to lab and back", () => {
    const hex = "#bcb200";
    const lab = ColorConvertService.convertColor("hex", "lab", hex);
    expect(parseLab(lab)[0]).toBeCloseTo(71.25, 0.01);
    const hexBack = ColorConvertService.convertColor("lab", "hex", lab);
    expect(hexBack).toBe("#bcb200");
  });

  // HEX <-> CMYK
  it("converts hex to cmyk and back", () => {
    const hex = "#c9c9b1";
    const cmyk = ColorConvertService.convertColor("hex", "cmyk", hex);
    expectArrayCloseTo(parseCmyk(cmyk), [0, 0, 12, 21.3], 0.1);
    const hexBack = ColorConvertService.convertColor("cmyk", "hex", cmyk);
    expect(hexBack).toBe("#c9c9b1");
  });

  // Edge: alpha = 0
  it("handles fully transparent rgba to hex8", () => {
    const rgba = "rgba(0, 0, 0, 0)";
    const hex8 = ColorConvertService.convertColor("rgba", "hex", rgba);
    expect(hex8).toBe("#00000000");
    const rgbaBack = ColorConvertService.convertColor("hex8", "rgba", hex8);
    expect(rgbaBack).toBe("rgba(0,0,0,0)");
  });

  // Edge: alpha = 255
  it("handles fully opaque rgba to hex8", () => {
    const rgba = "rgba(255,255,255,255)";
    const hex8 = ColorConvertService.convertColor("rgba", "hex", rgba);
    expect(hex8).toBe("#ffffff");
    const rgbaBack = ColorConvertService.convertColor("hex", "rgba", hex8);
    expect(rgbaBack).toBe("rgba(255,255,255,255)");
  });

  // Edge: black
  it("handles black in rgb, hex, hsl", () => {
    const rgb = "rgb(0,0,0)";
    const hex = ColorConvertService.convertColor("rgb", "hex", rgb);
    expect(hex).toBe("#000000");
    const hsl = ColorConvertService.convertColor("rgb", "hsl", rgb);
    expect(hsl).toBe("hsl(0,0,0)");
  });

  // Edge: white
  it("handles white in rgb, hex, hsl", () => {
    const rgb = "rgb(255,255,255)";
    const hex = ColorConvertService.convertColor("rgb", "hex", rgb);
    expect(hex).toBe("#ffffff");
    const hsl = ColorConvertService.convertColor("rgb", "hsl", rgb);
    expect(hsl).toBe("hsl(0,0,100)");
  });

  // Out-of-gamut: clamp to displayable
  it("clamps out-of-gamut rgb to hex", () => {
    const rgb = "rgb(300,-20,500)";
    const hex = ColorConvertService.convertColor("rgb", "hex", rgb);
    expect(hex).toBe("#ff00ff");
  });

  // Invalid input: bad format
  it("throws on invalid rgb string", () => {
    expect(() => ColorConvertService.convertColor("rgb", "hex", "rgb(1,2)"))
      .toThrow();
  });

  // Invalid input: bad hex
  it("throws on invalid hex string", () => {
    expect(() => ColorConvertService.convertColor("hex", "rgb", "#12"))
      .toThrow();
  });

  // Error: unsupported source format
  it("throws on unsupported source format", () => {
    expect(() => ColorConvertService.convertColor("xyz", "hex", "xyz(1,2,3)"))
      .toThrow();
  });

  // Error: unsupported target format
  it("throws on unsupported target format", () => {
    expect(() => ColorConvertService.convertColor("rgb", "xyz", "rgb(1,2,3)"))
      .toThrow();
  });

  // Round-trip: hex -> rgba -> hex
  it("round-trips hex to rgba and back", () => {
    const hex = "#abcdef12";
    const rgba = ColorConvertService.convertColor("hex", "rgba", hex);
    const rgbaNums = rgba.match(/\d+/g)?.map(Number) ?? [];
    expectArrayCloseTo(rgbaNums, [171, 205, 239, 18], 2);
    const hexBack = ColorConvertService.convertColor("rgba", "hex", rgba);
    expect(hexBack).toBe("#abcdef12");
  });

  // Round-trip: cmyk -> hex -> cmyk
  it("round-trips cmyk to hex and back", () => {
    const cmyk = "cmyk(0%, 0%, 12%, 21.3%)";
    const hex = ColorConvertService.convertColor("cmyk", "hex", cmyk);
    expect(hex).toBe("#c9c9b1");
    const cmykBack = ColorConvertService.convertColor("hex", "cmyk", hex);
    expectArrayCloseTo(parseCmyk(cmykBack), parseCmyk(cmyk), 0.1);
  });
}); 