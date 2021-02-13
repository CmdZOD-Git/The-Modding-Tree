function getInfoCard(actor){
    let infoCard = ""
    if (actor.side == "good") {
        infoCard = `${showQuantity(actor)}<h3 style="color:${colorPerSide(actor.side)}">${actor.name}</h3> (L.${actor.level}) [${actor.tags.toString().toUpperCase()}]<br />
        Threat Cap ${getThreatCap(actor,["perunit"]).toString()} <br />`

        
    } else if (actor.side =="bad") {
        infoCard = `${showQuantity(actor)}<h3 style="color:${colorPerSide(actor.side)}">${actor.name}</h3> (L.${actor.level}) [${actor.tags.toString().toUpperCase()}]<br />
        Threat ${formatWhole(getThreat(actor)).toString()} (${getThreat(actor,["perunit"]).toString()} /unit)<br />`
    } else {
        infoCard = `No Info`
    }
    
    return infoCard

}

function getThreatRatio() {
    if (asD(player["mission"].threat.value).gt(player["mission"].threatCap.value)) {
        return new Decimal(0)
    } else {
        let tRatio = new Decimal (1)
        return tRatio.sub(asD(player["mission"].threat.value).div(player["mission"].threatCap.value))
    }
}

function showQuantity(actor) {
    let tString = "";
    if (asD(actor.quantity).gt(new Decimal(1))== 1) {
        tString = actor.quantity.toString() + "x "
    }
    
    return tString
}

function showLife (actor) {
    tString = "";
    
    if (actor.life.remain != actor.life.value) {
        tString = actor.life.remain.toString() + " (" + formatWhole(asD(actor.life.remain).times(new Decimal(100)).div(actor.life.value)) + "%)"
    } else {
        tString = actor.life.value.toString()
    }

    return tString
}

function colorPerSide(actorSide) {
    let tColor = "";

    switch (actorSide) {
        case "good" :
            tColor = "Blue"
        break;

        case "bad" :
            tColor = "Red"
        break;

        case "meta" :
            tColor = "Yellow"
        break;

        default :
            tColor = "grey"
    }

    
        
    
    return tColor
}

