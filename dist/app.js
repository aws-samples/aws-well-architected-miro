/* global miro */

//  AWS Stack output https://2qq7zkhooe.execute-api.eu-north-1.amazonaws.com/prod/
let URI = "" //need to get from the input
let REGION = "eu-north-1" //need to create UI dropdown on the page
let TOKEN = ""
let WORKLOAD_ID = "51dbee7d651de15ab74e145620e1f34c" //need to get from request
let LENS = "wellarchitected" //need to get from request

const AWS_REGIONS = [
    {region: 'us-east-1', name: 'US East (N. Virginia)'},
    {region: 'us-east-2', name: 'US East (Ohio)'},
    {region: 'us-west-1', name: 'US West (N. California)'},
    {region: 'us-west-2', name: 'US West (Oregon)'},
    {region: 'ca-central-1', name: 'Canada (Central)'},
    {region: 'af-south-1', name: 'Africa (Cape Town)'},
    {region: 'ap-east-1', name: 'Asia Pacific (Hong Kong)'},
    {region: 'ap-south-1', name: 'Asia Pacific (Mumbai)'},
    {region: 'ap-northeast-3', name: 'Asia Pacific (Osaka-Local)'},
    {region: 'ap-northeast-2', name: 'Asia Pacific (Seoul)'},
    {region: 'ap-southeast-1', name: 'Asia Pacific (Singapore)'},
    {region: 'ap-southeast-2', name: 'Asia Pacific (Sydney)'},
    {region: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)'},
    {region: 'cn-north-1', name: 'China (Beijing)'},
    {region: 'cn-northwest-1', name: 'China (Ningxia)'},
    {region: 'eu-central-1', name: 'Europe (Frankfurt)'},
    {region: 'eu-central-2', name: 'Europe (Zurich)'},
    {region: 'eu-west-1', name: 'Europe (Ireland)'},
    {region: 'eu-west-2', name: 'Europe (London)'},
    {region: 'eu-south-1', name: 'Europe (Milan)'},
    {region: 'eu-west-3', name: 'Europe (Paris)'},
    {region: 'eu-south-2', name: 'Europe (Spain)'},
    {region: 'eu-north-1', name: 'Europe (Stockholm)'},
    {region: 'me-central-1', name: 'Middle East (UAE)'},
    {region: 'me-south-1', name: 'Middle East (Bahrain)'},
    {region: 'sa-east-1', name: 'South America (São Paulo)'},
]

function setEndpoint(event){
    console.log("setting URI to: ", apiUriInput.value)
    URI = apiUriInput.value
    createWorkloadButtons()
    openTab(event, 'step-3')
}

function deployFlow(event){
    console.log("Deploying Template ", apiUriInput.value)
    openTab(event, 'step-2')
}

function alreadyDeployedFlow(event){
    console.log("Already Deployed, moving to next step", apiUriInput.value)
    openTab(event, 'step-2')
}

const setEndpointButton = document.getElementById("set-endpoint-button");
setEndpointButton.addEventListener("click", setEndpoint, false);

const apiUriInput = document.getElementById("api-uri-input");

const deployButton = document.getElementById("deploy-button");
deployButton.addEventListener("click", deployFlow, false);

const alreadyDeployedButton = document.getElementById("already-deployed-button");
alreadyDeployedButton.addEventListener("click", alreadyDeployedFlow, false);

const workloadButtons = document.getElementsByClassName("workload-button");

workloadButtons[0].addEventListener("click", createWorkloadCards, false);


/** Initialises UI, adds controls and listeners */
async function init() {
    console.log("initialising module");

    TOKEN = await miro.board.getIdToken()
    //const generateButton = document.getElementById("generate");

    //generateButton.addEventListener("click", generate, false);

}

const getWorkloadList = async(uri, region, token) => {
    const config = {
        method: 'GET',
        bearer: `Bearer ${token}`
    };

    const response = await fetch(`${uri}${region}/get_wl_list`, config);
    const workloadList = await response.json();
    return workloadList;
}

const getWorkload = async(uri, region, token, workloadId) => {
    const config = {
        method: 'GET',
        bearer: `Bearer ${token}`
    };

    const response = await fetch(`${uri}${region}/get_wl/${WORKLOAD_ID}`, config);
    const workload = await response.json();
    return workload;
}

const getAnswers = async(uri, region, token, workloadId, lens) => {
    const config = {
        method: 'GET',
        bearer: `Bearer ${token}`
    };

    const response = await fetch(`${URI}${REGION}/get_answers/${workloadId}/lens/${lens}`, config);
    const answers = await response.json();
    return answers;
}

const onBoard = async(uri, region, token) => {
    const config = {
        method: 'POST',
        bearer: `Bearer ${token}`
    };

    const response = await fetch(`${URI}${REGION}/onboard`, config);
    const status = await response.json();
    return status;
}

async function createWorkloadButtons(){
    const parentElem = document.getElementById('step-3');

    const workloadList = await getWorkloadList(URI,REGION,TOKEN)
    console.log(workloadList)

    workloadList.workflowList.map(workload => {
        /*const child =
        `<div class="cs1 ce12" style="padding: var(--space-small);">
             <button class="button button-primary workload-button" type="button" onclick="createWorkloadCards" id="${workload.WorkloadId}">
              ${workload.WorkloadName}
            </button>
        </div>`*/

        const child = document.createElement('div');
        child.className = "cs1 ce12";
        child.style = "padding: var(--space-small);"

        const btn = document.createElement('button');
        btn.className = "button button-primary workload-button";
        btn.innerHTML = workload.WorkloadName;
        WORKLOAD_ID = workload.workloadId
        LENS = workload.Lenses[0]

        // Add the event listener
        btn.addEventListener('click', createWorkloadCards());

        // Append the button to the created card
        child.appendChild(btn);

        parentElem.appendChild(child);
    })
}

async function createWorkloadCards(){
    const viewport = await miro.board.viewport.get()

    const answers = await getAnswers(URI, REGION, TOKEN, WORKLOAD_ID, LENS)

    console.log('answers =>', answers)

    const questionTitleList = answers.answersList.map(summary => {
        return {
            questionTitle: summary.QuestionTitle,
            improvementPlanUrl: summary.ImprovementPlanUrl,
            pillarId: summary.PillarId,
            risk: summary.Risk,
            questionId: summary.QuestionId
        }
    })

    createStickies(viewport.x,viewport.y, 100, questionTitleList)
}

function openTab(event,tabType){
    const tabcontent = document.getElementsByClassName("grid");
    let i;
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    const tabs = document.getElementsByClassName("tab");

    for (i = 0; i < tabs.length; i++) {
        tabs[i].className = tabs[i].className.replace(" tab-active", "");
    }

    document.getElementById(tabType).style.display = "flex";

    document.getElementById(`${tabType}-tab`).className += " tab-active";
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
