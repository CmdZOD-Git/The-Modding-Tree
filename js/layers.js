// Utils functions //

function asD(value) {
    value = new Decimal(value)
return value
}

function chancePercent(successPercentage){
    if(successPercentage > (Math.random()*100)) {
        return true
    } else {
        return false
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


//
// Can / Get core value functions
//

function getGenericCoreValue(value, path, diff, specificActor, flag) {
    // Exemple call : getGenericCoreValue("progress" , player["mission"].actorList , diff , specificActor)
    // Exemple value fo tPath : player["mission"].actorList
    let tValue = value.toString();
    let tPath = path || player["mission"].actorList;
    let tDiff = asD((diff) || new Decimal(1));
    let tFlag = flag || [];
    
    // building up canXXXPointGen function to look for, if none continue
    // It's up to you to add a gating function if you need to control XXXPointGen
    let canGenName = "can" + capitalize(tValue) + "PointGen"

    function capitalize(value){
        tString = tValue.charAt(0).toUpperCase() + tValue.slice(1).toLowerCase()
        return tString
    }

    if (
        ((window[canGenName]) && window[canGenName]() != true)
        )
    {
        return new Decimal(0)  
    } else {
        
        let tCalc = new Decimal(0);
        let tBase = new Decimal(0);
        let tMult = new Decimal(1);
        
        let tActorList = [];
        if (specificActor != null && specificActor != undefined) {
            tActorList.push(specificActor)
        } else {
            tActorList = tPath
        }

        let neutralBase;
        let neutralMult;
        
        tActorList.forEach(
            e => {
                let eBase;
                let eMult;

                if (tFlag.includes("splitinfour")) {
                    //console.log("picked nobase")
                    eBase = (e[tValue]["base"] == null || e[tValue]["base"] == undefined) ? new Decimal(0) : asD(e[tValue]["base"]);
                    eMult = (e[tValue]["mult"] == null || e[tValue]["mult"] == undefined) ? new Decimal(1) : asD(e[tValue]["mult"]);
                } else {
                    neutralBase = tValue + "Base";
                    neutralMult = tValue + "Mult";

                    eBase = (e[neutralBase] == null || e[neutralBase] == undefined) ? new Decimal(0) : asD(e[neutralBase]);
                    eMult = (e[neutralMult] == null || e[neutralMult] == undefined) ? new Decimal(1) : asD(e[neutralMult]);
                }

                
                let eQuantity = (e["quantity"] == null || e["quantity"] == undefined) ? new Decimal(1) : ((tFlag.includes("quantityneutral")) ? new Decimal (1) : asD(e["quantity"]));

                if (e.eventStorage) {
                    e.eventStorage.forEach(
                        f => {
                            let fBase;
                            let fMult;

                            if (tFlag.includes("splitinfour")) {
                                //console.log("picked nobase")
                                fBase = (f[tValue] == null || f[tValue] == undefined || f[tValue]["base"] == null || f[tValue]["base"] == undefined) ? new Decimal(0) : asD(f[tValue]["base"]);
                                fMult = (f[tValue] == null || f[tValue] == undefined || f[tValue]["mult"] == null || f[tValue]["mult"] == undefined) ? new Decimal(1) : asD(f[tValue]["mult"]);
                            } else {
                                neutralBase = tValue + "Base";
                                neutralMult = tValue + "Mult";
                                fBase = (f[neutralBase] == null || f[neutralBase] == undefined) ? new Decimal(0) : f[neutralBase];
                                fMult = (f[neutralMult] == null || f[neutralMult] == undefined) ? new Decimal(1) : f[neutralMult];
                            }

                            
                            eBase = asD(eBase).add(fBase);
                            eMult = asD(eMult).mul(fMult);
                        }
                    )
                        
                }
        
                tCalc = tCalc.add(eBase.mul(eMult).mul(eQuantity));

            }
        )
   
        return tCalc.mul(tDiff)
    }

}

function canProgressPointGen(){
        if (
            (player["mission"].inMission == true)
            && (asD(player["mission"].progress).lt(player["mission"].progressTarget)))
            {
            return true
        } else {
            return false
        }
}

function getProgressPointGen(diff, specificActor) {
    return getGenericCoreValue("progress" , player["mission"].actorList , diff , specificActor)
}

function canThreatPointGen(){
    if (player["mission"].inMission == true) {
        return true
    } else {
        return false
    }
}

function getThreatPointGen(diff, specificActor){
    return getGenericCoreValue( "threat", player["mission"].actorList, diff, specificActor)
}

function getThreatCap(specificActor) {
    return getGenericCoreValue( "threatCap" , player["mission"].actorList , new Decimal(1) , specificActor)
}

function getLife(specificActor) {
    return getGenericCoreValue( "life" , player["mission"].actorList , new Decimal(1) , specificActor, ["splitinfour","quantityneutral"])
}

/* NOT NEEDED ANYMORE
function getValueCurrent(specificActor) {
    return getGenericCoreValue( "valueCurrent" , player["mission"].actorList , new Decimal(1) , specificActor, ["nobase","quantityneutral"])
}
*/

//
// Mission handler / Control function
//

function eventManager(){
    player["mission"].actorList.forEach(
        e => e.eventStorage.forEach (
            f => {if (eventLib[f.name].eventCheck.call(e,f,f.lastCall) == true) {
                f.lastCall = Date.now();
                eventLib[f.name].eventEffect.call(e, f,f.lastCall)}
            }
        )
    )
}

function stepNext(){

    if (asD(player["mission"].missionStepCurrent).gte(player["mission"].missionParameters.missionStepTarget)) {
        player["mission"].missionComplete = true
        console.log("mission completed");
    } else {

    let tProgressTarget  = new Decimal("1e6");
    
    tProgressTarget = tProgressTarget.add(asD(player["mission"].missionStepCurrent).times(10));
    tProgressTarget = tProgressTarget.times(asD(player["mission"].missionParameters.missionRank));
    
    player["mission"].progressTarget = tProgressTarget;
    player["mission"].progress = new Decimal(0);
    player["mission"].missionStepCurrent = asD(player["mission"].missionStepCurrent).add(1);

    cleanupActor();
    populateActor();

    player["mission"].threat = new Decimal(0);
    player["mission"].threatCap = getThreatCap();
    }
}

function populateActor() {
    //see mission layer setup for info
    if(!(player["mission"].actorList.some(e => e.name == "Hero"))) {
    addActor(actorLib.hero, {level : player["hero"].points , eventStorage : [...player["mission"].missionEventLoadout]});
    }

    for (let i = 0; player["mission"].missionStepCurrent.gt(i); i++) {
        // console.log(`starting loop for i ${i.toString()}`)
        let rng = getRandomInt(1,3);
        // console.log(`Got RNG ${rng.toString()}`)

        switch (rng) {
        case 1:
        addActor(actorLib.antswarm, {quantity : new Decimal(getRandomInt(50,100))});
        break;

        case 2:
        addActor(actorLib.anthill);
        break;

        case 3:
        addActor(actorLib.spiderswarm, {quantity : new Decimal(getRandomInt(10,20))});
        break;        
        }
    }
}

function cleanupActor() {
    tPath = player["mission"].actorList;

    tPath.forEach(
        e => {
            if (e.nextStepBehaviour != "keep") {
                tPath.splice(tPath.indexOf(e))
            } else {
                e.eventStorage.forEach(
                    f => {
                        if (e.nextStepBehaviour != "keep") {
                            tPath.splice(tPath.indexOf(f))
                        }
                    }   
                )
            }
        }
    )
}

function endMission(){
    player["hq"].plannedMission = false;

    player["mission"].inMission = false;
    
    player["mission"].missionStepCurrent = new Decimal(0);
    
    player["mission"].progress = new Decimal(0);
    player["mission"].progressTarget = new Decimal(100);
    
    player["mission"].threat = new Decimal(0);
    player["mission"].threatCap = new Decimal(0);
    player["mission"].missionParameters = null;

    player["mission"].actorList = [];

    player["mission"].missionComplete = false;

    console.log("mission ended");
}

//
// Actorlist handler
//

function addActor(actorToAdd, extraParameters){
    // Note : proper extraParam syntax : addActor(actorLib.hero, {name : "bob"})
    
    let tActor = _.cloneDeep(actorToAdd);
    tActor = {...tActor, ...extraParameters};
    tActor.life.remain = asD(tActor.life.value) || asD(tActor.life.base) || new Decimal(1)
    player["mission"].actorList.push(tActor);
    

}

function addEvent(targetActor, eventToAdd, extraParameters){
    // Note : proper extraParam syntax : addActor(actorLib.hero, {name : "bob"})
    let tEvent = _.cloneDeep(eventToAdd);
    tEvent = {...tEvent,...extraParameters}
    
    targetActor.eventStorage.push(tEvent)
}

//
// Actor Filter functions //
//

function pickFromIndexList(targetNumber, indexList) {
    let startingList= indexList;
    let pickTable = [];
    
    if (startingList.length > 0) {
        for (let x = 0 ; x < targetNumber ; x++) {
            let pickedNumber = getRandomInt(0,startingList.length -1);
            let pickedObject = (startingList[pickedNumber]);
            startingList.splice(pickedNumber,1);
            pickTable.push(pickedObject);
        };
    }

    return pickTable
}

function getActorIndexListBySubArray(dataToCheck,sub,tagToCheck){
// Exemple of call : getActorIndexListBySubArray(player.mission.actorList,"tags",["bug"])
// this return an array of index from data Array if "bugs" is in "tags" sub.array
    let resultArray = [];
    let targetParam = tagToCheck;

    for (let e in dataToCheck) {
        for (let k of targetParam) {
            if (dataToCheck[e][sub].includes(k)) {
                if(!resultArray.includes(e)) resultArray.push(e);
            }
        }
    }
    // console.log("result " + resultArray.toString())
    return resultArray
}

function getActorIndexListByFilter(dataToCheck, objToCheck) {
// exemple of call : getActorIndexListByFilter(tPath,{side : otherSide(this.side)});
    let resultArray = []
    let targetParam = Object.keys(objToCheck)

    for (let e in dataToCheck) {
            for (let k of targetParam) {
                if (dataToCheck[e][k] == objToCheck[k]) {
                    if(!resultArray.includes(e)) resultArray.push(e);
            }
        }
    }
    // console.log("result " + resultArray.toString())
    return resultArray
}



function otherSide(sideToReverse){
    if(sideToReverse == "good") {
        return "bad"
    } else {
        return "good"
    }
}

//
// General functions
//

function doDamage(target, shotCount,shotDamage){
    // expected from target Object : life and quantity
    let shotLeft = asD(shotCount);
    let tShotDamage = asD(shotDamage).sub(target.armorBase).ceil(0)
    
    function getShotToKill(value) {
        return asD(value).div(tShotDamage).ceil()
    }

    if (asD(tShotDamage).gt(0) == 1) {
        while(
            (asD(shotLeft).gt(new Decimal(0)) == 1)
            ){
            if (asD(target.life.value).cmp(target.life.remain) == true) {
                let shotToKill = getShotToKill(target.life.value);
                
                if (shotToKill.lt(shotCount) == 1) { //can kill at least one from full health
                    let killCount = asD(shotLeft).div(shotToKill).floor();
                    let shotSpent = asD(killCount).mul(shotToKill);
                
                    shotLeft = asD(shotLeft).sub(shotSpent);
                    target.quantity = asD(target.quantity).sub(killCount)
                } else {                            // do as much damage as possible
                    let damageCount = asD(shotLeft).mul(tShotDamage)
                    
                    shotLeft = new Decimal(0)
                    target.life.remain = asD(target.life.remain).sub(damageCount)
                }
            } else {
                let shotToKill = getShotToKill(target.life.remain);
               
                if (asD(shotToKill).lt(shotCount) == 1) { // can kill one from current health
                    let shotSpent = shotToKill;
                
                    shotLeft = asD(shotLeft).sub(shotSpent);
                    target.quantity = asD(target.quantity).sub(new Decimal(1))
                    target.life.remain = new Decimal(target.life.value)
                } else {                            // do as much damage as possible
                    let damageCount = asD(shotLeft).mul(tShotDamage)
                    
                    shotLeft = new Decimal(0)
                    target.life.remain = asD(target.life.remain).sub(damageCount)
                }
            }

            if (asD(target.life.remain).lte(new Decimal (0)) == 1) {
                target.quantity = asD(target.quantity).sub(new Decimal(1));
                target.life.remain = new Decimal(target.life.value);
            }

            if (asD(target.quantity).lte(new Decimal (0) == 1)) {
                target.quantity = new Decimal(0);
                addEvent(target,{name : "selfdestruct", title : "Dead"})
            }
        }
    }
}