// Enhanced Booking System - Cleaned Version
let selectedTier = null;
let selectedAddons = [];
let selectedNailArtTier = null;
let baseDuration = 0;
let basePrice = 0;

// Duration to Calendly event mapping (in hours)
const DURATION_EVENT_MAP = {
    0.75: '45min-appointment',
    1: '60min-appointment',
    2: '120min-appointment',
    2.5: '150min-appointment',
    3: '180min-appointment',
    3.5: '210min-appointment',
    4: '240min-appointment',
    4.5: '270min-appointment'
};

function getCalendlyEventType(totalDurationHours) {
    const roundedDuration = Math.round(totalDurationHours * 4) / 4;
    let eventType = null;
    const sortedDurations = Object.keys(DURATION_EVENT_MAP).map(d => parseFloat(d)).sort((a, b) => a - b);

    for (const duration of sortedDurations) {
        if (roundedDuration <= duration) {
            eventType = DURATION_EVENT_MAP[duration];
            break;
        }
    }

    if (!eventType) {
        eventType = DURATION_EVENT_MAP[Math.max(...sortedDurations)];
    }

    return eventType;
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const successDiv = document.getElementById('successMessage');
        if (successDiv) successDiv.style.display = 'none';

        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';

        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) errorDiv.style.display = 'none';
    }
}

function validateBooking() {
    if (!selectedTier) {
        showError('Please select a main service for your appointment.');
        return false;
    }
    if (!selectedNailArtTier) {
        showError('Please select a nail art tier for your appointment.');
        return false;
    }
    return true;
}

function autoSelectTier1() {
    const tier1Option = document.querySelector('.tier-option-dropdown[data-tier="tier1"]');
    if (tier1Option && selectedNailArtTier === null) {
        const serviceName = tier1Option.querySelector('.tier-title').textContent;
        const duration = parseFloat(tier1Option.dataset.duration);
        const price = parseInt(tier1Option.dataset.price);
        const serviceId = tier1Option.dataset.tier;

        tier1Option.classList.add('selected');

        selectedNailArtTier = serviceId;
        selectedAddons.push({
            id: serviceId,
            name: serviceName,
            duration: duration,
            price: price
        });

        updateDropdownButton(serviceName, duration, price);
    }
}

function updateDropdownButton(tierName, duration, price) {
    const selectedTierSummary = document.getElementById('selectedTierSummary');
    if (selectedTierSummary) {
        const priceText = price === 0 ? 'Included' : `$${price}`;
        selectedTierSummary.textContent = `${tierName} • +${duration}h • ${priceText}`;
    }
}

function setupDropdownListeners() {
    const dropdownBtn = document.getElementById('tierDropdownBtn');
    const dropdownContent = document.getElementById('tierDropdownContent');

    if (!dropdownBtn || !dropdownContent) return;

    dropdownBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = this.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
            this.setAttribute('aria-expanded', 'false');
            this.classList.remove('active');
            dropdownContent.classList.remove('show');
        } else {
            this.setAttribute('aria-expanded', 'true');
            this.classList.add('active');
            dropdownContent.classList.add('show');
        }
    });

    document.addEventListener('click', function (e) {
        if (!dropdownBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownBtn.setAttribute('aria-expanded', 'false');
            dropdownBtn.classList.remove('active');
            dropdownContent.classList.remove('show');
        }
    });

    document.querySelectorAll('.tier-option-dropdown').forEach(option => {
        option.addEventListener('click', function (e) {
            e.stopPropagation();

            const serviceName = this.querySelector('.tier-title').textContent;
            const duration = parseFloat(this.dataset.duration);
            const price = parseInt(this.dataset.price);
            const serviceId = this.dataset.tier;

            document.querySelectorAll('.tier-option-dropdown').forEach(opt => {
                opt.classList.remove('selected');
            });

            if (selectedNailArtTier) {
                selectedAddons = selectedAddons.filter(addon => addon.id !== selectedNailArtTier);
            }

            this.classList.add('selected');
            selectedNailArtTier = serviceId;
            selectedAddons.push({
                id: serviceId,
                name: serviceName,
                duration: duration,
                price: price
            });

            updateDropdownButton(serviceName, duration, price);

            dropdownBtn.setAttribute('aria-expanded', 'false');
            dropdownBtn.classList.remove('active');
            dropdownContent.classList.remove('show');

            updateSummary();
            showSuccess(`${serviceName} selected! You can still add foreign removal if needed.`);
        });
    });
}

// Mobile menu toggle
document.querySelector('.menu-toggle').addEventListener('click', function () {
    const navLinks = document.querySelector('.nav-links');
    const isExpanded = this.getAttribute('aria-expanded') === 'true';

    this.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active');

    const icon = this.querySelector('i');
    icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
});

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    setupDropdownListeners();
});

