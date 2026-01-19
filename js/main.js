/**
 * Main Entry Point
 * Game initialization and control flow
 */
var Game = (function() {
    
    // Show modifier selection screen
    function showModifierSelection() {
        GameState.init();
        var modifier = GameData.getRandomModifiers(1)[0];
        GameState.setCurrentModifierId(modifier.id);
        GameState.setModifierRerollCount(GameConfig.MODIFIER_REROLL_COUNT);
        GameUI.showModifierSelection(modifier);
    }
    
    // Reroll modifier
    function rerollModifier() {
        var count = GameState.getModifierRerollCount();
        if (count <= 0) {
            GameUI.showToast('已用完随机机会', 1500, 'default');
            return;
        }
        count--;
        GameState.setModifierRerollCount(count);
        GameUI.updateRerollCounter(count);
        var modifier = GameData.getRandomModifiers(1)[0];
        GameState.setCurrentModifierId(modifier.id);
        GameUI.showModifierSelection(modifier);
    }
    
    // Start game after modifier selection
    function startWithModifiers() {
        var playerName = GameUI.getPlayerName();
        if (!playerName) {
            GameUI.showToast('请输入或选择一个名字', 1500, 'default');
            return;
        }
        
        var modifierId = GameState.getCurrentModifierId();
        GameState.setPlayerName(playerName);
        GameState.setModifiers([modifierId]);
        GameState.startGame();
        GameUI.hideModifierSelection();
        GameUI.renderModifiers([modifierId]);
        GameUI.refresh();
        CardManager.showNextCard();
    }
    
    // Restart game
    function restart() {
        GameState.init();
        GameUI.reset();
        showModifierSelection();
    }
    
    // Initialize everything
    function init() {
        // Initialize modules
        GameUI.init();
        InputHandler.init();
        
        // Bind button events
        document.getElementById('startBtn').addEventListener('click', showModifierSelection);
        document.getElementById('modifierConfirmBtn').addEventListener('click', startWithModifiers);
        document.getElementById('restartBtn').addEventListener('click', restart);
        
        // Bind modifier reroll button
        var rerollBtn = document.getElementById('modifierRerollBtn');
        if (rerollBtn) {
            rerollBtn.addEventListener('click', rerollModifier);
        }
        
        // Bind name random button
        var nameRandomBtn = document.getElementById('nameRandomBtn');
        if (nameRandomBtn) {
            nameRandomBtn.addEventListener('click', function() {
                var randomName = GameData.getRandomName();
                GameUI.selectPlayerName(randomName);
            });
        }
        
        // Bind name input for real-time selection
        var nameInput = document.getElementById('playerNameInput');
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                if (this.value.trim()) {
                    GameState.setPlayerName(this.value.trim());
                }
            });
        }
    }
    
    // Public API
    return {
        init: init,
        showModifierSelection: showModifierSelection,
        rerollModifier: rerollModifier,
        startWithModifiers: startWithModifiers,
        restart: restart
    };
    
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    Game.init();
});