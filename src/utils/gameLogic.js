export const COMPARE_RESULT = {
    CORRECT: 'correct',
    WRONG: 'wrong',
    PARTIAL: 'partial',
    HIGHER: 'higher',
    LOWER: 'lower',
};

// Colors for tailwind classes
export const RESULT_COLORS = {
    [COMPARE_RESULT.CORRECT]: 'bg-green-500',
    [COMPARE_RESULT.WRONG]: 'bg-red-500',
    [COMPARE_RESULT.PARTIAL]: 'bg-yellow-500',
};

/**
 * Compare two Waifus and return the status for each attribute.
 * @param {object} guess - The Waifu object guessed by the user.
 * @param {object} target - The daily target Waifu object.
 * @returns {object} - Object containing result status for each field.
 */
export function compareWaifu(guess, target) {
    return {
        source: compareString(guess.source, target.source),
        hair_color: compareString(guess.hair_color, target.hair_color),
        eyes_color: compareString(guess.eyes_color, target.eyes_color),
        age: compareNumeric(guess.age, target.age),
        height: compareNumeric(guess.height, target.height),
        affiliations: compareString(guess.affiliations, target.affiliations),
    };
}

function compareString(guessVal, targetVal) {
    if (!guessVal || !targetVal) return COMPARE_RESULT.WRONG; // Handle nulls safely
    if (guessVal === targetVal) return COMPARE_RESULT.CORRECT;
    return COMPARE_RESULT.WRONG;
}

function compareNumeric(guessVal, targetVal) {
    if (guessVal === null || targetVal === null) return COMPARE_RESULT.WRONG; // Handle nulls
    if (guessVal === targetVal) return COMPARE_RESULT.CORRECT;
    if (targetVal > guessVal) return COMPARE_RESULT.HIGHER;
    return COMPARE_RESULT.LOWER;
}
