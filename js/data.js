function FiveObject(baseValue, multValue,flatValue){
    this.base = new Decimal(baseValue || 0) ;
    this.mult = new Decimal(multValue || 1);
    this.flat = new Decimal(flatValue || 0);

    this.value = new Decimal(this.base.mul(this.mult).add(this.flat));
    this.remain = new Decimal(this.value);
    // console.log(`${this.toString()} ${this.base.toString()} ${this.mult.toString()} ${this.flat.toString()} ${this.value.toString()} ${this.remain.toString()}`)
}



let actorLib = {
    hero : {
        name : "Hero",
        side : "good",
        quantity : new Decimal(1),
        life : {base : new Decimal(1),value : new Decimal(1)},
        level : new Decimal(1),
        tags : ["edf","hero"],
        
        threat : new FiveObject(0),
        threatCap : new FiveObject(10),
        
        progress : new FiveObject(5,1),

        nextStepBehaviour : "keep",
    },

    anthill : {
        name : "Anthill",
        side : "bad",
        quantity : new Decimal(1),
        level : new Decimal(1),
        life : {base : new Decimal(100),value : new Decimal(100)},
        armorBase : new Decimal(1),
        tags : ["structure"],
        
        threat : new FiveObject(0),
        threatCap : new FiveObject(0),

        eventStorage : [ // trying something different for event, i'll call them from Actors
            {
                name : "summonactor",
                title : "Ant spawner",
                eventChance : 25,
                summonName : "antswarm",
                summonExtraParameters : {},
                power : new Decimal(25),
            },
        ],
    },

    antregenerator : {
            name : "Giant Regenerator Ant",
            side : "bad",
            quantity : new Decimal(1),
            level : new Decimal(1),
            life : {base : new Decimal(200), value : new Decimal(200)},
            tags : ["bug","ant","elite"],

            threat : new FiveObject(5),
            threatCap : new FiveObject(0),

            eventStorage : [ // trying something different for event, i'll call them from Actors
                {
                    name : "regen",
                    title : "anthill event test",
                    power : new Decimal(10)
                },
            ],
    },

    antswarm : {
            name : "Ant swarm",
            side : "bad",
            quantity : new Decimal(50),
            level : new Decimal(1),
            life : {base : new Decimal(1),value : new Decimal(1)},
            tags : ["bug","ant"],
            
            threat : new FiveObject(0.1),
            threatCap : new FiveObject(0),
            
            eventStorage : [ // trying something different for event, i'll call them from Actors
                
            ],
    },

    growspider : {
        name : "Giant Growspider",
        side : "bad",
        quantity : new Decimal(2),
        level : new Decimal(1),
        life : {base : new Decimal(200),value : new Decimal(200)},
        tags : ["bug","spider","elite"],
        
        threat : new FiveObject(1),
        threatCap : new FiveObject(0),

        eventStorage : [ // trying something different for event, i'll call them from Actors
            {
                name : "lifeup",
                title : "anthill event test",
                power : new Decimal(2)
            },
        ],
    },

    hqturret : {
        name : "HQ Turret",
        side : "good",
        quantity : new Decimal(1),
        level : new Decimal(1),
        life : {base : new Decimal(200),value : new Decimal(200)},
        tags : ["edf", "structure"],
        
        threat : new FiveObject(0),
        threatCap : new FiveObject(10),

        eventStorage : [ // trying something different for event, i'll call them from Actors
            {
                name : "weapon",
                title : "Auto Turret Guns",
                shotCount : new Decimal(5),
                shotDamage: new Decimal (5),
                cooldown : new Decimal(1000),

            },
       ],
    },

    metaactor : {
        name : "META ACTOR",
        side : "neutral",
        quantity : new Decimal(1),
        level : new Decimal(1),
        life : {base : new Decimal(1),value : new Decimal(1)},

        threat : new FiveObject(0),
        threatCap : new FiveObject(0),

        tags : ["meta"],
        eventStorage : [ // trying something different for event, i'll call them from Actors

        ],
    },     

    spiderswarm : {
            name : "Spider swarm",
            side : "bad",
            quantity : new Decimal(5),
            level : new Decimal(1),
            life : {base : new Decimal(10),value : new Decimal(10)},
            tags : ["bug","spider"],
            
            threat : new FiveObject(1),
            threatCap : new FiveObject(0),

            eventStorage : [ // trying something different for event, i'll call them from Actors
                
            ],
    },

}

