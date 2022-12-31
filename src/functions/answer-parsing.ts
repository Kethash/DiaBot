import FuzzySet from 'fuzzyset';

export function formatString(string: string): string {
    string = string.trim();
    string = string.replace(/\s/g, '')
    const charsToRemove = ['.','~','?','・','!','*','&','!','→',':','-','♡','(',')','μ','?','！','☆','☆'];
    charsToRemove.forEach((char) => string = string.replace(char, ''))
    return string.toLowerCase();
}


export function compareAnswers(answer1: string, answer2: string, isStrict: boolean): boolean {
    let answerFormatted1 = formatString(answer1)
    let answerFormatted2 = formatString(answer2)
    
    // console.log('answerformatted1', answerFormatted1);
    // console.log('answerformatted2', answerFormatted2);
    
    const fuzzySet = FuzzySet([answerFormatted1]);
    // console.log(fuzzySet);
    // console.log('FUZZYSET', fuzzySet.get(answerFormatted2));
    
    if (isStrict) {
        return answerFormatted1 === answerFormatted2;
    } else {
        const result = FuzzySet([answerFormatted1]).get(answerFormatted2);
        //@ts-ignore
        return result === null ? false : result[0][0] >= 0.8;
    }
}