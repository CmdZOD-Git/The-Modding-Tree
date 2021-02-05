function equipIsBuyable(cost) {
    tResult = true;
    tPath = player["hero"]

    for (currency in cost) {
        if(asD(player["hero"][currency]).lt(cost[currency])) tResult = false
    }
    return tResult
}

function equipPay(cost) {
    tPath = player["hero"]

    for (currency in cost) {
        tPath[currency] = tPath[currency].sub(cost[currency])
    }
}

function equipRefund(cost) {
    tPath = player["hero"]

    for (currency in cost) {
        tPath[currency] = tPath[currency].add(cost[currency])
    }
}

function totalEquipCost(currency) {
    let tResultArray = [[],[]];
    for (e in tmp["hero"].clickables) {
        if(!isNaN(e)){ // select only pseudo array object
            for (f in tmp["hero"].clickables[e].cost) {
                if (player["hero"].clickables[e] == "equiped") {
                    if (tResultArray[0].includes(f)) {
                        let arrIndex = tResultArray[0].indexOf(f)
                        tResultArray[1][arrIndex] = tResultArray[1][arrIndex].add(tmp["hero"].clickables[e].cost[f])
                    } else {
                        tResultArray[0].push(f)
                        tResultArray[1].push(tmp["hero"].clickables[e].cost[f])
                    }
                }
            }
        }
    }
    return tResultArray
}

function getEventLoadout(){
    let tResultArray = [];
    for (e in tmp["hero"].clickables) {
        if(!isNaN(e)){ // select only pseudo array object
            if (player["hero"].clickables[e] == "equiped" && (tmp["hero"].clickables[e].event)) {
                for (f of tmp["hero"].clickables[e].event) {
                    if (player["hero"].clickables[e] == "equiped") {
                        tResultArray.push(f)                    
                    }
                }
            }
        }
    }
    return tResultArray;
}

function getEquippedEventTitle(loadoutArray){
    let tString = ""
    loadoutArray.forEach(e => {tString = `${tString}[${e.title.toString()}]`})    
return tString
}

addLayer("hero", {
    name: "Hero", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		
        points: new Decimal(1),
		xp : new Decimal(0),
        
        equipMax: new Decimal(10),
        equipPoints: new Decimal(9),

        weaponSlot: new Decimal(0),
        weaponSlotMax : new Decimal(1),
        
        clickables : {[11] : "equiped"},

        equipedEvent : [], // array of effect to Add to Hero Actor eventStorage
        /*
        { need Name, optional Title
            name : "burst",
            title : "hero event test",
        },
        */
    }},
	
    tabFormat: {
        "Hero": {
            content:
                [
                "main-display",
                "resource-display",
                ["prestige-button","text to prestige here "],
                "buyables",
                "clickables",
                "upgrades",
                "milestones",
                ],
        },

        "Class": {
            content:
                [
                ["display-text","Class stuff goes here"],
                "buyables",
                "clickables",
                "upgrades",
                "milestones",
                ],
        },
        
        "Weapon": {
            content:
                [
                //["display-text","Weapon stuff goes here"],
                ["display-text",() => {return "You have " + formatWhole(player["hero"].equipPoints) + " of " + formatWhole(player["hero"].equipMax) + " Equip Points"}],
                ["display-text",() => {return "You have " + formatWhole(player["hero"].weaponSlot) + " of " + formatWhole(player["hero"].weaponSlotMax) + " Weapon Slots"}],
                ["display-text",() => {return `${getEquippedEventTitle(getEventLoadout())}`}],
                ["blank","10px"],
                "buyables",
                "clickables",
                "upgrades",
                "milestones",
                ],
        },

        "Gear": {
            content:
                [
                ["display-text",() => {return "You have " + formatWhole(player["hero"].equipPoints) + " of " + formatWhole(player["hero"].equipMax) + " Equip Points"}],
                ["blank","10px"],
                "buyables",
                "clickables",
                "upgrades",
                "milestones",
                ],
        },

    },

	branches:["hq"],
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Levels", // Name of prestige currency
    baseResource: "XP", // Name of resource prestige is based on
    baseAmount() {return player.hero.xp}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
	base:new Decimal(10),
    resetNothing : true,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 15, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "H: Reset for prestige points", onPress(){showTab("hero")}},
    ],
    layerShown : true,

    clickables: {
        masterButtonPress(){return console.log("Master button clicked !")},
        masterButtonText: "Reset equipments",
        showMasterButton(){
            let showInArray = ["Weapon","Gear"] // Defaults to true if absent, put subtabs in array you want master button in
            return [showInArray].some(a => a == player.subtabs["hero"].mainTabs) ? true : false}, 
        rows: 9,
        cols: 9,

        11: {
            title:"M-X16",
            equipTab : "Weapon", //Capitalized to match tabs name

            cost:{
                equipPoints: new Decimal(1),
                weaponSlot: new Decimal(1)
            },

            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{name : "weapon",
                title : "Rifle",
                eventCooldown : new Decimal(1000), // in millisecond
                shotCount : new Decimal(3),
                shotDamage : new Decimal(10),
            }],
        },

        12: {
            title:"Shotgun Ben2",
            equipTab : "Weapon", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
                weaponSlot: new Decimal(1)
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "weapon",
                title : "Shotgun",
                eventCooldown : new Decimal(1000), // in millisecond
                shotCount : new Decimal(6),
                shotDamage : new Decimal(5),
            }],
        },

        13: {
            title:"Rocket Launcher",
            equipTab : "Weapon", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(5),
                weaponSlot: new Decimal(1)
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "weapon",
                title : "Rocket",
                eventCooldown : new Decimal(1000), // in millisecond
                shotCount : new Decimal(1),
                shotDamage : new Decimal(100),
            }],
        },

        61: {
            title:"Medikit",
            equipTab : "Gear", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "recover",
                title : "Over threat recover",
                cooldown : new Decimal(1000), // in millisecond
                recoverAmount : new Decimal(10),
                recoverRatioThreshold : new Decimal(1),
                tags : ["thresholdbased"],
            }],
        },

        62: {
            title:"Recover kit",
            equipTab : "Gear", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "recover",
                title : "No enemy fast recovery",
                cooldown : new Decimal(1000), // in millisecond
                recoverAmount : new Decimal(20),
                //recoverRatioThreshold : new Decimal(0),
                tags : ["noenemyleft"]
            }],
        },

        63: {
            title:"Grenade",
            equipTab : "Gear", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "weapon",
                title : "Grenade",
                cooldown : new Decimal(1000), // in millisecond
                eventChance : 10, // flat int percent chance to fire
                shotCount : new Decimal(10),
                shotDamage : new Decimal(10),
            }],
        },

        64: {
            title:"Armor",
            equipTab : "Gear", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "armor",
                title : "Armor up",
                cooldown : new Decimal(1000), // in millisecond
            }],
        },
    },

    update(diff){
    },
})