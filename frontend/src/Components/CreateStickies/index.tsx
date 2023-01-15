export async function createStickies(xStart, yStart, delay, stickyList) {
    const stickyWidth = 200

    const rowLength = 3

    //starting position
    var xOffset = xStart + 0
    var yOffset = yStart + 0

    const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

    //create stickies according to sticky list
    stickyList.forEach(function (sticky: unknown, index: number) {
        //if we don't have a timeout here all stickies will be created at once
        setTimeout(function () {
            if (!(index % rowLength)) {
                yOffset = yOffset + stickyWidth
                xOffset = xStart + 0
            }

            let themeColour = '#c9df56' //green

            if (sticky.risk == 'HIGH') {
                themeColour = '#f16c7f' //red
            }

            if (sticky.risk == 'MEDIUM') {
                themeColour = '#ff9d48' //orange
            }

            // @ts-ignore
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
            })

            xOffset = xOffset + stickyWidth
        }, index * delay)
    })
}
