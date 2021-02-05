let actorLib = {
    hero : {
        name : "Hero",
        side : "good",
        quantity : new Decimal(1),
        life : {base : new Decimal(1), value : new Decimal(1), remain : new Decimal (1)},
        level : new Decimal(1),
        tags : ["edf","hero"],
        threatBase : new Decimal(-1),
        nextStepBehaviour : "keep",
        progressBase : new Decimal(5),
        progressMult : new Decimal(1),
        threatCapBase : new Decimal(50),

    },

    antswarm : {
            name : "Ant swarm",
            side : "bad",
            quantity : new Decimal(50),
            level : new Decimal(1),
            life : {base : new Decimal(1), value : new Decimal(1), remain : new Decimal (100)},
            tags : ["bug","ant"],
            threatBase : new Decimal(0.1),
            eventStorage : [ // trying something different for event, i'll call them from Actors
                
            ],
    },

    anthill : {
            name : "Anthill",
            side : "bad",
            quantity : new Decimal(1),
            level : new Decimal(1),
            life : {base : new Decimal(100), value : new Decimal(100), remain : new Decimal (100)},
            armorBase : new Decimal(10),
            tags : ["structure"],
            threatBase : new Decimal(0),
            eventStorage : [ // trying something different for event, i'll call them from Actors
                {
                    name : "antswarmspan",
                    title : "anthill event test",
                },
            ],
    },

    spiderswarm : {
            name : "Spider swarm",
            side : "bad",
            quantity : new Decimal(5),
            level : new Decimal(1),
            life : {base : new Decimal(10), value : new Decimal(10), remain : new Decimal (10)},
            tags : ["bug","spider"],
            threatBase : new Decimal(1),
            eventStorage : [ // trying something different for event, i'll call them from Actors
                
            ],
    },

    antregenerator : {
            name : "Giant Regeneratorant",
            side : "bad",
            quantity : new Decimal(1),
            level : new Decimal(1),
            life : {base : new Decimal(200), value : new Decimal(200), remain : new Decimal (200)},
            tags : ["bug","ant","elite"],
            threatBase : new Decimal(5),
            eventStorage : [ // trying something different for event, i'll call them from Actors
                {
                    name : "regen",
                    title : "anthill event test",
                    power : new Decimal(1)
                },
            ],
    },

    growspider : {
            name : "Giant Growspider",
            side : "bad",
            quantity : new Decimal(2),
            level : new Decimal(1),
            life : {base : new Decimal(200), value : new Decimal(200), remain : new Decimal (200)},
            tags : ["bug","spider","elite"],
            threatBase : new Decimal(5),
            eventStorage : [ // trying something different for event, i'll call them from Actors
                {
                    name : "valueUp",
                    title : "anthill event test",
                    power : new Decimal(2)
                },
            ],
    },
}

