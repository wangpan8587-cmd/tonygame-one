/**
 * Card Logic Module
 * Handles card selection and game flow
 */
var CardManager = (function() {
    
    // Apply modifiers to card effects
    function applyModifiers(card, effects) {
        var modifierIds = GameState.getModifiers();
        var result = Object.assign({}, effects);
        
        modifierIds.forEach(function(modId) {
            var modifier = GameData.getModifier(modId);
            if (!modifier) return;
            
            var affects = modifier.affects;
            
            // Type-specific modifiers
            if (affects.type && affects.type === card.type && affects.statMult) {
                var mults = affects.statMult;
                for (var stat in mults) {
                    if (mults.hasOwnProperty(stat)) {
                        if (stat === 'all') {
                            Object.keys(result).forEach(function(key) {
                                result[key] = Math.round(result[key] * mults[stat]);
                            });
                        } else if (result[stat] !== undefined) {
                            result[stat] = Math.round(result[stat] * mults[stat]);
                        }
                    }
                }
            }
            
            // Global modifiers
            if (affects.global) {
                if (affects.kpiMult && result.kpi !== undefined) {
                    result.kpi = Math.round(result.kpi * affects.kpiMult);
                }
                if (affects.trustMult && result.trust !== undefined) {
                    result.trust = Math.round(result.trust * affects.trustMult);
                }
                if (affects.karmaMult && result.karma !== undefined) {
                    result.karma = Math.round(result.karma * affects.karmaMult);
                }
                if (affects.sanityMult && result.sanity !== undefined) {
                    result.sanity = Math.round(result.sanity * affects.sanityMult);
                }
                // Chaos mode: add randomness
                if (affects.chaos) {
                    for (var stat in result) {
                        if (result.hasOwnProperty(stat) && result[stat] !== 0) {
                            var randomVariance = Math.round(result[stat] * (Math.random() * 0.4 - 0.2)); // ±20%
                            result[stat] += randomVariance;
                        }
                    }
                }
            }
        });
        
        return result;
    }
    
    // Get a random card that hasn't been used recently
    function getRandomCard() {
        var cards = GameData.CARDS;
        var usedIndices = GameState.getUsedCardIndices();
        
        // Reset if all cards used
        if (usedIndices.length >= cards.length) {
            GameState.resetUsedCards();
            usedIndices = [];
        }
        
        // Get available cards
        var available = [];
        for (var i = 0; i < cards.length; i++) {
            if (usedIndices.indexOf(i) === -1) {
                available.push({ card: cards[i], index: i });
            }
        }
        
        // Random selection
        var randomIndex = Math.floor(Math.random() * available.length);
        var selected = available[randomIndex];
        
        // Mark as used
        GameState.markCardUsed(selected.index);
        
        return selected.card;
    }
    
    // Show a new card
    function showNextCard() {
        var card;
        var specialCardId = GameState.getForceSpecialCard();
        if (specialCardId) {
            card = GameData.getSpecialCard(specialCardId);
            GameState.clearForceSpecialCard();
            GameState.clearRecentChoices(); // Reset after triggering
        } else {
            card = getRandomCard();
        }
        GameState.setCurrentCard(card);
        
        GameUI.renderCard(card);
        GameUI.animateCardEnter();
    }
    
    // Check for flow breaker: 4 right swipes in 3 seconds
    function checkFlowBreaker() {
        var recent = GameState.getRecentChoices();
        if (recent.length < 4) return false;
        
        var lastFour = recent.slice(-4);
        var allRight = lastFour.every(function(choice) { return choice.direction === 'right'; });
        if (!allRight) return false;
        
        var timeDiff = lastFour[3].timestamp - lastFour[0].timestamp;
        if (timeDiff <= 3000) {
            GameState.setForceSpecialCard('flow_breaker');
            GameUI.showFlowBreakerAlert();
            return true;
        }
        return false;
    }
    
    // Check for stat warnings and show if needed
    function checkStatWarnings() {
        var currentStats = GameState.get().stats;
        var warnings = GameConfig.STAT_WARNINGS;
        
        for (var statKey in warnings) {
            if (warnings.hasOwnProperty(statKey)) {
                var warning = warnings[statKey];
                var currentValue = currentStats[statKey];
                
                // Trigger warning if below threshold and not yet warned
                if (currentValue < warning.threshold && !GameState.isStatWarned(statKey)) {
                    var message = warning.message.replace('{value}', currentValue);
                    GameUI.showToast(message, 2500, 'warning');
                    GameState.setStatWarned(statKey);
                }
                // Clear warning if recovered
                else if (currentValue >= warning.threshold && GameState.isStatWarned(statKey)) {
                    GameState.clearStatWarned(statKey);
                }
            }
        }
    }
    
    // Process player choice
    function processChoice(direction) {
        if (GameState.isAnimating() || GameState.isGameOver()) {
            return;
        }
        
        // Increment slide count and record the choice for flow breaker detection
        GameState.incrementSlideCount();
        GameState.addRecentChoice(direction);
        
        GameState.setAnimating(true);
        
        var card = GameState.getCurrentCard();
        var effects = direction === 'left' ? card.leftEffect : card.rightEffect;
        
        // Track previous title for promotion detection
        var prevTitleLevel = GameConfig.getCurrentTitleLevel(GameState.get().turn);
        
        // Apply modifiers to effects
        effects = applyModifiers(card, effects);
        
        // Reduce effect magnitude for better balance
        for (var key in effects) {
            if (effects.hasOwnProperty(key) && typeof effects[key] === 'number') {
                effects[key] = Math.round(effects[key] * 0.7);
            }
        }
        
        // Clamp effects to 5-15 range for most cards, allow critical hits over 20 for rare cases
        // Assuming no critical cards marked yet, clamp all to prevent extreme values
        for (var key in effects) {
            if (effects.hasOwnProperty(key) && typeof effects[key] === 'number') {
                var val = effects[key];
                if (val !== 0) {
                    var absVal = Math.abs(val);
                    if (absVal < 5) {
                        effects[key] = val > 0 ? 5 : -5;
                    } else if (absVal > 15) {
                        effects[key] = val > 0 ? 15 : -15;
                    }
                }
            }
        }
        
        // Apply trade-off: trust gain usually costs karma, kpi gain usually costs sanity
        if (effects.trust > 0 && (!effects.karma || effects.karma >= 0)) {
            effects.karma = (effects.karma || 0) - 5;
        }
        if (effects.kpi > 0 && (!effects.sanity || effects.sanity >= 0)) {
            effects.sanity = (effects.sanity || 0) - 5;
        }
        
        // Apply soft cap: rubber band mechanism (skip for special cards)
        if (card.type !== 'special') {
            var currentStats = GameState.get().stats;
            for (var key in effects) {
                if (effects.hasOwnProperty(key) && typeof effects[key] === 'number') {
                    var current = currentStats[key];
                    var effect = effects[key];
                    var factor = 1;
                    if (effect > 0) { // increase
                        factor = 1 + ((50 - current) / 50) * 0.1;
                    } else if (effect < 0) { // decrease
                        factor = 1 + ((current - 50) / 50) * 0.1;
                    }
                    effects[key] = Math.round(effect * factor);
                }
            }
        }
        
        // Animate card exit
        GameUI.animateCardExit(direction, function() {
            // Apply effects
            var changes = GameState.applyEffects(effects);
            GameUI.showStatChanges(changes);
            GameUI.updateStats();
            
            // Check for stat warnings
            checkStatWarnings();
            
            // Check for flow breaker every 20 slides
            if (GameState.getSlideCount() % 20 === 0) {
                checkFlowBreaker();
            }
            
            // Check for ending
            var ending = GameState.checkEnding();
            
            if (ending) {
                GameState.setGameOver(true);
                GameUI.showEnding(ending);
                GameState.setAnimating(false);
                return;
            }
            
            // Continue game - reset card immediately for next display
            GameState.nextTurn();
            
            // Check for title promotion
            var newTitleLevel = GameConfig.getCurrentTitleLevel(GameState.get().turn);
            if (newTitleLevel !== prevTitleLevel) {
                var newTitle = GameData.TITLES[newTitleLevel];
                if (newTitle) {
                    GameUI.showPromotion(newTitle);
                }
            }
            
            GameUI.updateTurn();
            GameUI.updateTitle();
            
            // Prepare and show next card with minimal delay
            showNextCard();
            
            GameState.setAnimating(false);
        });
    }
    
    // Public API
    return {
        showNextCard: showNextCard,
        processChoice: processChoice
    };
    
})();
    