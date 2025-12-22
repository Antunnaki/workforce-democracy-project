/**
 * WDP Form Validator v36.9.11
 * Privacy-First Client-Side Form Validation with Friendly Error Messages
 * 
 * Features:
 * - Real-time validation feedback as user types
 * - Friendly "😊 Oops!" error messages matching site personality
 * - Success confirmations with visual feedback
 * - Keyboard navigation support (Enter to submit, Escape to clear)
 * - ARIA live regions for screen reader announcements
 * - Zero external dependencies
 * - All validation happens client-side in browser
 */

class FormValidator {
    constructor() {
        this.version = '36.9.11';
        this.validators = {
            postcode: this.validatePostcode.bind(this),
            search: this.validateSearch.bind(this),
            chat: this.validateChat.bind(this),
            email: this.validateEmail.bind(this),
            required: this.validateRequired.bind(this)
        };
        
        // Validation rules configuration
        this.rules = {
            postcode: {
                minLength: 3,
                maxLength: 12,
                pattern: /^[A-Z0-9\s-]+$/i,
                friendlyName: 'postcode or zip code'
            },
            search: {
                minLength: 2,
                maxLength: 200,
                friendlyName: 'search query'
            },
            chat: {
                minLength: 5,
                maxLength: 2000,
                friendlyName: 'message'
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                friendlyName: 'email address'
            }
        };
        
        this.initializeValidation();
    }
    
