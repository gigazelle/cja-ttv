$(document).ready(function () {
    let checklistItems = [];
    let currentDropdownSelection = '';
    const checklistContainer = document.getElementById('checklist-container');


    // Fetch and parse YAML data
    $.ajax({
        url: "checklist.yml",
        dataType: "text",
        success: function (data) {
            const parsedYaml = jsyaml.load(data);
            checklistItems = parsedYaml.checklistItems;
            // Add default checklist
            addChecklistItem("architect_schema");
            addChecklistItem("create_schema");
            addChecklistItem("create_dataset");
            addChecklistItem("create_datastream");
            addChecklistItem("add_aep_to_datastream");
            addChecklistItem("waiting_on_imp_select");
            addChecklistItem("create_connection");
            addChecklistItem("create_data_view");
            addChecklistItem("enable_adc");
            addChecklistItem("disable_adc");
            addChecklistItem("validate_cja_data");
            addChecklistItem("component_migration");
            addChecklistItem("remove_appm");

        },
        error: function (error) {
            console.error("Error loading the YAML file:", error);
        }
    });



    // Function to get the selected radio button value
    function getSelectedRadioValue(groupName) {
        return $(`input[name=${groupName}]:checked`).attr('id');
    }

    // Add a checklist item by ID
    function addChecklistItem(id) {
        const itemData = checklistItems[id];  // Fetch the data for this checklist item

        if (!itemData) {
            console.error(`Checklist item with ID "${id}" not found.`);
            return;
        }

        // Check if the checklist item already exists
        const existingItem = checklistContainer.querySelector(`[data-id="${id}"]`);
        if (existingItem) {
            return;
        }

        // Create a new div for the checklist item
        const checklistItem = document.createElement('div');
        checklistItem.title = itemData.description || '';  // Add description as a tooltip for the whole box
        checklistItem.setAttribute('data-id', id);  // Set the ID for sorting purposes

        // Create a numeric identifier span (we'll update this in the sort function)
        const numberSpan = document.createElement('span');
        numberSpan.classList.add('checklist-number');
        numberSpan.textContent = '1. ';  // Placeholder; will be updated in sortChecklist
        numberSpan.style.marginRight = '10px';  // Adds space between the number and the label text

        // Create the checkbox input
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.onchange = () => {
            if (checkbox.checked) {
                checklistItem.classList.add('checklist-item-checked');
            } else {
                checklistItem.classList.remove('checklist-item-checked');
            }
        };

        // Create the label (text as a link if the link property exists)
        const label = document.createElement('label');
        label.setAttribute('for', id);

        // Check if the item has a link
        if (itemData.link) {
            const anchor = document.createElement('a');
            anchor.href = itemData.link;
            anchor.textContent = itemData.text;
            anchor.target = '_blank';  // Opens link in a new tab
            label.appendChild(anchor);
        } else {
            label.textContent = itemData.text;  // Just use plain text if no link exists
        }

        // Append checkbox, number, and label to the div
        checklistItem.appendChild(checkbox);
        checklistItem.appendChild(numberSpan);
        checklistItem.appendChild(label);

        // Add the checklist item to the container
        checklistContainer.appendChild(checklistItem);

        // Sort the checklist after adding the new item
        sortChecklist();
    }



    // Function to remove checklist item by ID
    function removeChecklistItem(id) {
        checklistContainer.querySelector(`[data-id="${id}"]`)?.remove();
        sortChecklist();
    }

    // Sort the checklist by the order listed in the YAML file
    // Function to sort the checklist based on the order in checklistItems variable
    function sortChecklist() {

        // Get all the checklist items (divs) in an array
        const itemsArray = Array.from(checklistContainer.children);

        // Sort the checklist items based on the order in checklistItems variable
        itemsArray.sort((a, b) => {
            const idA = a.getAttribute('data-id');
            const idB = b.getAttribute('data-id');

            const orderA = Object.keys(checklistItems).indexOf(idA);
            const orderB = Object.keys(checklistItems).indexOf(idB);

            return orderA - orderB;
        });

        // Clear the container and append the sorted items
        checklistContainer.innerHTML = '';
        itemsArray.forEach((item, index) => {
            // Update the numeric identifier (index starts from 0, so add 1)
            const numberSpan = item.querySelector('.checklist-number');
            numberSpan.textContent = (index + 1) + '. ';

            checklistContainer.appendChild(item);
        });
    }

    // Listen for changes on any form element in the left column
    $('.accordion-content input, .accordion-content select').change(function () {
        const elementId = $(this).attr('id');
        const isChecked = $(this).is(':checked');

        switch (elementId) {
            case 'imp-appmeasurement':
                break;
            case 'imp-web-sdk':
                break;
            case 'imp-api':
                break;
            case 'imp-legacy-mobile':
                break;
            case 'imp-mobile-sdk':
                break;
            case 'imp-mobile-sdk':
                break;
            case 'imp-none':
                break;
            case 'imp-type-have-manual':
                break;
            case 'imp-type-have-tags':
                break;
            case 'imp-type-have-api':
                break;
            case 'want-historical-data':
                break;
            case 'want-component-migration':
                break;
            case 'want-activity-map-overlay':
                break;
            case 'want-classifications':
                break;
            case 'want-marketing-channels':
                break;
            case 'want-data-feeds':
                break;
            case 'want-data-warehouse':
                break;
            case 'want-streaming-media':
                break;
            case 'want-omnichannel':
                break;
            case 'want-rtcdp':
                break;
            case 'want-ajo':
                break;
            case 'want-turn-off-aa':
                break;
            case 'want-keep-aa':
                break;
            case 'want-cja-schema':
                break;
            case 'want-aa-schema':
                break;
            case 'imp-type-want-manual':
                break;
            case 'imp-type-want-tags':
                break;
            case 'imp-type-want-api':
                break;
            case 'pressed-on-time':
                const shortcutAccordionElement = document.getElementById('shortcut-accordion');

                if (isChecked) {
                    shortcutAccordionElement.style.visibility = 'visible';
                } else {
                    shortcutAccordionElement.style.visibility = 'hidden';
                }
                break;
            case 'shortcut-keep-appmeasurement':
                break;
            case 'shortcut-use-data-layer':
                break;
            case 'want-a4t':
                break;
            case 'want-aam':
                break;
            default:
                console.warn("Form element ID does not have an action:", elementId);
                break;
        }
    });

    // Function to show the popover on hover
    function showPopover(event, description) {
        // Remove any existing popover to avoid duplication
        let existingPopover = document.querySelector('.popover');
        if (existingPopover) {
            existingPopover.remove();
        }

        // Create a new popover element
        const popover = document.createElement('div');
        popover.classList.add('popover');
        popover.textContent = description;

        // Position the popover relative to the hovered element
        const rect = event.target.getBoundingClientRect();
        const popoverPadding = 10;

        // Calculate popover position
        let popoverLeft = rect.left + window.scrollX + rect.width + popoverPadding;
        let popoverTop = rect.top + window.scrollY;

        // Get the popover dimensions after adding it (so it's accurate)
        document.body.appendChild(popover);
        const popoverRect = popover.getBoundingClientRect();

        // Check if the popover would overflow the window and adjust position
        if (popoverLeft + popoverRect.width > window.innerWidth) {
            popoverLeft = rect.left + window.scrollX - popoverRect.width - popoverPadding;
        }

        // Set the final popover position
        popover.style.left = `${popoverLeft}px`;
        popover.style.top = `${popoverTop}px`;

        // Add the popover to the body (after adjustments)
        document.body.appendChild(popover);
    }

    // Function to hide the popover on mouseout or click away
    function hidePopover() {
        let existingPopover = document.querySelector('.popover');
        if (existingPopover) {
            existingPopover.remove();
        }
    }

    // Add hover event listeners to elements that should trigger popovers
    document.querySelectorAll('.popover-icon').forEach(icon => {
        const description = icon.dataset.description; // Get the description from the data attribute
        icon.addEventListener('mouseover', (event) => showPopover(event, description));
        icon.addEventListener('mouseout', hidePopover);
    });

    // Toggle the display of the accordion content
    document.querySelectorAll('.accordion-header').forEach(header => {
        const content = header.nextElementSibling;

        // Open by default
        content.style.maxHeight = content.scrollHeight + "px";
        header.classList.add('active');

        header.addEventListener('click', function () {
            // If already open, collapse it
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                header.classList.remove('active');
            }
            // If closed, expand it
            else {
                content.style.maxHeight = content.scrollHeight + "px";
                header.classList.add('active');
            }
        });
    });
});