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

    // Function to add checklist item by ID
    function addChecklistItem(id) {
        if ($('#checklist-item-' + id).length > 0) {
            return;
        }
        if (!checklistItems[id]) {
            console.error("YAML item with ID '" + id + "' not found.");
            return;
        }
        const checklistDiv = $('<div>', { id: 'checklist-item-' + id });
        const checkbox = $('<input>', {
            type: 'checkbox',
            id: 'checkbox-' + id,
            name: 'checklist-checkbox',
            value: id
        });
        const label = $('<label>', {
            for: 'checkbox-' + id,
            text: checklistItems[id].text
        });
        checklistDiv.append(checkbox);
        checklistDiv.append(label);
        $('#checklist-container').append(checklistDiv);
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
});
