$(document).ready(function () {
    let checklistItems = [];
    let currentDropdownSelection = '';

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
            addChecklistItem("validate_cja_data");
            addChecklistItem("component_migration");
            addChecklistItem("remove_appm");
            addChecklistItem("disable_adc");

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
        const checklistContainer = document.getElementById('checklist-container');
        const itemData = checklistItems[id];  // Fetch the data for this checklist item

        if (!itemData) {
            console.error(`Checklist item with ID "${id}" not found.`);
            return;
        }

        // Create a new div for the checklist item
        const checklistItem = document.createElement('div');
        checklistItem.title = itemData.description || '';  // Add description as a tooltip for the whole box

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

        // Append checkbox and label to the div
        checklistItem.appendChild(checkbox);
        checklistItem.appendChild(label);

        // Add the checklist item to the container
        checklistContainer.appendChild(checklistItem);
    }

    // Function to remove checklist item by ID
    function removeChecklistItem(id) {
        $('#checklist-item-' + id).remove();
    }

    // Listen for dropdown changes
    $('#implementation-state').change(function () {
        currentDropdownSelection = $(this).val();  // Store the dropdown selection

        const checkboxChecked = $('#want-turn-off-aa').is(':checked');
        if (currentDropdownSelection === 'imp-type-have-manual' && checkboxChecked) {
            addChecklistItem("some_checklist_item");
        } else {
            removeChecklistItem("some_checklist_item");
        }
    });

    // Listen for checkbox changes
    $('#want-turn-off-aa').change(function () {
        const isChecked = $(this).is(':checked');

        if (isChecked && currentDropdownSelection === 'imp-type-have-manual') {
            addChecklistItem("some_checklist_item");
        } else {
            removeChecklistItem("some_checklist_item");
        }
    });

    // Listen for changes on any form element in the left column
    $('.accordion-content input').change(function () {
        const elementId = $(this).attr('id');
        const isChecked = $(this).is(':checked');

        switch (elementId) {
            case 'imp-appmeasurement':
                addChecklistItem("remove_appm");
                addChecklistItem("validate_cja_data");
                removeChecklistItem("remove_tags");
                removeChecklistItem("remove_api");
                break;
            case 'imp-web-sdk':
                addChecklistItem("remove_tags");
                addChecklistItem("validate_cja_data");
                removeChecklistItem("remove_appm");
                removeChecklistItem("remove_api");
                break;
            case 'want-turn-off-aa':
                const currentRadioValue = getSelectedRadioValue('implementation-have');
                if (isChecked && currentRadioValue === 'imp-type-have-manual') {
                    addChecklistItem("turn_off_aa_manual");
                } else {
                    removeChecklistItem("turn_off_aa_manual");
                }
                break;
            // Other cases...
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
        popover.style.left = `${rect.right + 10}px`;  // Offset 10px to the right
        popover.style.top = `${rect.top}px`;

        // Append the popover to the body
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

});
