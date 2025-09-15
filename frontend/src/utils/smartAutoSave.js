// Smart Auto-Save Utility
// Optimizes auto-save frequency and reduces server load

class SmartAutoSave {
    constructor(options = {}) {
        this.delay = options.delay || 5000; // 5 seconds default
        this.maxDelay = options.maxDelay || 30000; // 30 seconds max
        this.minChanges = options.minChanges || 3; // Minimum changes before auto-save
        this.lastSave = null;
        this.changeCount = 0;
        this.timeoutId = null;
        this.lastContent = '';
        this.isSaving = false;
    }

    // Check if content has actually changed
    hasContentChanged(newContent) {
        return newContent !== this.lastContent && newContent.trim().length > 0;
    }

    // Check if enough time has passed since last save
    shouldSave() {
        if (!this.lastSave) return true;
        const timeSinceLastSave = Date.now() - this.lastSave;
        return timeSinceLastSave > this.delay;
    }

    // Check if enough changes have been made
    hasEnoughChanges() {
        return this.changeCount >= this.minChanges;
    }

    // Smart auto-save trigger
    triggerAutoSave(newContent, saveFunction) {
        // Clear existing timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Check if content has changed
        if (!this.hasContentChanged(newContent)) {
            return;
        }

        // Update change count and last content
        this.changeCount++;
        this.lastContent = newContent;

        // Determine delay based on change frequency
        const dynamicDelay = Math.min(this.delay * (this.changeCount / this.minChanges), this.maxDelay);

        // Set up auto-save
        this.timeoutId = setTimeout(async () => {
            if (this.isSaving) return;

            // Check if we should save
            if (this.shouldSave() && this.hasEnoughChanges()) {
                this.isSaving = true;
                try {
                    await saveFunction();
                    this.lastSave = Date.now();
                    this.changeCount = 0;
                    console.log('✅ Smart auto-save completed');
                } catch (error) {
                    console.error('❌ Smart auto-save failed:', error);
                } finally {
                    this.isSaving = false;
                }
            }
        }, dynamicDelay);
    }

    // Force save (for timer end, page leave, etc.)
    async forceSave(saveFunction) {
        if (this.isSaving) return;

        this.isSaving = true;
        try {
            await saveFunction();
            this.lastSave = Date.now();
            this.changeCount = 0;
            console.log('✅ Force auto-save completed');
        } catch (error) {
            console.error('❌ Force auto-save failed:', error);
        } finally {
            this.isSaving = false;
        }
    }

    // Reset the auto-save state
    reset() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.lastSave = null;
        this.changeCount = 0;
        this.lastContent = '';
        this.isSaving = false;
    }
}

export default SmartAutoSave;
