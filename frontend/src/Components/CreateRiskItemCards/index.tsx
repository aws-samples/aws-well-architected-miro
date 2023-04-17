interface RiskItem {
    title: string,
    description: string,
    risk: string,
}
const createStickies = async (
    xStart: number,
    yStart: number,
    riskItems: RiskItem[]
) => {
    const stickyWidth = 450
    const rowLength = 3
    const cardStackTill50: any[] = []
    const cardStackRest: any[] = []

    //starting position
    let xOffset = xStart
    let yOffset = yStart

    //create stickies according to answers list
    riskItems.map((riskItem: RiskItem, index: number) => {
        //if we don't have a timeout here all stickies will be created at once
        if (!(index % rowLength)) {
            yOffset = yOffset + stickyWidth / 2.5
            xOffset = xStart
        }

        let themeColour;
        if (riskItem.risk == 'HIGH') {
            themeColour = '#f16c7f'
        }

        if (riskItem.risk == 'MEDIUM') {
            themeColour = '#ff9900'
        }

        // @ts-ignore
        const card = miro.board.createCard({
            title: riskItem.title,
            description: riskItem.description,
            style: {
                cardTheme: themeColour, // Default color: blue
            },
            x: xOffset,
            y: yOffset,
            width: 400,
            rotation: 0.0,
            taskStatus: 'to-do',
        })
        // it is an issue with the miro api that we can't zoom to more than ~50 cards at once. 50 in this case is a magic number
        if(index < 50){
            cardStackTill50.push(card)
            if(riskItems.length === index + 1){
                Promise.all(cardStackTill50)
                    // @ts-ignore
                    .then(async (cards) => { await miro.board.viewport.zoomTo(cards.slice(0, 10));})
            }
        }else if(index == 50) {
            Promise.all(cardStackTill50)
                // @ts-ignore
                .then(async (cards) => { await miro.board.viewport.zoomTo(cards.slice(0, 10));})
        }else {
            cardStackRest.push(card)
        }
        xOffset = xOffset + stickyWidth
    })

    Promise.all(cardStackRest)
    return 'done'
}

export const createRiskItemCards = async (riskItems: RiskItem[]) => {
    // @ts-ignore
    const viewport = await miro.board.viewport.get()
    const appPanelWidth = 200
    const xStart = viewport.x + viewport.width / 2 + appPanelWidth
    const yStart = viewport.y + viewport.height / 2

    await createStickies(xStart, yStart, riskItems)
}
