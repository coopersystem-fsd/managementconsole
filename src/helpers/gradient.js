function zeroFill(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return [width + (/\./.test(number) ? 2 : 1)].join('0') + number;
  }
  return number;
}

function hexToRgb(hex) {
  // Remove the hash if given
  hex = hex.replace('#', '');
  // If invalid code given return white
  if (hex.length !== 3 && hex.length !== 6) {
    return [255, 255, 255];
  }
  // Double up charaters if only three suplied
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  // Convert to [r,g,b] array
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return [r, g, b];
}

function rgbToHex(color) {
  // Set boundries of upper 255 and lower 0
  color[0] = (color[0] > 255) ? 255 : (color[0] < 0) ? 0 : color[0];
  color[1] = (color[1] > 255) ? 255 : (color[1] < 0) ? 0 : color[1];
  color[2] = (color[2] > 255) ? 255 : (color[2] < 0) ? 0 : color[2];

  return zeroFill(color[0].toString(16), 2) +
    zeroFill(color[1].toString(16), 2) +
    zeroFill(color[2].toString(16), 2);
}

export default function generateGradient(colorA, colorB, steps) {
  const result = [];

  colorA = hexToRgb(colorA); // [r,g,b]
  colorB = hexToRgb(colorB); // [r,g,b]
  steps -= 1; // Reduce the steps by one because we're including the first item manually

  // Calculate the intervals for each color
  const rStep = (Math.max(colorA[0], colorB[0]) - Math.min(colorA[0], colorB[0])) / steps;
  const gStep = (Math.max(colorA[1], colorB[1]) - Math.min(colorA[1], colorB[1])) / steps;
  const bStep = (Math.max(colorA[2], colorB[2]) - Math.min(colorA[2], colorB[2])) / steps;

  result.push(`#${rgbToHex(colorA)}`);

  // Set the starting value as the first color value
  let rVal = colorA[0];
  let gVal = colorA[1];
  let bVal = colorA[2];

  // Loop over the steps-1 because we're includeing the last value
  // manually to ensure it's accurate
  for (let i = 0; i < (steps - 1); i += 1) {
    // If the first value is lower than the last - increment up otherwise increment down
    rVal = (colorA[0] < colorB[0]) ? rVal + Math.round(rStep) : rVal - Math.round(rStep);
    gVal = (colorA[1] < colorB[1]) ? gVal + Math.round(gStep) : gVal - Math.round(gStep);
    bVal = (colorA[2] < colorB[2]) ? bVal + Math.round(bStep) : bVal - Math.round(bStep);
    result.push(`#${rgbToHex([rVal, gVal, bVal])}`);
  }

  result.push(`#${rgbToHex(colorB)}`);

  return result;
}
