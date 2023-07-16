let placementPoints = {
    999999 : 0,
    65: 5,
    49: 7,
    33: 9,
    25: 11,
    17: 13,
    13: 15,
    9: 16,
    7: 17,
    5: 18,
    4: 19,
    3: 20,
    2: 21,
    1: 22
}

export function getSPRPoints(predicted, real){
    let oneSPRValue = 2;
    let SPRPts = -1;
    for (let p in placementPoints){
        if (p == 9){
            oneSPRValue = 3;
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