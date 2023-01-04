/* global miro */

var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
    // This function will display the specified tab of the form ...
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    // ... and fix the Previous/Next buttons:
    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } else {
        document.getElementById("nextBtn").innerHTML = "Next";
    }
    // ... and run a function that displays the correct step indicator:
    fixStepIndicator(n)
}

/** Initialises UI, adds controls and listeners */
async function init() {
    console.log("initialising module");
    const generateButton = document.getElementById("generate");

    generateButton.addEventListener("click", generate, false);

    /** Regenerates blob with defined edges */
    async function generate() {
        const viewport = await miro.board.viewport.get()

        const myInit = {
            method: 'GET',
        };

        const myRequest = new Request(`/list-lens-review-improvements`);

        fetch(myRequest, myInit)
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                const questionTitleList = data.ImprovementSummaries.map(summary => {
                    return {
                        questionTitle: summary.QuestionTitle,
                        improvementPlanUrl: summary.ImprovementPlanUrl,
                        pillarId: summary.PillarId,
                        risk: summary.Risk,
                        questionId: summary.QuestionId
                    }
                })

                createStickies(viewport.x,viewport.y, 100, questionTitleList)
            });
    }

}

async function createStickies(xStart,yStart, delay, stickyList){

    const stickyWidth = 200;

    const rowLength = 3;

    //starting position
    var xOffset = xStart + 0;
    var yOffset = yStart + 0;

    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    //create stickies according to sticky list
    stickyList.forEach(function(sticky,index) {

        //if we don't have a timeout here all stickies will be created at once
        setTimeout(function () {
            if (!(index % rowLength)){
                yOffset = yOffset + stickyWidth;
                xOffset = xStart + 0;
            }

            let themeColour = "#c9df56" //green

            if (sticky.risk == 'HIGH'){
                themeColour = "#f16c7f" //red
            }

            if (sticky.risk == 'MEDIUM'){
                themeColour = "#ff9d48" //orange
            }

            miro.board.createCard({
                title: sticky.questionTitle,
                description: `${sticky.pillarId}\n${sticky.improvementPlanUrl}`,
                dueDate: '2025-08-18',
                style: {
                    cardTheme: themeColour, // Default color: light blue
                },
                x: xOffset, // Default value: horizontal center of the board
                y: yOffset, // Default value: vertical center of the board
                width: 320,
                rotation: 0.0,
            });


            xOffset = xOffset + stickyWidth;

        }, index * delay);

    });
}

init();
