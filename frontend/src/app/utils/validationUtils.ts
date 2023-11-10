export class ValidationUtils {
  public static CleanInputWhileWritingANumber(input: string, allowNA: boolean = false) {
    if (allowNA && (input.toUpperCase() === 'NA' || input.toUpperCase() === 'N')) {
      return 'NA';
    }

    // Define the regex pattern for all possible parts of a valid number while typing
    const validNumberPatternOnPartsOfWholeNumberString = /^(-)|(?:(?:\d+[\.,]\d*)|(?:\.\d+)|(?:\d+))(?:[eE])?([+-]?\d+)?$/;

    // Split input into parts that are valid and invalid
    const parts = input.split(/([+-]{0,1}?[\d.eE-]+)/).filter(Boolean);

    // Rebuild the string with only valid parts
    let cleanedInput = parts.map(part => (validNumberPatternOnPartsOfWholeNumberString.test(part) ? part : '')).join('');

    // Test the entire rebuilt string to ensure it's a valid number overall
    if (!validNumberPatternOnPartsOfWholeNumberString.test(cleanedInput)) {
      cleanedInput = ''; // If overall input isn't valid, return an empty string
    }

    return cleanedInput;
  }

  public static CleanInputWholeNumberString(input) {
    const validNumberPatternOnWholeNumberString = /^[+-]{0,1}?(?:(?:\d+\.\d*)|(?:\.\d+)|(?:\d+))(?:[eE][+-]?\d+)?$/g;

    return validNumberPatternOnWholeNumberString.test(input);
  }
}
