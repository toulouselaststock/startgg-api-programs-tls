let placementPoints = {
    999999 : 0,
    129: 4,
    97: 6,
    65: 8,
    49: 11,
    33:12,
    25: 14,
    17: 16,
    13: 17,
    9: 18,
    7: 19,
    5: 20,
    4: 21,
    3: 22,
    2: 23,
    1: 24
}

export function getSPRPoints(predicted, real){
    let oneSPRValue = 2;
    let SPRPts = -1;
    for (let p in placementPoints){
        if (p == 9){
            oneSPRValue = 3;
        }

        if (p == 25){
            oneSPRValue = 4
        }

        if (p - 1 >= predicted) {
            return SPRPts == 0 ? 1 : (SPRPts < 0 ? 0 : SPRPts);
        }
        if (SPRPts >= 0){
            SPRPts += oneSPRValue;
        }
        if (p == real) {
            SPRPts = 0; 
        }
    }
}

export function getPlacementPoints(placement){
    return placementPoints[placement];
}