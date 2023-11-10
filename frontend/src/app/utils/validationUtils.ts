export class ValidationUtils {
  public static TestInputWhileWritingANumber(input: string, allowNA: boolean = false) {
    if (allowNA && (input.toUpperCase() === 'NA' || input.toUpperCase() === 'N')) {
      return 'NA';
    }

    const startString = '^';
    const startingWithMinusOrPlus = '[-+]?';
    const numbersWithOptionalDecimal = '[0-9]*[.]?[0-9]*';
    const exponent = '[eE]?';
    const exponentSign = '[+-]?';
    const exponentNumbers = '[0-9]*';
    const endString = '$';

    const validNumberPatternOnPartsOfWholeNumberString = startString + startingWithMinusOrPlus + numbersWithOptionalDecimal + exponent + exponentSign + exponentNumbers + endString;

    return new RegExp(validNumberPatternOnPartsOfWholeNumberString).test(input);
  }

  public static TestInputWholeNumberString(input, allowNA: boolean = false) {
    if (allowNA && input.toUpperCase() === 'NA') {
      return true;
    }

    const startString = '^';
    const startingWithMinusOrPlus = '[-+]?';
    const numbersWithoutDecimal = '[0-9]+';
    const numbersWithDecimal = '[0-9]+[.][0-9]+';
    const exponent = '[eE]';
    const exponentSign = '[+-]?';
    const exponentNumbers = '[0-9]';
    const endString = '$';

    const numberPart = '((' + numbersWithoutDecimal + ')|(' + numbersWithDecimal + '))';

    const exponentPart = '(' + exponent + exponentSign + exponentNumbers + ')?';

    const validNumberPatternOnWholeNumberString = startString + startingWithMinusOrPlus + numberPart + exponentPart + endString;

    return new RegExp(validNumberPatternOnWholeNumberString).test(input);
  }
}
