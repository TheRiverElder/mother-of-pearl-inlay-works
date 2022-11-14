const VALUE_HALF_SQRT_3 = Math.sqrt(3) / 2;

type Vector2 = [number, number];

export function drawHexagon(g: CanvasRenderingContext2D, cellSize: number, edgeCellCount: number) {
    const { width, height } = g.canvas;

    g.fillStyle = "#223344";
    g.fillRect(-width / 2, -height / 2, width, height);

    {
        g.fillStyle = "#000000";
        g.beginPath();
        getHexagonPath(2 * (edgeCellCount + 1) * cellSize).forEach(e => g.lineTo(...e));
        g.closePath();
        g.fill();
    }

    const checkings: Array<Array<boolean>> = [];

    for (let hexagonRho = edgeCellCount; hexagonRho >= 0; hexagonRho--) {

        for (let hexagonTheta = 0; hexagonTheta < 6 * hexagonRho; hexagonTheta++) {
            const [hexagonUnitX, hexagonUnitY] = getHexagonCoordinate(hexagonRho, hexagonTheta);

            let row: Array<boolean> = checkings[hexagonUnitY];
            if (!row) {
                checkings[hexagonUnitY] = row = []; 
            }

            if (hexagonRho < edgeCellCount - 1) {
                let possibility = hasFullPriors(hexagonUnitX, hexagonUnitY, checkings) ? 0.85 : 0;
                possibility *= hexagonRho / edgeCellCount;
                if (Math.random() >= possibility) {
                    row[hexagonUnitX] = false;
                    continue;    
                }
            }

            row[hexagonUnitX] = true;

            const [unitX, unitY] = getHexagonPosition(hexagonRho, hexagonTheta);
            const pixelX = unitX * 2 * cellSize;
            const pixelY = unitY * 2 * cellSize;

            g.save();
            
            g.translate(pixelX, pixelY);
            drawCell(g, cellSize);

            g.restore();
        }
    }

    {
        g.fillStyle = "rgb(210, 210, 205)";
        g.beginPath();
        getHexagonPath(3.5 * cellSize).forEach(e => g.lineTo(...e));
        g.closePath();
        g.fill();
    }

    for (let i = 0; i < 5; i++) {
        const radius = i * 0.5 * cellSize;
        const gradientDirection = Math.random() * 2 * Math.PI;
        const gradient = g.createLinearGradient(
            -cellSize * Math.cos(gradientDirection),
            -cellSize * Math.sin(gradientDirection),
            cellSize * Math.cos(gradientDirection),
            cellSize * Math.sin(gradientDirection),
        );
        gradient.addColorStop(0, randomColor([0x40, 0x80] ,[0x80, 0x0100], [0xa0, 0x0100]));
        gradient.addColorStop(1, randomColor([0x40, 0x80] ,[0x80, 0x0100], [0xa0, 0x0100]));
        g.strokeStyle = gradient;
        g.lineWidth = 0.25 * cellSize;

        g.beginPath();
        getHexagonPath(radius).forEach(e => g.lineTo(...e));
        g.closePath();
        g.stroke();
    }
    
}

function drawCell(g: CanvasRenderingContext2D, cellSize: number) {
    const gradientDirection = Math.random() * 2 * Math.PI;
    const gradient = g.createLinearGradient(
        -cellSize * Math.cos(gradientDirection),
        -cellSize * Math.sin(gradientDirection),
        cellSize * Math.cos(gradientDirection),
        cellSize * Math.sin(gradientDirection),
    );
    gradient.addColorStop(0, randomColor([0x40, 0x80] ,[0x80, 0x0100], [0xa0, 0x0100]));
    gradient.addColorStop(1, randomColor([0x40, 0x80] ,[0x80, 0x0100], [0xa0, 0x0100]));
    g.fillStyle = gradient;

    g.beginPath();
    g.rotate(Math.PI / 6);
    getHexagonPath(cellSize).forEach(v => g.lineTo(...v));
    g.closePath();
    g.fill();
}

function getHexagonPath(size: number = 1): Array<Vector2> {
    const path: Array<Vector2> = [
        [1, 0],
        [0.5, VALUE_HALF_SQRT_3],
        [-0.5, VALUE_HALF_SQRT_3],
        [-1, 0],
        [-0.5, -VALUE_HALF_SQRT_3],
        [0.5, -VALUE_HALF_SQRT_3],
    ];
    return path.map(e => [e[0] * size, e[1] * size]);
}