let eventLib = {

    progressUp : {
        title : "Progress UP",
        eventSide : "good",
        nextStepBehaviour : "reset",
        eventCheck(callingEvent, lastCallTime) {
            return true
        },
        
        eventEffect(callingEvent, lastCallTime){
            if (callingEvent.progress == null || callingEvent.progress == undefined) callingEvent.progress = new FiveObject
            if (callingEvent.counter == null || callingEvent.progress == undefined) callingEvent.counter = new Decimal(0)

            if(callingEvent.tags.includes("nothreat")) {
                if (asD(player["mission"].threat.value).lte(new Decimal(0)) == 1) {
                    callingEvent.counter =  new Decimal(1)
                    console.log(callingEvent.counter.toString())
                }  else {
                    callingEvent.counter = new Decimal(0);                
                    console.log(callingEvent.counter.toString())
                }

                callingEvent.progress.base = asD(callingEvent.counter).mul(callingEvent.power || new Decimal(10))

            } else if (callingEvent.tags.includes("perstep")) {
                let tSum = asD(player["mission"].missionStepCurrent).sub(new Decimal(1));
                
                callingEvent.progress.base = asD(tSum).mul(new Decimal(callingEvent.power || 1))
            }


            
        },
    },

    threatCapUp : {
        title : "Armor up",
        eventSide : "good",
        nextStepBehaviour : "keep",
        eventCheck(callingEvent, lastCallTime) {
            /*
            if ((Date.now() - lastCallTime) < callingEvent.cooldown) {
                return false
            } else {
            //*/

            return true
        },
        
        eventEffect(callingEvent, lastCallTime){
            if (callingEvent.treatCap == null || callingEvent.treatCap == undefined) callingEvent.threatCap = new FiveObject
            
            if(callingEvent.tags.includes("accumulate")) {
            (callingEvent.counter == null || callingEvent.counter == undefined)
                ? callingEvent.counter = new Decimal(0)
                : callingEvent.counter = asD(callingEvent.counter).add(new Decimal(1));
                
                callingEvent.threatCap.base = asD(callingEvent.counter).mul(new Decimal(callingEvent.power || 5))
            } else if(callingEvent.tags.includes("perenemyquantity")) {
                let tSum = new Decimal(0);
                
                player["mission"].actorList.forEach(                    
                    e => {
                        if (
                            (e.quantity != null || e.quantity != undefined)
                            && (e.side == "bad")
                            ) {
                                tSum = tSum.add(e.quantity)
                            } 
                    }
                )
                
                callingEvent.threatCap.base = asD(tSum).mul(new Decimal(callingEvent.power || 1))

            } else if (callingEvent.tags.includes("perstep")) {
                let tSum = asD(player["mission"].missionStepCurrent).sub(new Decimal(1));
                
                callingEvent.threatCap.base = asD(tSum).mul(new Decimal(callingEvent.power || 1))
            }
        },
    },

    /* obsolete with static threat rules    
    recover : {
        title : "Recover Threat",
        eventSide : "good",
        nextStepBehaviour : "keep",
        eventCheck(callingEvent, lastCallTime) {
            
            if(callingEvent.tags.includes("thresholdbased")) {
                if (asD(player["mission"].threat.value).div(player["mission"].threatCap.value).gte(callingEvent.recoverRatioThreshold) == 1) {
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
    */

    lifeup : {
        title : "HP growth",
        eventSide : "bad",
        eventCheck(callingEvent, lastCallTime) {
            /*
            if ((Date.now() - lastCallTime) < callingEvent.cooldown) {
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

    limitedaction : {
        title : "Limited Action",
        eventSide : "neutral",
        eventCheck(callingEvent, lastCallTime) {
            /*
            if ((Date.now() - lastCallTime) < callingEvent.cooldown) {
                return false
            } else {
            //*/

            return true
        },
        
        eventEffect(callingEvent, lastCallTime){
            (callingEvent.counter == null || callingEvent.counter == undefined)
                ? callingEvent.counter = new Decimal(0)
                : callingEvent.counter = asD(callingEvent.counter).sub(new Decimal(1));
            
            if(callingEvent.counter.lte(0)==1){
                addEvent(this,{name : "selfdestruct", title : "No more action"})
            }

            console.log ("action remaining " + callingEvent.counter)
        },
    },

    net : {
        title : "Net",
        eventSide : "bad", // eventSide is the default event side
        eventCheck : ()=>{return true},
        eventEffect(){console.log(this.name + " event fired")},
    },

    regen : {
        title : "Regen",
        eventLevel : new Decimal(1),
        eventSide : "neutral",
        eventCheck(callingEvent,lastCallTime) {return true},
        eventEffect(callingEvent,lastCallTime){
            let _power = asD(callingEvent.power) || new Decimal(10) // Regen %
            if (asD(this.life.remain).lt(this.life.value)) {
                this.life.remain = asD(this.life.remain).add(asD(this.life.value).mul(asD(_power).div(new Decimal(100)))).min(this.life.value);
                // if (asD(this.life.remain).gt(this.life.value) == 1) this.life.remain = this.life.value
            }
        },
    },

    selfdestruct : {
        title : "Die",
        eventLevel : new Decimal(1),
        eventSide : "netural",
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

    summonactor : {
        title : "Summon Actor",
        eventSide : "neutral", // eventSide is the default event side
        eventCheck(callingEvent, lastCallTime) {if (chancePercent(callingEvent.eventChance || 100)) return true},

        eventEffect(callingEvent, lastCallTime){
            let tPath = player["mission"].actorList;
            let tSummon = callingEvent.summonName;
            let tSummonLibName = actorLib[tSummon].name;
            let tPower = asD(callingEvent.power) || new Decimal(1);
            let tTags = callingEvent.tags || []

            // Tries to add to an existing group or create a new one
            let tTarget = tPath.find(e => e.name == tSummonLibName && !(tTags.includes("forcenewactor")));
            if (tTarget != null && tTarget != undefined) {
                tTarget.quantity = asD(tTarget.quantity).add(tPower);
            } else {
                addActor(tSummon,callingEvent.summonExtraParameters,callingEvent.summonExtraEvents);
            }

            console.log(this.name + " spawned " + tPower + " " + tSummon)
        },
    },

    test : {
        title : "test",
        eventSide : "test",
        eventCheck : ()=>{return true},
        eventEffect(functionCalled){console.log(this.name + " event fired " + functionCalled)},
    },

    weapon : {
        title : "Fire weapon",
        eventSide : "good",
        nextStepBehaviour : "keep",        
        
        eventCheck(callingEvent, lastCallTime) {
            /*
            if ((Date.now() - lastCallTime) < callingEvent.cooldown) {
                return false
            } else {
            //*/
            if (chancePercent(callingEvent.eventChance || 100)) return true
        },
        
        eventEffect(callingEvent, lastCallTime){
            let tPath = player["mission"].actorList;
            
            // Crit and modifier logic
            let tShotParameter = {
                shotDamage : new FiveObject(),
                shotCount : new FiveObject(),
            };
            tShotParameter.shotDamage.base = _.cloneDeep(callingEvent.shotDamage)
            tShotParameter.shotCount.base = _.cloneDeep(callingEvent.shotCount)
            
            tShotParameter = weaponModIterator.call(this , callingEvent , tShotParameter , lastCallTime );
            
            tShotParameter = _.cloneDeep(getFinalShotParameter(tShotParameter));
            //

            let potentialTargetIndexList = getActorIndexListByFilter(tPath,{side : otherSide(this.side)}); // return an index of array 
            let targetIndexList = pickFromIndexList(1, tPath, potentialTargetIndexList, callingEvent.favoredtargetTags); // return an index of array
            if (targetIndexList.length > 0) {
                for (let target of targetIndexList) { // call on each index of array
                    console.log(`${this.name} fired at ${tPath[target]?.name} with ${callingEvent.title}`);
                    // doDamage(tPath[target], callingEvent.shotCount,callingEvent.shotDamage);
                    console.log (`${tShotParameter.shotCount.value.toString()} shots ${tShotParameter.shotDamage.value} damage`)
                    tResult = doDamage(tPath[target], asD(tShotParameter.shotCount.value),asD(tShotParameter.shotDamage.value));
                    console.log(`shot left : ${tResult.shotCount.toString()} - kill ${tResult.killCount.toString()} - damage done : ${tResult.damageCount.toString()} `)
                }
            }
        },
    },
}

let modLib = {
    damageModifier : {
        //arg is always shotDamageValue, damageUpBase, damageUpMult, damageUpFlat
        eventCheck(callingEvent, callingMod, shotParameter, lastCallTime) {if (chancePercent(callingMod.eventChance || 100)) return true},
        eventEffect(callingEvent, callingMod, shotParameter, lastCallTime) {
            
            let tShotParameter = _.cloneDeep(shotParameter);
            if (callingMod.shotDamage != null || callingMod.shotDamage != undefined) {
                if (callingMod.shotDamage.base != null || callingMod.shotDamage.base != undefined) tShotParameter.shotDamage.base = asD(tShotParameter.shotDamage.base).add(callingMod.shotDamage.base);
                if (callingMod.shotDamage.flat != null || callingMod.shotDamage.flat != undefined) tShotParameter.shotDamage.flat = asD(tShotParameter.shotDamage.flat).add(callingMod.shotDamage.flat);
                if (callingMod.shotDamage.mult != null || callingMod.shotDamage.mult != undefined) tShotParameter.shotDamage.mult = asD(tShotParameter.shotDamage.mult).mul(callingMod.shotDamage.mult);
            }

            if (callingMod.shotCount != null || callingMod.shotCount != undefined) {
                if (callingMod.shotCount.base != null || callingMod.shotCount.base != undefined) tShotParameter.shotCount.base = asD(tShotParameter.shotCount.base).add(callingMod.shotCount.base);
                if (callingMod.shotCount.flat != null || callingMod.shotCount.flat != undefined) tShotParameter.shotCount.flat = asD(tShotParameter.shotCount.flat).add(callingMod.shotCount.flat);
                if (callingMod.shotCount.mult != null || callingMod.shotCount.mult != undefined) tShotParameter.shotCount.mult = asD(tShotParameter.shotCount.mult).mul(callingMod.shotCount.mult);
            }

            return tShotParameter
        },
    }
}

function getFinalShotParameter(shotParameter){
    shotParameter.shotDamage.value = asD(shotParameter.shotDamage.flat).add((asD(shotParameter.shotDamage.base).mul(shotParameter.shotDamage.mult)));
    shotParameter.shotCount.value = asD(shotParameter.shotCount.flat).add((asD(shotParameter.shotCount.base).mul(shotParameter.shotCount.mult)));

    return shotParameter
}

function weaponModIterator(callingEvent, shotParameter , lastCallTime) {
    if (callingEvent.modStorage != null && callingEvent.modStorage != undefined) {
        callingEvent.modStorage.forEach(
            e => {
                if (modLib[e.name].eventCheck.call(this, callingEvent, e, shotParameter, lastCallTime) == true) {
                    shotParameter = modLib[e.name].eventEffect.call(this, callingEvent, e, shotParameter, lastCallTime)
                }
            }
        )
    }

    return shotParameter
}