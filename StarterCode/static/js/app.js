// Files were written and debugged at https://codepen.io/tritchlin/pen/85445ef61adcd8fe10414ad77a62234c

// Step 1: Plotly
// Use the D3 library to read in samples.json.

// State variables
const personIds = []; // [123, 124, 125, ...]
const otusByPersonId = {}; // {123: [{otuId: 23, label: "bacteria", sampleValue: 456}, {...}, ...], 124: ..., ...}
const metadataByPersonId = {}; // {123: {ethnicity: "caucasian", gender: "female", ...}, 124: ..., ...}

d3.json("https://assets.codepen.io/6677279/samples.json").then(function (
    rawdata
) {
    const collectedData = joincharts(rawdata);

    // "Publish" parsed data to global variables
    collectedData.forEach((personData) => {
        personIds.push(personData.id);
        otusByPersonId[personData.id] = toOtuData(personData.sample);
        metadataByPersonId[personData.id] = personData.meta;
    });

    updateDropdown();
});

function toOtuData(sampleData) {
    return sampleData.otu_ids
        .map((otuId, index) => {
            return {
                otuId: otuId,
                label: sampleData.otu_labels[index],
                sampleValue: sampleData.sample_values[index]
            };
        })
        .sort((a, b) => b.sampleValue - a.sampleValue);
}

function updateDropdown() {
    d3.select("#selDataset")
        .selectAll("option")
        .data(personIds)
        .enter()
        .append("option")
        .text((d) => d)
        .attr("value", (d) => d);

    onPersonSelect(personIds[0]);
}

function joincharts(input_data) {
    const collected_data = [];
    input_data.names.forEach((name) => {
        const id = parseInt(name);
        const meta = input_data.metadata.find((x) => x.id === id);
        const sample = input_data.samples.find((x) => x.id === name);
        collected_data.push({
            id: id,
            meta: meta,
            sample: sample
        });
    });
    return collected_data;
}

// Create a horizontal bar chart with a dropdown menu to display the {{top 10 OTUs}} found in that individual.
// Use {{sample_values}} as the values for the bar chart.
// Use {{otu_ids}} as the labels for the bar chart.
// Use {{otu_labels}} as the hovertext for the chart.

function init() {
    var trace1 = [
        {
            x: [],
            y: [],
            labels: [],
            type: "bar",
            orientation: "h",
            marker: {
                color: "rgb(0,0,0153)"
            }
        }
    ];
    var layout = {
        font: {
            family: "Gill Sans, sans-serif"
        },
        showlegend: false,
        xaxis: {
            tickangle: 0
        },
        yaxis: {
            zeroline: false,
            gridwidth: 2
        },
        bargap: 0.3
    };
    Plotly.newPlot("bar", trace1, layout);

    var trace2 = [{
            x: [],
            y: [],
            text: [],
            mode: 'markers',
            marker: {
                size: [],
                sizemode: 'area',
                color: []
            },
        }];
    var layout2 = {
        title: 'Bubble Chart Hover Text',
        showlegend: false,
        height: 600,
        width: 600
    };

    Plotly.newPlot('bubble', trace2, layout2);
};

function updateBarChart(barChartPersonId) {
    const topTenPersonOtuData = otusByPersonId[barChartPersonId].slice(0, 10).reverse();
    const sampleValues = topTenPersonOtuData.map((x) => x.sampleValue);
    const otuIds = topTenPersonOtuData.map((x) => "OTU " + x.otuId);
    const otuLabels = topTenPersonOtuData.map((x) => x.label);

    const update = {
        x: [sampleValues],
        y: [otuIds],
        hovertext:[otuLabels]
    };
    Plotly.update("bar", update);
};

// This function is called when a dropdown menu item is selected
function onPersonSelect(selectedPersonId) {
    updateBarChart(parseInt(selectedPersonId));
    updateBubbleChart(parseInt(selectedPersonId));
    document.getElementById("sample-metadata").innerHTML = updateMetadata(parseInt(selectedPersonId));
};

// Call onPersonSelect when a change takes place to the DOM
d3.selectAll("#selDataset").on("change", onPersonSelect);

// Create a bubble chart that displays each sample.
// Use {{otu_ids}} for the x values.
// Use {{sample_values}} for the y values.
// Use {{sample_values}} for the marker size.
// Use {{otu_ids}} for the marker colors.
// Use {{otu_labels}} for the text values.

function updateBubbleChart(BubbleChartPersonId) {
    const PersonOtuData = otusByPersonId[BubbleChartPersonId];
    const sampleValues = PersonOtuData.map((x) => x.sampleValue);
    const otuIds = PersonOtuData.map((x) => x.otuId);
    const otuLabels = PersonOtuData.map((x) => x.label);
    
    const update = {
        x: [otuIds],
        y: [sampleValues],
        text:[otuLabels],
        marker: {
            size: sampleValues,
            color: otuIds
        },
    };
    Plotly.update("bubble", update);
};
// Display the sample metadata, i.e., an individual's demographic information.

function updateMetadata(MetadataPersonID){
    var metadata = metadataByPersonId[MetadataPersonID]
    // var paneldata = {
    //     "id": metadata.id,
    //     "ethnicity": metadata.ethnicity,
    //     "gender": metadata.gender,
    //     "age": metadata.age,
    //     "location": metadata.location,
    //     "bbtype": metadata.bbtype,
    //     "wfreq": metadata.wfreq
    // };
    var html = `
        <p><strong>id:</strong> ${metadata.id}</p>
        <p><strong>ethnicity:</strong> ${metadata.ethnicity}</p>
        <p><strong>gender:</strong> ${metadata.gender}</p>
        <p><strong>age:</strong> ${metadata.age}</p>
        <p><strong>location:</strong> ${metadata.location}</p>
        <p><strong>bbtype:</strong> ${metadata.bbtype}</p>
        <p><strong>wfreq:</strong> ${metadata.wfreq}</p>
        `;
    return html;
};



// Display each key-value pair from the metadata JSON object somewhere on the page.

// Update all of the plots any time that a new sample is selected.

// Advanced Challenge Assignment (Optional)
// The following task is advanced and therefore optional.
// Adapt the Gauge Chart from https://plot.ly/javascript/gauge-charts/ to plot the weekly washing frequency of the individual.
// You will need to modify the example gauge code to account for values ranging from 0 through 9.
// Update the chart whenever a new sample is selected.

init();