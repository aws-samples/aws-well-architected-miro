interface Answer {
    Reason: string
    QuestionTitle: string
    ImprovementPlanUrl: string
    PillarId: string
    Risk: string
    QuestionId: string
    Choices: Choice[]
    SelectedChoices: string[]
    ChoiceAnswerSummaries: ChoiceAnswerSummary[]
}

interface Choice {
    ChoiceId: string
    Description: string
    Title: string
}

interface ChoiceAnswerSummary {
    ChoiceId: string
    Reason: string
    Status: string
}

const createStickies = (
    xStart: number,
    yStart: number,
    answers: Answer[]
) => {
    const stickyWidth = 450
    const rowLength = 3
    const cardStack: any[] = []

    //starting position
    let xOffset = xStart
    let yOffset = yStart


    //create stickies according to answers list
    answers.map((answer: Answer, index: number) => {
        //if we don't have a timeout here all stickies will be created at once
        if (!(index % rowLength)) {
            yOffset = yOffset + stickyWidth / 2.5
            xOffset = xStart
        }

        let themeColour = '#c9df56' //green

        if (answer.Risk == 'HIGH') {
            themeColour = '#f16c7f' //red
        }

        if (answer.Risk == 'MEDIUM') {
            themeColour = '#ff9d48' //orange
        }

        // @ts-ignore
        const card = miro.board.createCard({
            title: answer.QuestionTitle,
            description: answer.PillarId,
            style: {
                cardTheme: themeColour, // Default color: light blue
            },
            x: xOffset,
            y: yOffset,
            width: 400,
            rotation: 0.0,
        })
        cardStack.push(card)
        xOffset = xOffset + stickyWidth
    })

    // @ts-ignore
    Promise.all(cardStack).then(async (c) => {await miro.board.viewport.zoomTo(c);})

    return 'done'
}

export const createAnswerCards = async (answers: Answer[]) => {
    // @ts-ignore
    const viewport = await miro.board.viewport.get()
    const appPanelWidth = 200
    const xStart = viewport.x + viewport.width / 2 + appPanelWidth
    const yStart = viewport.y + viewport.height / 2

    await createStickies(xStart, yStart, answers)
}
