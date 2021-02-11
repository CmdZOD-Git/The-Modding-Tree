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
	symbol: "x3",
    branches: [],
    layerShown: true,
    tooltip: "Speed x3",
    // tooltipLocked: "Restore your points to 10",
    row: "side",
    canClick() {return player.extraTime > 1},
    onClick() {
    	player.extraSpeed = 3
	}
},)