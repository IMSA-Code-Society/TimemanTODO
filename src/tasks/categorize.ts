import jaroWinkler from './jaroWinkler.js';

// TODO: everything else should beat out 'study'
// TODO: research & worksheet are synonyms, don't show to user
// TODO: essay synonym for paper
export const hwTypeVocab = [
	'homework', 'test', 'worksheet',
	'study', 'research', 'read',
	'paper', 'presentation', 'lab',
	'final', 'midterm', 'quiz', 'project'
] as const;

// TODO: a way to define synonyms
export function findMostSimilar<T extends readonly string[]>(target: T[number], vocab: T) {
	let maxCat;
	let DEBUG_maxCat;  // What the algorithm thought was most similar
	let maxSimilarity = 0;
	const input = target.replaceAll(/[^\w]/g, ' ').trim().toLowerCase();
	// O(n^2), can be faster?
	for (const word of input.split(" ")) {
		for (const keyword of vocab) {
			const similarity = jaroWinkler(keyword, word);
			if (similarity > maxSimilarity) {
				maxCat = keyword;
				DEBUG_maxCat = word;
				maxSimilarity = similarity;
			}
		}
	}
	console.log(maxCat, "==", DEBUG_maxCat, maxSimilarity);
	return [maxCat, maxSimilarity];
}

// Count regular expression matches, default to 0
export function count(str: string, regex: RegExp | string) {
	return (str.match(regex) || []).length;
}
