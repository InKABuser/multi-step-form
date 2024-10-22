// DOM Elements Cache
const elements = {
    goBackButtons: document.querySelectorAll('.go-back'),
    nextBTNAddOns: document.querySelectorAll('button[data-location=add-ons]'),
    nextBTNSSelect: document.querySelectorAll('button[data-location=select]'),
    nextBTNIIndex: document.querySelectorAll('button[data-location=index]'),
    addOns: document.querySelectorAll('input[type=checkbox]'),
    mainPlanPrice: document.querySelector('.main-plan-price'),
    lastBTN: document.querySelectorAll('button[data-location=Summary]'),
    main: document.querySelector('main'),
    thankYouContainer: document.querySelector('.just-for-transition'),
    thankYou: document.querySelector('.thanks-container'),
    addOnsParent: document.querySelector('.add-ons-choosen'),
    mainPlan: document.querySelector('.main-choice-text p'),
    allPlans: document.querySelectorAll('input[name=plan]'),
    typeToggle: document.querySelector('.plan-type'),
    yearlyOffer: document.querySelectorAll('.yearly-only'),
    arcadePrice: document.querySelector('.arcade-price'),
    advPrice: document.querySelector('.adv-price'),
    proPrice: document.querySelector('.pro-price'),
    inputForm: document.querySelectorAll('input[data-location=index]')
};

// Helper Functions
const enableButton = (buttons) => {
    buttons.forEach(btn => {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
    });
};

const disableButton = (buttons) => {
    buttons.forEach(btn => {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
    });
};

const extractPriceValue = (priceString) => parseFloat(priceString.replace(/[^0-9.]/g, ''));


const updateButtonStyles = (buttons, isEnabled) => {
    if (isEnabled) enableButton(buttons);
    else disableButton(buttons);
};

const loadAddOnsFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem('selectedAddOns')) || [];
    } catch (error) {
        console.error('Error loading add-ons:', error);
        return [];
    }
};

const saveAddOnsToStorage = (addOns) => {
    localStorage.setItem('selectedAddOns', JSON.stringify(addOns));
};

// Page Specific Logic
const onAddOnsPage = () => {
    const { nextBTNAddOns, addOns } = elements;
    const savedAddOns = loadAddOnsFromStorage();

    const updateNextButton = () => {
        const isChecked = Array.from(addOns).some(addOn => addOn.checked);
        updateButtonStyles(nextBTNAddOns, isChecked);
    };

    addOns.forEach(addOn => {
        const addOnDetails = {
            type: addOn.getAttribute('name'),
            price: addOn.getAttribute('value')
        };

        const isSaved = savedAddOns.find(saved => saved.type === addOnDetails.type && saved.price === addOnDetails.price);
        addOn.checked = Boolean(isSaved);

        addOn.addEventListener('change', () => {
            let updatedAddOns = loadAddOnsFromStorage();
            if (addOn.checked) {
                if (!updatedAddOns.some(saved => saved.type === addOnDetails.type && saved.price === addOnDetails.price)) {
                    updatedAddOns.push(addOnDetails);
                    saveAddOnsToStorage(updatedAddOns);
                }
            } else {
                updatedAddOns = updatedAddOns.filter(saved => saved.type !== addOnDetails.type || saved.price !== addOnDetails.price);
                saveAddOnsToStorage(updatedAddOns);
            }
            updateNextButton();
        });
    });

    nextBTNAddOns.forEach(btn => btn.addEventListener('click', () => document.location = 'summary.html'));

    updateNextButton();
};

const onSelectPlanPage = () => {
    const { nextBTNSSelect, allPlans, typeToggle, arcadePrice, advPrice, proPrice, yearlyOffer } = elements;

    nextBTNSSelect.forEach(btn => btn.addEventListener('click', () => document.location = 'add-ons.html'))

    let monthlyPrices = {
        arcade: parseFloat(arcadePrice.textContent.replace(/[^0-9.]/g, '')),
        adv: parseFloat(advPrice.textContent.replace(/[^0-9.]/g, '')),
        pro: parseFloat(proPrice.textContent.replace(/[^0-9.]/g, ''))
    };

    let yearlyPrices = {
        arcade: monthlyPrices.arcade * 10,
        adv: monthlyPrices.adv * 10,
        pro: monthlyPrices.pro * 10
    };

    const updatePriceDisplay = (isYearly) => {
        if (isYearly) {
            arcadePrice.textContent = `$${yearlyPrices.arcade}/year`;
            advPrice.textContent = `$${yearlyPrices.adv}/year`;
            proPrice.textContent = `$${yearlyPrices.pro}/year`;
        } else {
            arcadePrice.textContent = `$${monthlyPrices.arcade}/month`;
            advPrice.textContent = `$${monthlyPrices.adv}/month`;
            proPrice.textContent = `$${monthlyPrices.pro}/month`;
        }
    };

    const updateButtonStylesForPlan = () => {
        const isAnyPlanSelected = Array.from(allPlans).some(plan => plan.checked);
        updateButtonStyles(nextBTNSSelect, isAnyPlanSelected);
    };

 // Restore toggle state on page load
 const storedPlanType = localStorage.getItem('planType') || 'Monthly';
 const isYearly = storedPlanType === 'Yearly';
 typeToggle.checked = isYearly;  // Set the toggle based on saved value
 updatePriceDisplay(isYearly);  // Update prices based on saved toggle state
 yearlyOffer.forEach(offer => offer.style.display = isYearly ? 'block' : 'none'); // Show yearly offers if applicable

 // Handle type toggle (Yearly or Monthly)
 if (typeToggle) {
     typeToggle.addEventListener('change', () => {
         const isYearlyToggle = typeToggle.checked;
         localStorage.setItem('planType', isYearlyToggle ? 'Yearly' : 'Monthly');
         
         yearlyOffer.forEach(offer => offer.style.display = isYearlyToggle ? 'block' : 'none');
         updatePriceDisplay(isYearlyToggle);
         updateButtonStylesForPlan();
     });
 }

    allPlans.forEach(plan => {
        plan.addEventListener('change', () => {
            const planName = plan.getAttribute('value');
            const selectedPlanCard = plan.closest('.card');
            const planPriceSpan = selectedPlanCard.querySelector('.card-text p span');
            const planPrice = typeToggle.checked ? `${planPriceSpan.textContent}` : planPriceSpan.textContent;  // Adjust price based on toggle state

            localStorage.setItem('plan-name', planName);
            localStorage.setItem('plan-price', planPrice);
            updateButtonStylesForPlan();
        });
    });

    window.addEventListener('pageshow', updateButtonStylesForPlan);
};