    /**
     * Initialize validation for all form fields on the page
     */
    initializeValidation() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachValidators());
        } else {
            this.attachValidators();
        }
    }
    
    /**
     * Attach validators to form fields based on their data attributes
     */
    attachValidators() {
        // Find all inputs and textareas with validation requirements
        const fields = document.querySelectorAll('[data-validate], input[type="search"], input[type="email"], textarea');
        
        fields.forEach(field => {
            // Determine validation type
            const validationType = field.dataset.validate || this.inferValidationType(field);
            
            if (!validationType) return; // Skip if no validation needed
            
            // Add validation attributes
            field.setAttribute('data-validation-type', validationType);
            field.setAttribute('aria-invalid', 'false');
            
            // Create ARIA live region for announcements if it doesn't exist
            this.ensureAriaLiveRegion(field);
            
            // Real-time validation on input
            field.addEventListener('input', (e) => this.handleInput(e, validationType));
            
            // Validate on blur (when user leaves field)
            field.addEventListener('blur', (e) => this.handleBlur(e, validationType));
            
            // Keyboard shortcuts
            field.addEventListener('keydown', (e) => this.handleKeydown(e, field));
            
            // Initialize styling
            this.addValidationWrapper(field);
        });
        
        console.log(`✅ [FormValidator v${this.version}] Initialized validation for ${fields.length} fields`);
    }
    
    /**
     * Infer validation type from field attributes
     */
    inferValidationType(field) {
        const id = field.id?.toLowerCase() || '';
        const placeholder = field.placeholder?.toLowerCase() || '';
        const type = field.type?.toLowerCase() || '';
        
        // Postcode/ZIP fields
        if (id.includes('postcode') || id.includes('zip') || 
            placeholder.includes('postcode') || placeholder.includes('zip')) {
            return 'postcode';
        }
        
        // Search fields
        if (type === 'search' || id.includes('search') || placeholder.includes('search')) {
            return 'search';
        }
        
        // Email fields
        if (type === 'email' || id.includes('email')) {
            return 'email';
        }
        
        // Chat/message fields
        if (field.tagName === 'TEXTAREA' && (id.includes('chat') || placeholder.includes('ask'))) {
            return 'chat';
        }
        
        // Generic required field
        if (field.hasAttribute('required')) {
            return 'required';
        }
        
        return null; // No validation needed
    }
    
    /**
     * Ensure ARIA live region exists for screen reader announcements
     */
    ensureAriaLiveRegion(field) {
        const existingRegion = field.parentElement.querySelector('.validation-aria-live');
        if (!existingRegion) {
            const liveRegion = document.createElement('div');
            liveRegion.className = 'validation-aria-live';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            field.parentElement.appendChild(liveRegion);
        }
    }
    
    /**
     * Add validation wrapper with error/success message containers
     */
    addValidationWrapper(field) {
        // Check if already wrapped
        if (field.parentElement.classList.contains('validation-wrapper')) {
            return;
        }
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'validation-wrapper';
        
        // Insert wrapper
        field.parentNode.insertBefore(wrapper, field);
        wrapper.appendChild(field);
        
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.className = 'validation-message';
        messageContainer.setAttribute('role', 'alert');
        messageContainer.setAttribute('aria-live', 'polite');
        wrapper.appendChild(messageContainer);
    }
    
    /**
     * Handle input event with real-time validation
     */
    handleInput(event, validationType) {
        const field = event.target;
        const value = field.value.trim();
        
        // Clear previous validation state if user is typing
        if (value.length > 0) {
            this.clearValidationState(field);
        }
        
        // Only show errors after user has typed a meaningful amount
        if (value.length >= 3 || (field.dataset.hasBlurred === 'true')) {
            // Debounce validation to avoid too many checks while typing
            clearTimeout(field.validationTimeout);
            field.validationTimeout = setTimeout(() => {
                this.validateField(field, validationType);
            }, 500); // Wait 500ms after user stops typing
        }
    }
    
    /**
     * Handle blur event (when user leaves field)
     */
    handleBlur(event, validationType) {
        const field = event.target;
        field.dataset.hasBlurred = 'true';
        
        // Validate immediately on blur
        this.validateField(field, validationType);
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeydown(event, field) {
        // Escape key: Clear field and validation
        if (event.key === 'Escape') {
            field.value = '';
            this.clearValidationState(field);
            event.preventDefault();
        }
        
        // Enter key on single-line inputs: Trigger any associated button
        if (event.key === 'Enter' && field.tagName !== 'TEXTAREA') {
            const associatedButton = this.findAssociatedButton(field);
            if (associatedButton) {
                event.preventDefault();
                associatedButton.click();
            }
        }
    }
    
    /**
     * Find the submit button associated with this field
     */
    findAssociatedButton(field) {
        // Look for button in same parent container
        const container = field.closest('.wdp-personalization-simple, .civic-controls-compact, .search-input-container, .faq-search-wrapper, .search-box, .inline-chat-input-area, .bills-chat-input-container-top');
        
        if (container) {
            return container.querySelector('button[type="submit"], button:not([type])');
        }
        
        return null;
    }
    
    /**
     * Main validation logic - validates field and shows feedback
     */
    validateField(field, validationType) {
        const value = field.value.trim();
        const validator = this.validators[validationType];
        
        if (!validator) {
            console.warn(`No validator found for type: ${validationType}`);
            return true;
        }
        
        const result = validator(value, field);
        
        if (result.valid) {
            this.showSuccess(field, result.message);
            return true;
        } else {
            this.showError(field, result.message);
            return false;
        }
    }
    
    /**
     * Validate postcode/ZIP code
     */
    validatePostcode(value, field) {
        const rules = this.rules.postcode;
        
        if (!value || value.length === 0) {
            // Empty is okay for optional fields
            if (!field.hasAttribute('required')) {
                return { valid: true, message: '' };
            }
            return { 
                valid: false, 
                message: `😊 Oops! Please enter your ${rules.friendlyName}.` 
            };
        }
        
        if (value.length < rules.minLength) {
            return { 
                valid: false, 
                message: `😊 Oops! ${rules.friendlyName} is a bit short. Please enter at least ${rules.minLength} characters.` 
            };
        }
        
        if (value.length > rules.maxLength) {
            return { 
                valid: false, 
                message: `😊 Oops! ${rules.friendlyName} is too long. Please keep it under ${rules.maxLength} characters.` 
            };
        }
        
        if (!rules.pattern.test(value)) {
            return { 
                valid: false, 
                message: `😊 Oops! That doesn't look like a valid ${rules.friendlyName}. Try using letters, numbers, and spaces (e.g., "90210" or "SW1A 1AA").` 
            };
        }
        
        return { 
            valid: true, 
            message: '✅ Looks good!' 
        };
    }
    
    /**
     * Validate search query
     */
    validateSearch(value, field) {
        const rules = this.rules.search;
        
        if (!value || value.length === 0) {
            if (!field.hasAttribute('required')) {
                return { valid: true, message: '' };
            }
            return { 
                valid: false, 
                message: `😊 Oops! Please enter a ${rules.friendlyName}.` 
            };
        }
        
        if (value.length < rules.minLength) {
            return { 
                valid: false, 
                message: `😊 Oops! ${rules.friendlyName} is a bit short. Try adding a few more characters.` 
            };
        }
        
        if (value.length > rules.maxLength) {
            return { 
                valid: false, 
                message: `😊 Oops! ${rules.friendlyName} is too long. Please keep it under ${rules.maxLength} characters.` 
            };
        }
        
        return { 
            valid: true, 
            message: '✅ Ready to search!' 
        };
    }
    
    /**
     * Validate chat/message input
     */
    validateChat(value, field) {
        const rules = this.rules.chat;
        
        if (!value || value.length === 0) {
            if (!field.hasAttribute('required')) {
                return { valid: true, message: '' };
            }
            return { 
                valid: false, 
                message: `😊 Oops! Please enter your ${rules.friendlyName}.` 
            };
        }
        
        if (value.length < rules.minLength) {
            return { 
                valid: false, 
                message: `😊 Oops! ${rules.friendlyName} is a bit short. Please add a bit more detail (at least ${rules.minLength} characters).` 
            };
        }
        
        if (value.length > rules.maxLength) {
            return { 
                valid: false, 
                message: `😊 Oops! ${rules.friendlyName} is too long. Please keep it under ${rules.maxLength} characters. Currently: ${value.length}` 
            };
        }
        
        return { 
            valid: true, 
            message: '✅ Message ready!' 
        };
    }
    
    /**
     * Validate email address
     */
    validateEmail(value, field) {
        const rules = this.rules.email;
        
        if (!value || value.length === 0) {
            if (!field.hasAttribute('required')) {
                return { valid: true, message: '' };
            }
            return { 
                valid: false, 
                message: `😊 Oops! Please enter your ${rules.friendlyName}.` 
            };
        }
        
        if (!rules.pattern.test(value)) {
            return { 
                valid: false, 
                message: `😊 Oops! That doesn't look like a valid ${rules.friendlyName}. Please check and try again (e.g., "name@example.com").` 
            };
        }
        
        return { 
            valid: true, 
            message: '✅ Email looks good!' 
        };
    }
    
    /**
     * Validate required field (generic)
     */
    validateRequired(value, field) {
        if (!value || value.length === 0) {
            return { 
                valid: false, 
                message: `😊 Oops! This field is required. Please enter a value.` 
            };
        }
        
        return { 
            valid: true, 
            message: '✅ Looks good!' 
        };
    }
    
    /**
     * Show error message with styling
     */
    showError(field, message) {
        const wrapper = field.closest('.validation-wrapper');
        const messageContainer = wrapper.querySelector('.validation-message');
        const ariaLiveRegion = wrapper.querySelector('.validation-aria-live');
        
        // Update field state
        field.classList.add('validation-error');
        field.classList.remove('validation-success');
        field.setAttribute('aria-invalid', 'true');
        
        // Show error message
        messageContainer.textContent = message;
        messageContainer.className = 'validation-message validation-message-error';
        
        // Announce to screen readers
        if (ariaLiveRegion) {
            ariaLiveRegion.textContent = message;
        }
    }
    
    /**
     * Show success message with styling
     */
    showSuccess(field, message) {
        const wrapper = field.closest('.validation-wrapper');
        const messageContainer = wrapper.querySelector('.validation-message');
        const ariaLiveRegion = wrapper.querySelector('.validation-aria-live');
        
        // Update field state
        field.classList.add('validation-success');
        field.classList.remove('validation-error');
        field.setAttribute('aria-invalid', 'false');
        
        // Show success message (optional, can be subtle)
        if (message) {
            messageContainer.textContent = message;
            messageContainer.className = 'validation-message validation-message-success';
            
            // Announce to screen readers
            if (ariaLiveRegion) {
                ariaLiveRegion.textContent = message;
            }
        } else {
            messageContainer.textContent = '';
            messageContainer.className = 'validation-message';
        }
    }
    
    /**
     * Clear validation state
     */
    clearValidationState(field) {
        const wrapper = field.closest('.validation-wrapper');
        const messageContainer = wrapper.querySelector('.validation-message');
        
        field.classList.remove('validation-error', 'validation-success');
        field.setAttribute('aria-invalid', 'false');
        messageContainer.textContent = '';
        messageContainer.className = 'validation-message';
    }
    
    /**
     * Public method: Validate a specific field by ID
     */
    validateById(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.warn(`Field with ID "${fieldId}" not found`);
            return false;
        }
        
        const validationType = field.getAttribute('data-validation-type');
        if (!validationType) {
            console.warn(`Field "${fieldId}" has no validation type`);
            return true; // No validation needed
        }
        
        return this.validateField(field, validationType);
    }
    
    /**
     * Public method: Validate all fields in a container
     */
    validateContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container with ID "${containerId}" not found`);
            return false;
        }
        
        const fields = container.querySelectorAll('[data-validation-type]');
        let allValid = true;
        
        fields.forEach(field => {
            const validationType = field.getAttribute('data-validation-type');
            const isValid = this.validateField(field, validationType);
            if (!isValid) allValid = false;
        });
        
        return allValid;
    }
    
    /**
     * Public method: Check if a field is valid (without showing messages)
     */
    isFieldValid(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return false;
        
        const validationType = field.getAttribute('data-validation-type');
        if (!validationType) return true;
        
        const validator = this.validators[validationType];
        if (!validator) return true;
        
        const value = field.value.trim();
        const result = validator(value, field);
        return result.valid;
    }
}

// Initialize the form validator globally
const wdpFormValidator = new FormValidator();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}

console.log('✅ [WDP Form Validator v36.9.11] Loaded successfully - Privacy-first validation active!');