addLayer("mission", {
    name: "Mission", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 10, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked : false,
        points: new Decimal(0),
        
        inMission: false,
        missionComplete: false,
        
        missionParameters: {
            missionRank : new Decimal(0),
            missionStepTarget : new Decimal(0)
        },

        missionEventLoadout : [],

        missionStepCurrent: new Decimal(0),

        activeObjective: "test",

        progress: new Decimal(0),
        progressTarget: new Decimal(100),

        threat : new FiveObject(0),
        threatCap: new FiveObject(0),

        eventWatchList : [],
        eventQueue : [],

        eventTimeAccumulator: new Decimal(0),

        // array of Actor object w/
        // name(str), quantity(decimal), level(decimal), tags [array]
        // threatBase(decimal), threatType (string : "default" only for now)
        // nextStepBehaviour(string : "default", one step only - "keep", carry through mission)
        actorList : []

    }},

    tabFormat: {
        "Mission": {
            content:
                [
                "ressource-display",
                ["infobox", "missionUpperInfobox"],
                ["blank","10px"],
                ["display-text","main text here"],
                ["infobox", "actorInfobox"],
                ["blank","10px"],
                ["display-text",
                    function() { return `Step count ${player["mission"].missionStepCurrent.toString()}`}],
                ["blank","5px"],
                ["bar","progressBar"],
                ["blank","10px"],
                ["bar","threatBar"],
                ["blank","10px"],
                "milestones", "upgrades",
                ],
        },
    },

    color: "Red",
    resource: "Objective Points", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    resetNothing : true,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for prestige points", onPress(){showTab("mission")}},
    ],
    layerShown(){return (asD(player.hero.points).gte(1))},

    infoboxes: {
        missionUpperInfobox: {
            title: "Mission description",
            body() { return "mission text here" },
        },

        actorInfobox: {
            title: "Actor List",
            body() { 
                let tList = "";
                
                for (actor of player["mission"].actorList) {
                    tList = tList + getInfoCard(actor)

                    /*
                    tList = tList + `<h3 style="color:${colorPerSide(actor.side)}">${actor.name}</h3> Lv ${actor.level} [${actor.tags.toString().toUpperCase()}]<br />
                    Qt : ${actor.quantity} HP : ${actor.life.remain} (${formatWhole(asD(actor.life.remain).times(new Decimal(100)).div(actor.life.value))}%)<br />
                    Threat : ${getThreat(actor,["perunit"]).toString()} per unit, total ${formatWhole(getThreat(actor)).toString()}<br /><br />
                    `
                    */
                }

                return tList
            },
        },
    },

    bars: {
        progressBar: {
            direction: RIGHT,
            width: 500,
            height: 50,

            baseStyle: {'background-color' : ' Black'},
            fillStyle: {'background-color' : 'Blue'},
            borderStyle: {'border-color' : 'Blue'},
            textStyle: {'color' : 'White'},
            // **Optional**, Apply CSS to the unfilled portion, filled portion, border, and display text on the bar, in the form of an object where the keys are CSS attributes, and the values are the values for those attributes (both as strings).
            display() {
                if (player["mission"].inMission == true) {
                    return `${formatWhole(player["mission"].progress)} progress (${formatWhole(getProgressPointGen(new Decimal(1)).mul(getThreatRatio()))}/sec) out of ${formatWhole(player["mission"].progressTarget)}`
                }
            },

            progress() {
                if (player["mission"].inMission == true) {
                    return asD(player["mission"].progress).div(player["mission"].progressTarget)
                }
            },
        },

        threatBar :{
            direction: RIGHT,
            width: 500,
            height: 30,

            baseStyle: {'background-color' : 'Black'},
            fillStyle: {'background-color' : 'Red'},
            borderStyle: {'border-color' : 'Red'},
            textStyle: {'color' : 'white'},
                        
            display() {
                if (player["mission"].inMission == true) {
                    if(asD(player["mission"].threat.value).gt(player["mission"].threatCap.value)==1){
                        return `PROGRESS STOPPED - ${formatWhole(player["mission"].threat.value)} Threat (Cap ${formatWhole(player["mission"].threatCap.value)})`
                    } else {
                        return `PROGRESS SPEED x${formatWhole(getThreatRatio())} - ${formatWhole(player["mission"].threat.value)} Threat (Cap ${formatWhole(player["mission"].threatCap.value)})`}
                    }
            },

            progress() {
                if (player["mission"].inMission == true) {
                    return asD(player["mission"].threat.value).div(player["mission"].threatCap.value)}
            },
        },
    },
    
    update(diff){
        let tDiff = diff
        if (player.extraTime >0 && player.extraSpeed > 1) {
            tDiff *= player.extraSpeed
            player.extraTime -= tDiff
            if (player.extraTime < 0) player.extraTime = 0
        } else if (player.extraSpeed > 1) {
            player.extraSpeed = 1
        }
        //Forcing Lock / Unlock & Tooltip
        if (player["mission"].inMission) {
            player["mission"].unlocked = true;
            tmp["mission"].tooltip = "In mission";
        } else {
            player["mission"].unlocked = false;
            tmp["mission"].tooltipLocked = "Not in mission";
        }
        
        // Starting step
        if(
            (asD(player["mission"].missionStepCurrent).lte(0))
            && player["mission"].inMission == true) {
                stepNext();
        // Regular loop
        } else if (player["mission"].inMission == true){
            player["mission"].progress = asD(player["mission"].progress).add(getProgressPointGen(tDiff).mul(getThreatRatio()));
            // Fporumula if Threat Ratio ignored //player["mission"].progress = asD(player["mission"].progress).add(getProgressPointGen(tDiff));

            player["mission"].threat.value =  getThreat();
            player["mission"].threatCap.value =  getThreatCap();
            
            player["mission"].eventTimeAccumulator = asD(player["mission"].eventTimeAccumulator).add(tDiff)
            
            // console.log(asD(player["mission"].eventTimeAccumulator).toString()+ " " + tDiff)

            if(player["mission"].eventTimeAccumulator.gte(new Decimal(1)) == 1) {
            //      console.log("eventManager Called");
                  eventManager();
                  
                    player["mission"].threatCap.value = getThreatCap();
                    player["mission"].actorList.forEach(e => {
                        let tLife = asD(e.life.value);
                        let tDiff = new Decimal(0)
                        e.life.value = getLife(e);
                        if (tLife.cmp(e.life.value)!=0) {
                            tDiff = e.life.value.sub(tLife);
                            e.life.remain = asD(e.life.remain).add(tDiff);
                        }

                        if (asD(e.life.remain).lte(new Decimal (0)) == 1) {
                            e.quantity = asD(e.quantity).sub(new Decimal(1));
                            e.life.remain = new Decimal(e.life.value);
                        }

                        if (asD(e.quantity).lte(new Decimal (0) == 1)) {
                            e.quantity = new Decimal(0);
                            addEvent(e,{name : "selfdestruct", title : "Dead"})
                        }
                    })
                    

player["mission"].eventTimeAccumulator = asD(player["mission"].eventTimeAccumulator).sub(new Decimal(1));
            } ;

            if(asD(player["mission"].threat.value).lt(0)) player["mission"].threat.value = new Decimal(0);
            
            // Next step call
            if(asD(player["mission"].progress).gte(player["mission"].progressTarget)) stepNext();
            
            if (player["mission"].missionComplete == true) endMission();
        }
    },

})