const onSummaryPage = () => {
    const { lastBTN, main, thankYouContainer, thankYou, addOnsParent, mainPlan, mainPlanPrice } = elements;
    // const savedAddOns = loadAddOnsFromStorage();

        // Get saved plan details from localStorage
        const savedPlanName = localStorage.getItem('plan-name');
        const savedPlanPrice = localStorage.getItem('plan-price');
        const savedAddOns = JSON.parse(localStorage.getItem('selectedAddOns')) || [];

        // Update the plan details in the summary section
    if (savedPlanName && savedPlanPrice) {
        mainPlan.textContent = savedPlanName;
        mainPlanPrice.textContent = savedPlanPrice;
    } else {
        console.log('No plan selected');
    }

    let totalPrice = extractPriceValue(savedPlanPrice);

    // Update the add-ons in the summary section
    if (savedAddOns.length > 0) {
        addOnsParent.innerHTML = '';  // Clear previous add-ons
        savedAddOns.forEach(item => {
            const addOnDiv = document.createElement('div');
            addOnDiv.classList.add('item');
            
            const addOnType = document.createElement('span');
            addOnType.classList.add('type');
            addOnType.textContent = item.type;
            
            const addOnPrice = document.createElement('span');
            addOnPrice.classList.add('price');
            addOnPrice.textContent = `$${item.price}`;
            
            addOnDiv.appendChild(addOnType);
            addOnDiv.appendChild(addOnPrice);
            addOnsParent.appendChild(addOnDiv);

            totalPrice += extractPriceValue(item.price);

        });
    } else {
        console.log('No add-ons selected');
    }

    // Display plan details
    const planName = localStorage.getItem('plan-name');
    const planPrice = localStorage.getItem('plan-price');
    const planType = localStorage.getItem('planType');

    mainPlan.textContent = `${planName} (${planType})`;
    mainPlanPrice.textContent = `${planPrice}`;

    // Display total price
    const totalPriceEl = document.getElementsByClassName('total-money')[0];
    totalPriceEl.innerHTML = `$${totalPrice.toFixed(2)}`;

    // Final transition on click
    lastBTN.forEach(btn => btn.addEventListener('click', () => {
        main.style.display = 'grid';
        main.style.justifyContent = 'center';
        let allChildren = Array.from(main.children);
        allChildren.forEach(child => {
            child.style.display = 'none';
        })
        thankYouContainer.style.display = 'grid';
        thankYouContainer.classList.add('open');
        thankYou.style.display = 'grid';
    }));
};

const onIndexPage = () => {
    const { nextBTNIIndex, inputForm } = elements;

    const validateFormAndToggleButton = () => {
        const isFormValid = document.forms[0].checkValidity();
        updateButtonStyles(nextBTNIIndex, isFormValid);
    };

    // Check validity on page load
    window.addEventListener('pageshow', validateFormAndToggleButton);
    
    // Validate on input changes
    inputForm.forEach(item => {
        item.addEventListener('input', validateFormAndToggleButton);
    });

    nextBTNIIndex.forEach(btn => btn.addEventListener('click', () => document.location = 'select-plan.html'));
};

// Initialization
const init = () => {
    elements.goBackButtons.forEach(btn => btn.addEventListener('click', () => window.history.back()));

    const path = window.location.pathname;
    if (path.includes('add-ons')) onAddOnsPage();
    else if (path.includes('select-plan')) onSelectPlanPage();
    else if (path.includes('index')) onIndexPage(); // Add index page logic
    else if (path.includes('summary')) onSummaryPage();
};

document.addEventListener('DOMContentLoaded', init);