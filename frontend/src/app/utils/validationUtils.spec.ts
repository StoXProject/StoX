import { ValidationUtils } from './validationUtils';

describe('ValidationUtils for numbers', () => {
  it('should allow partial number while typing', () => {
    const numbersUnderTest = ['-', '-1', '1e', '1e1', '+1', '1.1', '1.1e', '1.1e1', '1.1e+1'];
    numbersUnderTest.forEach(nut => {
      expect(ValidationUtils.TestInputWhileWritingANumber(nut))
        .withContext('number: ' + nut)
        .toEqual(true);
    });
  });

  it('should allow a whole number string in final check', () => {
    const numbersUnderTest = ['-1', '1e1', '+1', '1.1', '1.1e1', '1.1e+1'];
    numbersUnderTest.forEach(nut => {
      expect(ValidationUtils.TestInputWholeNumberString(nut))
        .withContext('number: ' + nut)
        .toEqual(true);
    });
  });

  it('should return false on wrong last character partial while typing', () => {
    const numbersUnderTest = ['-1,', '1e1F'];
    numbersUnderTest.forEach(nut => {
      expect(ValidationUtils.TestInputWhileWritingANumber(nut))
        .withContext('number: ' + nut)
        .toEqual(false);
    });
  });

  it('should return false for final check on wrongly typed number', () => {
    const numbersUnderTest = ['-1,', '1e1F', '-1.', '1e', '+1.'];
    numbersUnderTest.forEach(nut => {
      expect(ValidationUtils.TestInputWholeNumberString(nut))
        .withContext('number: ' + nut)
        .toEqual(false);
    });
  });
});

describe('validationUtils test for NA', () => {
  it('should allow N or NA while typing', () => {
    const numbersUnderTest = ['NA', 'N'];
    numbersUnderTest.forEach(nut => {
      expect(ValidationUtils.TestInputWhileWritingANumber(nut, true))
        .withContext('number: ' + nut)
        .toEqual('NA');
    });
  });
  it('should allow only allow NA for final check', () => {
    const numbersUnderTest = ['NA'];
    numbersUnderTest.forEach(nut => {
      expect(ValidationUtils.TestInputWholeNumberString(nut, true))
        .withContext('number: ' + nut)
        .toEqual(true);
    });
  });

  it('should return false on wrong last character partial while typing', () => {
    const numbersUnderTest = ['NA,', 'NAF'];
    numbersUnderTest.forEach(nut => {
      expect(ValidationUtils.TestInputWhileWritingANumber(nut, true))
        .withContext('number: ' + nut)
        .toEqual(false);
    });
  });

  it('should return false for final check', () => {
    const numbersUnderTest = ['N', 'NA,', 'NAF', 'NA.', 'NAe'];
    numbersUnderTest.forEach(nut => {
      expect(ValidationUtils.TestInputWholeNumberString(nut, true))
        .withContext('number: ' + nut)
        .toEqual(false);
    });
  });
});
