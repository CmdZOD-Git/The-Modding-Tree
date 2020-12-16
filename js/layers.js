addLayer("p", {
    name: "mission", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "missions", // Name of prestige currency
    baseResource: "victory points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    roundUpCost:"true",
    exponent: 0, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset to move to next mission", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    milestones: {
        2: {requirementDescription: "2 Missions complete",
            done() {return player[this.layer].best.gte(2)}, // Used to determine when to give the milestone
            effectDescription: "prologue : unlock soldier layer",
        },
        4: {requirementDescription: "4 missions complete",
            unlocked() {return hasMilestone(this.layer, 2)},
            done() {return player[this.layer].best.gte(4)},
            effectDescription: "tutorial : unlock weapon layer",
            },
    },
})