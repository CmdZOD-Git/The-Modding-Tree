var layoutInfo = {
    startTab: "none",
	showTree: true,

    treeLayout: ""

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)


addLayer("tree-tab", {
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]]
})

addNode("x1", {
    position : 1,
	symbol : "x1",
    branches: [],
    layerShown: true,
    tooltip: "Normal speed",
    // tooltipLocked: "Restore your points to 10",
    row: "side",
    canClick() {return true},
    onClick() {
    	player.extraSpeed = 1
	}
},)

addNode("x3", {
    position : 3,
	symbol: "x3",
    branches: [],
    layerShown: true,
    tooltip: "Speed x3",
    // tooltipLocked: "Restore your points to 10",
    row: "side",
    canClick() {return player.extraTime > 3},
    onClick() {
    	player.extraSpeed = 3
	}
},)

addNode("x5", {
    position : 5,
	symbol: "x5",
    branches: [],
    layerShown: true,
    tooltip: "Speed x5",
    // tooltipLocked: "Restore your points to 10",
    row: "side",
    canClick() {return player.extraTime > 5},
    onClick() {
    	player.extraSpeed = 5
	}
},)

addNode("x10", {
    position : 10,
	symbol: "x10",
    branches: [],
    layerShown: true,
    tooltip: "Speed x10",
    // tooltipLocked: "Restore your points to 10",
    row: "side",
    canClick() {return player.extraTime > 10},
    onClick() {
    	player.extraSpeed = 10
	}
},)

addNode("x30", {
    position : 30,
	symbol: "x30",
    branches: [],
    layerShown: true,
    tooltip: "Speed x30",
    // tooltipLocked: "Restore your points to 10",
    row: "side",
    canClick() {return player.extraTime > 30},
    onClick() {
    	player.extraSpeed = 30
	}
},)