function getHexagonCoordinate(rho: number, theta: number): Vector2 {
    if (rho == 0) return [0, 0];

    const section = Math.floor(theta / rho);
    const part = theta % rho;
    
    switch (section) {
        case 0: return [rho, part];
        case 1: return [rho - part, rho];
        case 2: return [-part, -part + rho];
        case 3: return [-rho, -part];
        case 4: return [-(rho - part), -rho];
        case 5: return [part, part - rho];
    }
    return [0, 0];
}

function getHexagonPosition(rho: number, theta: number): Vector2 {
    if (rho == 0) return [0, 0];

    const section = Math.floor(theta / rho);
    const part = theta % rho;
    const sectionAngle = section * (Math.PI / 3);
    const direction = (2 / 3) * Math.PI + sectionAngle;

    return [
        rho * Math.cos(sectionAngle) + part * Math.cos(direction), 
        rho * Math.sin(sectionAngle) + part * Math.sin(direction),
    ];
}

function getPriors(hexagonX: number, hexagonY: number, checkings: Array<Array<boolean>>): Array<boolean> {
    const x = hexagonX;
    const y = hexagonY;
    const c = checkings;
    if (x > 0) {
        if (y < 0) return [getCell(x, y - 1, c), getCell(x + 1, y, c)];
        else if (y === 0) return [getCell(x, y - 1, c), getCell(x + 1, y, c), getCell(x + 1, y + 1, c)];
        else if (y < x) return [getCell(x + 1, y, c), getCell(x + 1, y + 1, c)];
        else if (y === x) return [getCell(x + 1, y, c), getCell(x + 1, y + 1, c), getCell(x, y + 1, c)];
        else return [getCell(x + 1, y + 1, c), getCell(x, y + 1, c)];
    } else if (x === 0) {
        if (y > 0) return [getCell(x + 1, y + 1, c), getCell(x, y + 1, c), getCell(x - 1, y, c)];
        else if (y === 0) return [
            getCell(x + 1, y + 1, c), getCell(x, y + 1, c), getCell(x - 1, y, c),
            getCell(x - 1, y - 1, c), getCell(x, y - 1, c), getCell(x + 1, y, c)
        ];
        else return [getCell(x - 1, y - 1, c), getCell(x, y - 1, c), getCell(x + 1, y, c)];
    } else {
        if (y > 0) return [getCell(x, y + 1, c), getCell(x - 1, y, c)];
        else if (y === 0) return [getCell(x, y + 1, c), getCell(x - 1, y, c), getCell(x - 1, y - 1, c)];
        else if (y > x) return [getCell(x - 1, y, c), getCell(x - 1, y - 1, c)];
        else if (y === x) return [getCell(x - 1, y, c), getCell(x - 1, y - 1, c), getCell(x, y - 1, c)];
        else return [getCell(x - 1, y - 1, c), getCell(x, y - 1, c)];
    }
}

function hasFullPriors(hexagonX: number, hexagonY: number, checkings: Array<Array<boolean>>): boolean {
    const priors = getPriors(hexagonX, hexagonY, checkings);
    return priors.every(e => e === true);
}

function getCell(hexagonX: number, hexagonY: number, checkings: Array<Array<boolean>>): boolean {
    const row = checkings[hexagonY];
    if (row) return row[hexagonX] === true;
    else return false;
}

function countCell(hexagonX: number, hexagonY: number, checkings: Array<Array<boolean>>): number {
    return boolToInt(getCell(hexagonX, hexagonY, checkings));
}

function boolToInt(input: boolean): number {
    return input === true ? 1 : 0;
}

function randomColor(redRange: Vector2, greenRange: Vector2, blueRange: Vector2) {
    const r = randInt(...redRange);
    const g = randInt(...greenRange);
    const b = randInt(...blueRange);
    return "#" + [r, g, b].map(c => constraints(c, 0, 0xff).toString(16).padStart(2, '0')).join('');
}

function randInt(minInclude: number, maxExclude: number): number {
    return Math.floor(minInclude + Math.random() * Math.floor(maxExclude - minInclude));
}

function constraints(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}