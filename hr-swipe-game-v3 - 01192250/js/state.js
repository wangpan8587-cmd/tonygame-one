/**
 * Game State Management
 * Handles all mutable game state
 */
var GameState = (function() {
    
    var state = null;
    
    // Initialize or reset state
    function init() {
        state = {
            stats: Object.assign({}, GameConfig.INITIAL_STATS),
            turn: 1,
            currentCard: null,
            isAnimating: false,
            usedCardIndices: [],
            isGameOver: false,
            modifiers: [],
            gameStarted: false,
            endingReason: null,
            warnedStats: {}, // Track warned stats: {statKey: true}
            modifierRerollCount: GameConfig.MODIFIER_REROLL_COUNT,
            currentModifierId: null,
            playerName: null,
            recentChoices: [], // Track recent 5 choices for flow breaker
            forceSpecialCard: null, // Special card to force show
            slideCount: 0 // Total slide count for flow breaker frequency
        };
        return state;
    }
    
    // Get current state (read-only copy)
    function get() {
        return state;
    }
    
    // Get specific stat value
    function getStat(key) {
        return state.stats[key];
    }
    
    // Set stat value (clamped)
    function setStat(key, value) {
        state.stats[key] = GameConfig.clampStat(value);
    }
    
    // Apply effects object to stats
    function applyEffects(effects) {
        var changes = {};
        
        GameConfig.STAT_KEYS.forEach(function(key) {
            if (effects[key] !== undefined) {
                var oldValue = state.stats[key];
                
                // 如果当前值已经是100且要增加，则不应用正向effects
                if (oldValue >= GameConfig.STAT_MAX && effects[key] > 0) {
                    // 不应用变化，保持100
                    changes[key] = 0; // 记录为0变化
                } else {
                    var newValue = GameConfig.clampStat(oldValue + effects[key]);
                    state.stats[key] = newValue;
                    changes[key] = effects[key];
                }
            }
        });
        
        return changes;
    }
    
    // Increment turn counter
    function nextTurn() {
        state.turn++;
        return state.turn;
    }
    
    // Set current card
    function setCurrentCard(card) {
        state.currentCard = card;
    }
    
    // Get current card
    function getCurrentCard() {
        return state.currentCard;
    }
    
    // Mark card as used
    function markCardUsed(index) {
        state.usedCardIndices.push(index);
    }
    
    // Get used card indices
    function getUsedCardIndices() {
        return state.usedCardIndices;
    }
    
    // Reset used cards (when all have been shown)
    function resetUsedCards() {
        state.usedCardIndices = [];
    }
    
    // Add recent choice
    function addRecentChoice(direction) {
        state.recentChoices.push({ timestamp: Date.now(), direction: direction });
        if (state.recentChoices.length > 5) {
            state.recentChoices.shift(); // Keep only last 5
        }
    }
    
    // Get recent choices
    function getRecentChoices() {
        return state.recentChoices;
    }
    
    // Clear recent choices
    function clearRecentChoices() {
        state.recentChoices = [];
    }
    
    // Set force special card
    function setForceSpecialCard(cardId) {
        state.forceSpecialCard = cardId;
    }
    
    // Get force special card
    function getForceSpecialCard() {
        return state.forceSpecialCard;
    }
    
    // Clear force special card
    function clearForceSpecialCard() {
        state.forceSpecialCard = null;
    }
    
    // Get slide count
    function getSlideCount() {
        return state.slideCount;
    }
    
    // Increment slide count
    function incrementSlideCount() {
        state.slideCount++;
    }
    
    // Set animation lock
    function setAnimating(value) {
        state.isAnimating = value;
    }
    
    // Check if animating
    function isAnimating() {
        return state.isAnimating;
    }
    
    // Set game over
    function setGameOver(value) {
        state.isGameOver = value;
    }
    
    // Check if game is over
    function isGameOver() {
        return state.isGameOver;
    }
    
    // Get current title based on turn
    function getCurrentTitle() {
        var levels = GameConfig.TITLE_LEVELS;
        var currentLevel = levels[0];
        
        for (var i = levels.length - 1; i >= 0; i--) {
            if (state.turn >= levels[i].day) {
                currentLevel = levels[i];
                break;
            }
        }
        
        return GameData.getTitle(currentLevel.key);
    }
    
    // Check for ending condition
    function checkEnding() {
        var triggers = GameConfig.ENDING_TRIGGERS;
        
        for (var key in triggers) {
            if (triggers.hasOwnProperty(key) && triggers[key](state.stats)) {
                var endingInfo = GameData.getEnding(key);
                // Extract stat and level from trigger key
                var parts = key.match(/(\w+)(Low|High)/);
                if (parts) {
                    var stat = parts[1];
                    var level = parts[2] === 'Low' ? '归零' : '爆表';
                    state.endingReason = {
                        stat: stat,
                        level: level,
                        statName: GameConfig.STAT_NAMES[stat]
                    };
                }
                return endingInfo;
            }
        }
        
        return null;
    }
    
    // Get ending reason
    function getEndingReason() {
        return state.endingReason;
    }
    
    // Set modifiers for this run
    function setModifiers(modifierIds) {
        state.modifiers = modifierIds;
    }
    
    // Get current modifiers
    function getModifiers() {
        return state.modifiers;
    }
    
    // Check if has modifier
    function hasModifier(modifierId) {
        return state.modifiers.indexOf(modifierId) !== -1;
    }
    
    // Mark game as started
    function startGame() {
        state.gameStarted = true;
    }
    
    // Check if game started
    function isGameStarted() {
        return state.gameStarted;
    }
    
    // Public API
    return {
        init: init,
        get: get,
        getStat: getStat,
        setStat: setStat,
        applyEffects: applyEffects,
        nextTurn: nextTurn,
        setCurrentCard: setCurrentCard,
        getCurrentCard: getCurrentCard,
        markCardUsed: markCardUsed,
        getUsedCardIndices: getUsedCardIndices,
        resetUsedCards: resetUsedCards,
        addRecentChoice: addRecentChoice,
        getRecentChoices: getRecentChoices,
        clearRecentChoices: clearRecentChoices,
        setForceSpecialCard: setForceSpecialCard,
        getForceSpecialCard: getForceSpecialCard,
        clearForceSpecialCard: clearForceSpecialCard,
        getSlideCount: getSlideCount,
        incrementSlideCount: incrementSlideCount,
        setAnimating: setAnimating,
        isAnimating: isAnimating,
        setGameOver: setGameOver,
        isGameOver: isGameOver,
        getCurrentTitle: getCurrentTitle,
        checkEnding: checkEnding,
        getEndingReason: getEndingReason,
        setModifiers: setModifiers,
        getModifiers: getModifiers,
        hasModifier: hasModifier,
        startGame: startGame,
        isGameStarted: isGameStarted,
        setStatWarned: function(statKey) { state.warnedStats[statKey] = true; },
        isStatWarned: function(statKey) { return state.warnedStats[statKey] === true; },
        clearStatWarned: function(statKey) { delete state.warnedStats[statKey]; },
        setModifierRerollCount: function(count) { state.modifierRerollCount = count; },
        getModifierRerollCount: function() { return state.modifierRerollCount; },
        setCurrentModifierId: function(id) { state.currentModifierId = id; },
        getCurrentModifierId: function() { return state.currentModifierId; },
        setPlayerName: function(name) { state.playerName = name; },
        getPlayerName: function() { return state.playerName; }
    };
    
})();