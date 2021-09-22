import jaroWinkler from './jaroWinkler.js';

// TODO: everything else should beat out 'study'
const hwTypeVocab = ['homework', 'test', 'worksheet', 'study', 'read', 'paper', 'presentation', 'lab', 'final', 'midterm', 'quiz', 'project'];


function findMostSimilar(target, vocab) {
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

function count(str, regex) {
	return (str.match(regex) || []).length;
}

const assignment = prompt("Assignment")
let [hwCat, _] = findMostSimilar(assignment, hwTypeVocab);
// 'homework' synonyms
if (hwCat == 'worksheet') hwCat = 'homework';
// TODO: research -> read
console.log(hwCat);
console.log("priority:", Math.min(count(assignment, /!/g), 3));

debugger;