function setupEventListeners() {
    // Service tier selection
    document.querySelectorAll('.tier-option').forEach(tier => {
        tier.addEventListener('click', function () {
            document.querySelectorAll('.tier-option').forEach(t => {
                t.classList.remove('selected');
                t.setAttribute('aria-checked', 'false');
                t.setAttribute('tabindex', '-1');
            });

            this.classList.add('selected');
            this.setAttribute('aria-checked', 'true');
            this.setAttribute('tabindex', '0');

            selectedTier = {
                name: this.querySelector('h4').textContent,
                duration: parseFloat(this.dataset.duration),
                price: parseInt(this.dataset.price)
            };
            baseDuration = selectedTier.duration;
            basePrice = selectedTier.price;

            autoSelectTier1();

            const serviceSelection = document.getElementById('serviceSelection');
            if (serviceSelection) serviceSelection.classList.add('completed');

            updateSummary();
            showSuccess('Main service selected! Tier 1 nail art has been automatically added. You can change tiers or add removal if needed.');
        });
    });

    // Foreign removal addon selection
    document.querySelectorAll('.addon-item').forEach(addon => {
        addon.addEventListener('click', function () {
            const checkbox = this.querySelector('.addon-checkbox');
            const serviceName = this.querySelector('.addon-name').textContent;
            const duration = parseFloat(this.dataset.duration);
            const price = parseInt(this.dataset.price);
            const serviceId = this.dataset.service;

            const isCurrentlySelected = this.getAttribute('aria-checked') === 'true';

            if (isCurrentlySelected) {
                checkbox.classList.remove('checked');
                this.classList.remove('selected');
                this.setAttribute('aria-checked', 'false');
                selectedAddons = selectedAddons.filter(addon => addon.id !== serviceId);
            } else {
                checkbox.classList.add('checked');
                this.classList.add('selected');
                this.setAttribute('aria-checked', 'true');
                selectedAddons.push({
                    id: serviceId,
                    name: serviceName,
                    duration: duration,
                    price: price
                });
            }

            updateSummary();
        });
    });
}

function updateSummary() {
    if (!selectedTier) return;

    const summaryDiv = document.getElementById('appointmentSummary');
    const summaryDetails = document.getElementById('summaryDetails');
    const totalDurationSpan = document.getElementById('totalDuration');
    const totalCostSpan = document.getElementById('totalCost');
    const bookBtn = document.getElementById('bookNowBtn');

    if (!summaryDiv || !summaryDetails || !totalDurationSpan || !totalCostSpan || !bookBtn) return;

    let totalDuration = baseDuration;
    let totalCost = basePrice;

    let summaryHTML = `
        <div class="summary-row">
            <span>${selectedTier.name}</span>
            <span>${selectedTier.duration}h - $${selectedTier.price}</span>
        </div>
    `;

    selectedAddons.forEach(addon => {
        totalDuration += addon.duration;
        totalCost += addon.price;
        const priceText = addon.price === 0 ? 'Included' : `$${addon.price}`;
        summaryHTML += `
            <div class="summary-row">
                <span>${addon.name}</span>
                <span>${addon.duration}h - ${priceText}</span>
            </div>
        `;
    });

    summaryDetails.innerHTML = summaryHTML;
    totalDurationSpan.textContent = `${totalDuration} hours`;
    totalCostSpan.textContent = `$${totalCost}`;

    summaryDiv.style.display = 'block';
    
    // Clear existing event listeners by cloning the button
    const newBookBtn = bookBtn.cloneNode(true);
    bookBtn.parentNode.replaceChild(newBookBtn, bookBtn);
    
    // Enable/disable button based on validation
    newBookBtn.disabled = !validateBooking();
    
    // Add single click handler
    newBookBtn.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Button clicked!');
        
        if (validateBooking()) {
            openCalendlyPopup(totalDuration, totalCost);
        } else {
            showError('Please complete all required selections before booking.');
        }
    });
}

function openCalendlyPopup(totalDuration, totalCost) {
    const eventType = getCalendlyEventType(totalDuration);
    const calendlyUrl = `https://calendly.com/nailzbymaze/${eventType}`;

    console.log('Booking details:', {
        service: selectedTier.name,
        addons: selectedAddons.map(a => a.name),
        duration: totalDuration,
        cost: totalCost,
        eventType: eventType,
        calendlyUrl: calendlyUrl
    });

    try {
        if (typeof Calendly === 'undefined') {
            throw new Error('Calendly widget not loaded');
        }

        const prefillData = {
            name: '',
            email: '',
            customAnswers: {
                a1: selectedTier.name,
                a2: selectedAddons.length > 0 ? selectedAddons.map(addon => addon.name).join(', ') : 'None',
                a3: `${totalDuration} hours`,
                a4: `$${totalCost}`,
            }
        };

        Calendly.initPopupWidget({
            url: calendlyUrl,
            prefill: prefillData
        });

        const bookBtn = document.getElementById('bookNowBtn');
        const originalContent = bookBtn.innerHTML;
        bookBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Opening Booking...';
        bookBtn.disabled = true;

        setTimeout(() => {
            bookBtn.innerHTML = originalContent;
            bookBtn.disabled = false;
        }, 3000);

        showSuccess(`Booking popup opened for ${totalDuration}-hour appointment!`);

    } catch (error) {
        console.error('Calendly error:', error);
        const fallbackUrl = `${calendlyUrl}?hide_landing_page_details=1`;
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
        showSuccess('Opened booking calendar in new tab. Complete your booking there!');
    }
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});