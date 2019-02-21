import Qty from "./constructor.js";
import { UNITY_ARRAY } from "./definitions.js";
import QtyError from "./error.js";
import { assign, compareArray } from "./utils.js";

assign(Qty.prototype, {
  isDegrees: function() {
    // signature may not have been calculated yet
    return (this.signature === null || this.signature === 400) &&
      this.numerator.length === 1 &&
      compareArray(this.denominator, UNITY_ARRAY) &&
      (this.numerator[0].match(/<temp-[CFRK]>/) || this.numerator[0].match(/<(kelvin|celsius|rankine|fahrenheit)>/));
  },

  isTemperature: function() {
    return this.isDegrees() && this.numerator[0].match(/<temp-[CFRK]>/);
  }
});

export function subtractTemperatures(lhs,rhs) {
  var lhsUnits = lhs.units();
  var rhsConverted = rhs.to(lhsUnits);
  var dstDegrees = Qty(getDegreeUnits(lhsUnits));
  return Qty({"scalar": lhs.scalar - rhsConverted.scalar, "numerator": dstDegrees.numerator, "denominator": dstDegrees.denominator});
}

export function subtractTempDegrees(temp,deg) {
  var tempDegrees = deg.to(getDegreeUnits(temp.units()));
  return Qty({"scalar": temp.scalar - tempDegrees.scalar, "numerator": temp.numerator, "denominator": temp.denominator});
}

export function addTempDegrees(temp,deg) {
  var tempDegrees = deg.to(getDegreeUnits(temp.units()));
  return Qty({"scalar": temp.scalar + tempDegrees.scalar, "numerator": temp.numerator, "denominator": temp.denominator});
}

function getDegreeUnits(units) {
  if (units === "K") {
    return "degK";
  }
  else if (units === "°C") {
    return "degC";
  }
  else if (units === "°F") {
    return "degF";
  }
  else if (units === "°R") {
    return "degR";
  }
  else {
    throw new QtyError("Unknown type for temp conversion from: " + units);
  }
}

export function toDegrees(src,dst) {
  var srcDegK = toDegK(src);
  var dstUnits = dst.units();
  var dstScalar;

  if (dstUnits === "degK") {
    dstScalar = srcDegK.scalar;
  }
  else if (dstUnits === "degC") {
    dstScalar = srcDegK.scalar ;
  }
  else if (dstUnits === "degF") {
    dstScalar = srcDegK.scalar * 9 / 5;
  }
  else if (dstUnits === "degR") {
    dstScalar = srcDegK.scalar * 9 / 5;
  }
  else {
    throw new QtyError("Unknown type for degree conversion to: " + dstUnits);
  }

  return Qty({"scalar": dstScalar, "numerator": dst.numerator, "denominator": dst.denominator});
}

function toDegK(qty) {
  var units = qty.units();
  var q;
  if (units.match(/(deg)[CFRK]/)) {
    q = qty.baseScalar;
  }
  else if (units === "K") {
    q = qty.scalar;
  }
  else if (units === "°C") {
    q = qty.scalar;
  }
  else if (units === "°F") {
    q = qty.scalar * 5 / 9;
  }
  else if (units === "°R") {
    q = qty.scalar * 5 / 9;
  }
  else {
    throw new QtyError("Unknown type for temp conversion from: " + units);
  }

  return Qty({"scalar": q, "numerator": ["<kelvin>"], "denominator": UNITY_ARRAY});
}

export function toTemp(src,dst) {
  var dstUnits = dst.units();
  var dstScalar;

  if (dstUnits === "K") {
    dstScalar = src.baseScalar;
  }
  else if (dstUnits === "°C") {
    dstScalar = src.baseScalar - 273.15;
  }
  else if (dstUnits === "°F") {
    dstScalar = (src.baseScalar * 9 / 5) - 459.67;
  }
  else if (dstUnits === "°R") {
    dstScalar = src.baseScalar * 9 / 5;
  }
  else {
    throw new QtyError("Unknown type for temp conversion to: " + dstUnits);
  }

  return Qty({"scalar": dstScalar, "numerator": dst.numerator, "denominator": dst.denominator});
}

export function toTempK(qty) {
  var units = qty.units();
  var q;
  if (units.match(/(deg)[CFRK]/)) {
    q = qty.baseScalar;
  }
  else if (units === "K") {
    q = qty.scalar;
  }
  else if (units === "°C") {
    q = qty.scalar + 273.15;
  }
  else if (units === "°F") {
    q = (qty.scalar + 459.67) * 5 / 9;
  }
  else if (units === "°R") {
    q = qty.scalar * 5 / 9;
  }
  else {
    throw new QtyError("Unknown type for temp conversion from: " + units);
  }

  return Qty({"scalar": q, "numerator": ["<temp-K>"], "denominator": UNITY_ARRAY});
}
