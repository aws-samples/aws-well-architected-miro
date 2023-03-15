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

const createStickies = async (
    xStart: number,
    yStart: number,
    answers: Answer[]
) => {
    const stickyWidth = 350
    const rowLength = 3

    //starting position
    let xOffset = xStart
    let yOffset = yStart

    //create stickies according to answers list
    answers.map((answer: Answer, index: number) => {
        //if we don't have a timeout here all stickies will be created at once
        if (!(index % rowLength)) {
            yOffset = yOffset + stickyWidth / 2
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
        miro.board.createCard({
            title: answer.QuestionTitle,
            description: answer.PillarId,
            dueDate: '2025-08-18',
            style: {
                cardTheme: themeColour, // Default color: light blue
            },
            x: xOffset, // Default value: horizontal center of the board
            y: yOffset, // Default value: vertical center of the board
            width: 320,
            rotation: 0.0,
        })

        xOffset = xOffset + stickyWidth
    })
}

export const createAnswerCards = async (answers: Answer[]) => {
    // @ts-ignore
    const viewport = await miro.board.viewport.get()

    await createStickies(viewport.x, viewport.y, answers)
}
