// Adapted from https://medium.com/@GeorgePerry/finding-intent-to-buy-from-instagram-comments-with-tensorflow-js-3f764c132be7
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

// Maybe easier if WebDB?
const todos = [
{
	"subject": "math",
	"note": "calculating derivitives ws"
}, {
	"subject": "math",
	"note": "parametrics ws"
}, {
	"subject": "science",
	"note": "research atmosphere"
}, {
	"subject": "science",
	"note": "evolution lab"
}, {
	"subject": "science",
	"note": "science audience assignment"
}, {
	"subject": "science",
	"note": "work on sci presentation"
}
];

const new_todo = [
{
	"subject": "science",
	"note": "practice presentation"
}
]

function encodeData(data) {
    const sentences = data.map(todo => todo.note.toLowerCase());
    const trainingData = use.load()
        .then(model => {
            return model.embed(sentences)
                .then(embeddings => {
                    return embeddings;
                });
        })
        .catch(err => console.error('Fit Error:', err));

    return trainingData;
}

const allSubjects = [...todos.reduce((acc, item) => acc.add(item.subject), new Set())];
const outputData = tf.tensor2d(todos.map(todo => allSubjects.map(sbj => sbj == todo.subject ? 1 : 0)));


const model = tf.sequential();

// Add layers to the model
model.add(tf.layers.dense({
    inputShape: [512],
    activation: 'sigmoid',
    units: allSubjects.length,
}));

model.add(tf.layers.dense({
    inputShape: [allSubjects.length],
    activation: 'sigmoid',
    units: allSubjects.length,
}));

model.add(tf.layers.dense({ 
    inputShape: [allSubjects.length],
    activation: 'sigmoid',
    units: allSubjects.length,
}));

// Compile the model
model.compile({
    loss: 'meanSquaredError',
    optimizer: tf.train.adam(.06), // This is a standard compile config
});


function run() {
    Promise.all([
        encodeData(todos),
        encodeData(new_todo)
    ])
    .then(data => {
        const {
            0: training_data,
            1: testing_data,
        } = data;

        model.fit(training_data, outputData, {
			epochs: 200,
			callbacks: { onEpochEnd: (_, logs) => console.log("LOSS", logs.loss) }
		}).then(history => {
			model.predict(testing_data).print();
		});
    })
    .catch(err => console.log('Prom Err:', err));
};

// Call function
console.log("training...", allSubjects);
run();

// TODO: Simulate adding more data

debugger;

// TODO: auto-match if contains subject name