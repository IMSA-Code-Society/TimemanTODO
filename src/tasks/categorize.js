import jaroWinkler from './jaroWinkler.js';

// TODO: everything else should beat out 'study'
// TODO: research & worksheet are synonyms, don't show to user
// TODO: essay synonym for paper
export const hwTypeVocab = ['homework', 'test', 'worksheet', 'study', 'research', 'read', 'paper', 'presentation', 'lab', 'final', 'midterm', 'quiz', 'project'];

// TODO: a way to define synonyms
export function findMostSimilar(target, vocab) {
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

export function count(str, regex) {
	return (str.match(regex) || []).length;
}
