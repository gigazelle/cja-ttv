$(document).ready(function () {
    let checklistItems = [];

    // Fetch the YAML data from the external file
    $.ajax({
        url: "checklist.yml", // URL to your YAML file
        dataType: "text",
        success: function (data) {
            const parsedYaml = jsyaml.load(data); // Parse the YAML file
            checklistItems = parsedYaml.checklistItems; // Store the checklist items as an object
            console.log(checklistItems);
    
            // Example usage of checklistItems
            // Adding checklist items or other logic based on the keys
            for (const key in checklistItems) {
                if (checklistItems.hasOwnProperty(key)) {
                    const item = checklistItems[key]; // Access each item as an object
                    console.log(`Item ID: ${key}, Text: ${item.text}, Order: ${item.order}`);
                    // Here, you can add logic to populate the checklist UI
                }
            }
        },
        error: function (error) {
            console.error("Error loading the YAML file:", error);
        }
    });
    


    // Add a checklist item by ID
    function addChecklistItem(id) {
        // Check if the item already exists, if so, don't add it again
        if ($('#checklist-item-' + id).length > 0) {
            console.log("Item with ID '" + id + "' already exists.");
            return;
        }

        // Check if the item exists in checklistItems
        if (!checklistItems[id]) {
            console.error("Checklist item with ID '" + id + "' not found.");
            console.log("Available IDs:", Object.keys(checklistItems)); // Log available IDs for debugging
            return;
        }

        // Create a div to hold the checkbox and label
        const checklistDiv = $('<div>', { id: 'checklist-item-' + id });

        // Create the checkbox element
        const checkbox = $('<input>', {
            type: 'checkbox',
            id: 'checkbox-' + id,
            name: 'checklist-checkbox',
            value: id
        });

        // Create the label for the checkbox using the parsed checklistItems data
        const label = $('<label>', {
            for: 'checkbox-' + id,
            text: checklistItems[id].text // Reference the text directly from the checklistItems object
        });

        // Append the checkbox and label to the div
        checklistDiv.append(checkbox);
        checklistDiv.append(label);

        // Append the new checklist item to the checklist container
        $('#checklist-container').append(checklistDiv);
    }


    // Remove a checklist item by ID
    function removeChecklistItem(id) {
        $(`#checklist li#${id}`).remove();
    }

    // Handle checklist updates for the drop-down (codeState)
    $('#implementation-state').change(function () {
        console.log("Dropdown changed");
        const selectedOption = $(this).val();

        // Remove all items related to this dropdown
        removeChecklistItem("appm");
        removeChecklistItem("websdk");
        removeChecklistItem("refactor-code");
        removeChecklistItem("unit-tests");
        removeChecklistItem("scale-up");

        // Based on the selected option, add checklist items
        switch (selectedOption) {
            case 'appm':
                addChecklistItem("appm");
                addChecklistItem("websdk");
                console.log("Adding checklist item");
                break;
            case 'websdk':
                addChecklistItem("refactor-code");
                addChecklistItem("unit-tests");
                break;
            case 'scale':
                addChecklistItem("scale-up");
                break;
            default:
                break;
        }
    });

    // Popover functionality
    $('.popover-icon').on('click', function () {
        const popoverText = $(this).data('popover');
        const $popover = $('<div class="popover"></div>').text(popoverText);

        // Toggle popover visibility
        $(this).after($popover);
        $popover.toggle();

        // Close the popover when clicking elsewhere
        $(document).on('click', function (e) {
            if (!$(e.target).is('.popover-icon, .popover')) {
                $popover.remove();
            }
        });
    });
});
