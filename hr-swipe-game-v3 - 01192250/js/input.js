/**
 * Input Handling Module
 * Handles swipe gestures and keyboard input
 */
var InputHandler = (function() {
    
    var startX = 0;
    var currentX = 0;
    var isDragging = false;
    
    // Mouse/touch start
    function handleDragStart(e) {
        if (GameState.isAnimating() || GameState.isGameOver()) {
            return;
        }
        
        isDragging = true;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        currentX = startX;
        
        GameUI.disableCardTransition();
    }
    
    // Mouse/touch move
    function handleDragMove(e) {
        if (!isDragging) return;
        
        currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        var deltaX = currentX - startX;
        
        GameUI.updateCardPosition(deltaX);
    }
    
    // Mouse/touch end
    function handleDragEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        var deltaX = currentX - startX;
        var velocity = Math.abs(deltaX) / 100; // Simple velocity calculation
        
        // Trigger choice if swipe threshold met OR high velocity
        if (deltaX < -GameConfig.SWIPE_THRESHOLD || (deltaX < -20 && velocity > 0.5)) {
            CardManager.processChoice('left');
        } else if (deltaX > GameConfig.SWIPE_THRESHOLD || (deltaX > 20 && velocity > 0.5)) {
            CardManager.processChoice('right');
        } else {
            GameUI.resetCardPosition();
        }
    }
    
    // Keyboard handler
    function handleKeydown(e) {
        if (e.key === 'ArrowLeft') {
            CardManager.processChoice('left');
        } else if (e.key === 'ArrowRight') {
            CardManager.processChoice('right');
        }
    }
    
    // Initialize event listeners
    function init() {
        var card = GameUI.getCardElement();
        
        // Mouse events
        card.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        
        // Touch events
        card.addEventListener('touchstart', handleDragStart);
        document.addEventListener('touchmove', handleDragMove);
        document.addEventListener('touchend', handleDragEnd);
        
        // Keyboard events
        document.addEventListener('keydown', handleKeydown);
    }
    
    // Cleanup (if needed for module unloading)
    function destroy() {
        var card = GameUI.getCardElement();
        
        card.removeEventListener('mousedown', handleDragStart);
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        
        card.removeEventListener('touchstart', handleDragStart);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
        
        document.removeEventListener('keydown', handleKeydown);
    }
    
    // Public API
    return {
        init: init,
        destroy: destroy
    };
    
})();