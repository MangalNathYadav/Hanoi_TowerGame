// This is a helper file with the startLoadingSequence method to be added to the game
startLoadingSequence() {
  // Stop any existing interval to prevent multiple intervals running
  if (this.state.loadingInterval) {
    clearInterval(this.state.loadingInterval);
    this.state.loadingInterval = null;
  }

  // Reset progress bar to start fresh
  let progress = 0;
  if (this.dom.loadingBar) {
    this.dom.loadingBar.style.width = '0%';
  }
  if (this.dom.loadingProgress) {
    this.dom.loadingProgress.textContent = '0%';
  }
  
  // Start new loading interval - use a faster interval for smoother animation
  this.state.loadingInterval = setInterval(() => {
    try {
      if (progress >= 100) {
        // Clean up interval
        clearInterval(this.state.loadingInterval);
        this.state.loadingInterval = null;
        
        // Set final loading state
        if (this.dom.loadingBar) {
          this.dom.loadingBar.style.width = '100%';
        }
        if (this.dom.loadingProgress) {
          this.dom.loadingProgress.textContent = '100%';
        }
        
        // Mark as initialized immediately
        this.state.initialized = true;
        this.state.loading = false;

        // Shorter pause at 100% for better user experience
        setTimeout(() => {
          this.finishLoading();
        }, 50);
      } else {
        // Increment progress with an acceleration curve for realistic loading feel
        const increment = progress < 70 ? 3 : 1.5; // Faster at start, slower near end
        progress = Math.min(100, progress + increment);
        
        // Update loading UI with immediate rendering
        if (this.dom.loadingBar) {
          this.dom.loadingBar.style.width = `${progress}%`;
          // Force a reflow to ensure the animation shows
          this.dom.loadingBar.offsetHeight;
        }
        if (this.dom.loadingProgress) {
          this.dom.loadingProgress.textContent = `${Math.round(progress)}%`;
        }
      }
    } catch (error) {
      console.error('Error in loading sequence:', error);
      // Ensure interval is cleared on error
      clearInterval(this.state.loadingInterval);
      this.state.loadingInterval = null;
      
      // Show error state
      if (this.dom.loadingProgress) {
        this.dom.loadingProgress.textContent = 'Error loading game';
      }
      
      // Force finishLoading after a brief delay to avoid getting stuck
      setTimeout(() => this.finishLoading(), 300);
    }
  }, 20);
}