let eventLib = {
    
    selfdestruct : {
        title : "Die",
        eventLevel : new Decimal(1),
        eventSide : "bad",
        eventCheck : ()=>{return true},
        eventEffect(){
            let tPath = player["mission"].actorList
            for (let actor in tPath){
                if (tPath[actor] === this) {
                    // console.log("died with " + this.quantity.toString());
                    // this.eventStorage = null
                    tPath[actor].eventStorage = []; // purge event to be extra sure it's dead
                    tPath.splice(actor,1);
                    // console.log(this.name + " died !")
                }
            }            
        },
    },

    weapon : {
        title : "Fire weapon",
        eventSide : "good",
        nextStepBehaviour : "keep",        
        eventCheck(callingEvent, lastCallTime) {
            /*
            if ((Date.now() - lastCallTime) < callingEvent.eventCooldown) {
                return false
            } else {
            //*/
            if (chancePercent(callingEvent.eventChance || 100)) return true
        },
        
        eventEffect(callingEvent, lastCallTime){
            let tPath = player["mission"].actorList
            let potentialTargetIndexList = getActorIndexListByFilter(tPath,{side : otherSide(this.side)}); // return an index of array 
            let targetIndexList = pickFromIndexList(1,potentialTargetIndexList); // return an index of array
            if (targetIndexList.length > 0) {
                for (let target of targetIndexList) { // call on each index of array
                    console.log(`${this.name} fired at ${tPath[target]?.name} with ${callingEvent.title}`)
                    doDamage(tPath[target], callingEvent.shotCount,callingEvent.shotDamage)
                }
            }
        },
    },

    recover : {
        title : "Recover Threat",
        eventSide : "good",
        nextStepBehaviour : "keep",
        eventCheck(callingEvent, lastCallTime) {
            /*
            if ((Date.now() - lastCallTime) < callingEvent.eventCooldown) {
                return false
            } else {
            //*/

            if(callingEvent.tags.includes("thresholdbased")) {
                if (asD(player["mission"].threat).div(player["mission"].threatCap).gte(callingEvent.recoverRatioThreshold) == 1) {
                return true
                }
            }

            if(callingEvent.tags.includes("noenemyleft")) {
                if (getActorIndexListByFilter(player.mission.actorList,{side : "bad"}).length == 0) {
                  return true  
                } 
            } 
        },
        
        eventEffect(callingEvent, lastCallTime){
            player["mission"].threat = player["mission"].threat.sub(new Decimal(callingEvent.recoverAmount))
        },
    },

    armor : {
        title : "Armor up",
        eventSide : "good",
        nextStepBehaviour : "keep",
        eventCheck(callingEvent, lastCallTime) {
            /*
            if ((Date.now() - lastCallTime) < callingEvent.eventCooldown) {
                return false
            } else {
            //*/

            return true
        },
        
        eventEffect(callingEvent, lastCallTime){
            (callingEvent.counter == null || callingEvent.counter == undefined)
                ? callingEvent.counter = new Decimal(0)
                : callingEvent.counter = asD(callingEvent.counter).add(new Decimal(1));
            
            callingEvent.threatCapBase = asD(callingEvent.counter).mul(new Decimal(5))
        },
    },

    valueUp : {
        title : "HP growth",
        eventSide : "bad",
        eventCheck(callingEvent, lastCallTime) {
            /*
            if ((Date.now() - lastCallTime) < callingEvent.eventCooldown) {
                return false
            } else {
            //*/

            return true
        },
        
        eventEffect(callingEvent, lastCallTime){
            (callingEvent.counter == null || callingEvent.counter == undefined)
                ? callingEvent.counter = new Decimal(0)
                : callingEvent.counter = asD(callingEvent.counter).add(new Decimal(1));
            
            callingEvent.life.base = asD(callingEvent.counter).mul(asD(callingEvent.power || new Decimal(1)))
            console.log ("growing " + callingEvent.life.base)
        },
    },

    antswarmspan : {
        title : "Ant swarn spawn",
        eventSide : "bad", // eventSide is the default event side
        eventCheck : ()=>{return chancePercent(25)},
        eventEffect(){
            let tPath = player["mission"].actorList;
            let tTarget = tPath.find(e => e.tags.includes("ant"))
            if (tTarget != null && tTarget != undefined) {
                tTarget.quantity = asD(tTarget.quantity).add(new Decimal(5))
            } else {
                addActor(actorLib.antswarm);
            }
            console.log(this.name + " spawned ant swarm !")
        }
    },


    regen : {
        title : "Regen",
        eventLevel : new Decimal(1),
        eventSide : "neutral",
        eventCheck(callingEvent,lastCallTime) {return true},
        eventEffect(callingEvent,lastCallTime){
            let _power = asD(callingEvent.power) || new Decimal(10) // Regen %
            if (asD(this.life.remain).lt(this.life.value)) {
                this.life.remain = asD(this.life.remain).add(asD(this.life.value).mul(_power.div(100))).floor(this.life.value)
            }
        },
    },

    net : {
        title : "Net",
        eventSide : "bad", // eventSide is the default event side
        eventCheck : ()=>{return true},
        eventEffect(){console.log(this.name + " event fired")},
    },

    test : {
        title : "test",
        eventSide : "test",
        eventCheck : ()=>{return true},
        eventEffect(functionCalled){console.log(this.name + " event fired " + functionCalled)},
        
    },
}