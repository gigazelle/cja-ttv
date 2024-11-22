$(document).ready(function () {
    let checklistItems = [];
    let currentPopover = '';
    const checklistContainer = document.getElementById('checklist-container');

    // Sets and increments session number
    const VISIT_COUNT_KEY = 'visitCount';
    const SESSION_FLAG_KEY = 'sessionFlag';

    if (!sessionStorage.getItem(SESSION_FLAG_KEY)) {
        sessionStorage.setItem(SESSION_FLAG_KEY, 'true');
        let visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
        visitCount++;
        localStorage.setItem(VISIT_COUNT_KEY, visitCount.toString());
    }

    // Analytics call for page load
    alloy("sendEvent", {
        xdm: {
            _atag: {
                sessionNumber: parseInt(localStorage.getItem(VISIT_COUNT_KEY), 10)
            },
            web: {
                webPageDetails: {
                    name: document.title
                }
            }
        }
    });

    // Auto-add CSS classes to elements
    $("button").addClass("spectrum-Button spectrum-Button--fill spectrum-Button--accent spectrum-Button--sizeM");
    $("button span").addClass("spectrum-Button-label");
    $(".spectrum-Radio input").addClass("spectrum-Radio-input");
    $(".spectrum-Radio").each(function () {
        $(this).find("span").first().addClass("spectrum-Radio-button");
    });
    $(".spectrum-Radio label").addClass("spectrum-Radio-label");
    $(".spectrum-Checkbox").each(function (index) {
        $(this).addClass("spectrum-Checkbox--sizeM");
        $(this).find("input").addClass("spectrum-Checkbox-input");
        $(this).find("span:first-of-type").addClass("spectrum-Checkbox-box");
        $(this).find("span:nth-of-type(2)").addClass("spectrum-Checkbox-label");
        $(this).find("span:first-of-type").append(`<svg class="spectrum-Icon spectrum-UIIcon-Checkmark200 spectrum-Checkbox-checkmark" focusable="false" aria-hidden="true">
            <use xlink:href="spectrum-css-icons.svg#spectrum-css-icon-Checkmark200" />
        </svg>`);
    });
    $(".spectrum-Radio").each(function () {
        const input = $(this).find("input");
        const label = $(this).find("label");

        if (input.length && label.length) {
            const inputId = input.attr("id");
            label.attr("for", inputId);
        }
    });
    $('.popover-icon').each(function () {
        $(this).append($('<img>').attr('src', 'HelpOutline.svg'));
    });

    // Assign an ID to all predefined popovers (just an int to make it unique)
    const allExistingPopovers = document.querySelectorAll(".popover-icon")
    for (let i = 0; i < allExistingPopovers.length; i++) {
        allExistingPopovers[i].id = "popover-" + i;
    }

    // Any click that's not in a popover, hide all popovers
    document.body.addEventListener('click', (event) => {
        if (event.target.closest('.popover-icon') && event.target.closest('[id]').id == currentPopover) {
            hideAllPopovers();
            currentPopover = null;
            return;
        }
        if (event.target.closest('.popover-icon')) {
            currentPopover = event.target.closest('[id]').id;
            // Send Analytics
            alloy("sendEvent", {
                xdm: {
                    _atag: {
                        interactionType: "Help button click"
                    }
                }
            });
        } else if (!event.target.closest('.popover') && !event.target.closest('.popover-icon')) {
            hideAllPopovers();
            currentPopover = null;
        }
    });

    // Fetch and parse YAML data
    $.ajax({
        url: "checklist.yml",
        dataType: "text",
        success: function (data) {
            const parsedYaml = jsyaml.load(data);
            checklistItems = parsedYaml.checklistItems;
            // Add default checklist
            addChecklistItem("architect_schema");
            addChecklistItem("create_custom_schema");
            addChecklistItem("create_dataset");
            addChecklistItem("create_datastream");
            addChecklistItem("add_aep_to_datastream");
            addChecklistItem("waiting_on_imp_select");
            addChecklistItem("create_connection");
            addChecklistItem("create_data_view");
            addChecklistItem("validate_cja_data");
            addChecklistItem("validate_dataset_ingestion");
            // Restore states on page load
            restoreInputStates();
        },
        error: function (error) {
            console.error("Error loading the YAML file:", error);
        }
    });

    // Add a checklist item by ID
    function addChecklistItem(id) {
        const itemData = checklistItems[id];

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
        checklistItem.setAttribute('data-id', id);  // Set the ID for sorting purposes
        //checklistItem.style.backgroundColor = "lightblue";

        //setTimeout(function () {
        //    checklistItem.animate({ backgroundColor: "#ffffff" }, 1000);
        //}, 2000);

        const upperItems = document.createElement('div');
        upperItems.classList.add('upper-items');
        upperItems.style.display = 'flex';
        upperItems.style.alignItems = 'center';
        upperItems.style.backgroundColor = 'transparent';

        // Create a numeric identifier span (we'll update this in the sort function)
        const numberSpan = document.createElement('span');
        numberSpan.classList.add('checklist-number');
        numberSpan.textContent = '1. ';
        numberSpan.style.marginRight = '10px';

        // Create the checkbox input
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.style.transform = 'scale(1.5)';

        // Check for saved content
        if (localStorage.getItem(id) === "true") {
            checklistItem.classList.add('checklist-item-checked');
            upperItems.classList.add('checklist-item-checked');
            checkbox.checked = true;
        }

        checkbox.onchange = () => {
            localStorage.setItem(id, checkbox.checked);
            if (checkbox.checked) {
                checklistItem.classList.add('checklist-item-checked');
                upperItems.classList.add('checklist-item-checked');
            } else {
                checklistItem.classList.remove('checklist-item-checked');
                upperItems.classList.remove('checklist-item-checked');
            }
            alloy("sendEvent", {
                xdm: {
                    _atag: {
                        checklistInteraction: id,
                        interactionType: checkbox.checked ? "Checklist check" : "Checklist uncheck"
                    }
                }
            });
        };

        // Checklist label
        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = itemData.text;

        // Create the icon container div for right alignment
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('icon-container');
        iconContainer.style.backgroundColor = 'transparent';

        // Help icon with popover
        if (itemData.description) {
            const helpIconSpan = document.createElement('span');
            helpIconSpan.classList.add('popover-icon');
            helpIconSpan.title = "View details and documentation for this step"
            const helpImg = document.createElement('img');
            helpImg.src = 'Help.svg';
            helpImg.alt = 'Help icon';
            helpIconSpan.appendChild(helpImg);
            iconContainer.appendChild(helpIconSpan);
        }

        // Link to UI icon
        if (itemData.ui_link) {
            const platformIcon = document.createElement('a');
            platformIcon.href = itemData.ui_link;
            platformIcon.target = '_blank';
            platformIcon.title = "Open the Adobe Experience Cloud interface to perform this step";
            const platformImg = document.createElement('img');
            platformImg.src = 'platform-icon.png';
            platformImg.alt = 'UI icon';
            platformIcon.appendChild(platformImg);
            iconContainer.appendChild(platformIcon);
        }

        // Note icon
        const noteIcon = document.createElement('span');
        noteIcon.classList.add('note-icon');
        const noteImg = document.createElement('img');
        noteImg.src = 'NoteAdd.svg';
        noteImg.alt = 'Note icon';
        noteImg.title = 'Add a note specific to your organization'
        noteIcon.appendChild(noteImg);
        iconContainer.appendChild(noteIcon);

        upperItems.appendChild(checkbox);
        upperItems.appendChild(numberSpan);
        upperItems.appendChild(label);
        upperItems.appendChild(iconContainer);

        checklistItem.appendChild(upperItems);
        checklistContainer.appendChild(checklistItem);

        // Restore saved note if it exists
        const savedNote = localStorage.getItem(id + "-note");
        if (savedNote) {
            const noteText = document.createElement('div');
            noteText.classList.add('note-text');
            noteText.innerHTML = savedNote.replace(/\n/g, '<br>');
            checklistItem.appendChild(noteText);
        }

        let noteOpen = false;

        // Note icon click event
        noteIcon.addEventListener('click', () => {
            if (!noteOpen) {
                noteOpen = true;
                // Create the note input container
                const noteInputContainer = document.createElement('div');
                noteInputContainer.classList.add('note-input-container');
                noteInputContainer.style.backgroundColor = 'transparent';
                noteInputContainer.style.marginRight = '10px';
                noteInputContainer.style.display = 'flex';
                noteInputContainer.style.gap = '10px';
                noteInputContainer.style.alignItems = 'center';

                // Create the note input field and pre-populate it with the existing note text
                const noteInput = document.createElement('textarea');
                noteInput.classList.add('spectrum-Textfield-input');
                noteInput.placeholder = 'Add notes specific to your organization';
                noteInput.style.backgroundColor = 'white';
                noteInput.style.width = '100%';
                noteInput.style.paddingLeft = '8px';
                noteInput.style.paddingTop = '5px';

                // Create the save button
                const saveButton = document.createElement('button');
                const saveButtonLabel = document.createElement('span');
                saveButton.classList.add("spectrum-Button", "spectrum-Button--fill", "spectrum-Button--accent", "spectrum-Button--sizeM");
                saveButton.style.alignSelf = 'flex-start';
                saveButtonLabel.classList.add("spectrum-Button-label");
                saveButtonLabel.textContent = 'Save';

                saveButton.appendChild(saveButtonLabel);

                noteInputContainer.appendChild(noteInput);
                noteInputContainer.appendChild(saveButton);

                // Check if there's existing note text
                const existingNoteText = checklistItem.querySelector('.note-text');
                if (existingNoteText) {
                    // Replace the existing note text div with the new input container
                    checklistItem.replaceChild(noteInputContainer, existingNoteText);
                    noteInput.value = existingNoteText.innerHTML.replace(/<br\s*\/?>/gi, '\n');
                } else {
                    // If no existing note text, just append the input container
                    checklistItem.appendChild(noteInputContainer);
                }

                // Save note when pressing Enter or clicking 'Save'
                function saveNote() {
                    noteOpen = false;
                    const noteTextValue = noteInput.value;
                    localStorage.setItem(id + "-note", noteTextValue);

                    // Remove the input container
                    checklistItem.removeChild(noteInputContainer);

                    // Create a new note text div to display the saved note with line breaks
                    const noteText = document.createElement('div');
                    noteText.classList.add('note-text');
                    noteText.style.textDecoration = 'none';

                    // Replace newlines with <br> to display line breaks in HTML
                    noteText.innerHTML = noteTextValue.replace(/\n/g, '<br>');
                    if (noteTextValue) {
                        checklistItem.appendChild(noteText);
                    }

                    // Send Analytics event
                    alloy("sendEvent", {
                        xdm: {
                            _atag: {
                                checklistInteraction: id,
                                interactionType: "Checklist save note"
                            }
                        }
                    });
                }

                noteInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        saveNote();
                    }
                });

                saveButton.addEventListener('click', saveNote);
            }
        });

        if (itemData.description) {
            const helpIconSpan = iconContainer.querySelector('.popover-icon');
            helpIconSpan.id = checklistItem.getAttribute("data-id") + "-popover";
            helpIconSpan.addEventListener('click', (event) => showPopover(event, itemData.description, itemData.link));
        }

        // Sort the checklist after adding the new item
        sortChecklist();
    }



    // Function to remove checklist item by ID
    function removeChecklistItem(id) {
        checklistContainer.querySelector(`[data-id="${id}"]`)?.remove();
        sortChecklist();
    }

    // Sort the checklist by the order listed in the YAML file
    function sortChecklist() {

        // Get all the checklist items (divs) in an array
        const itemsArray = Array.from(checklistContainer.children);

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

    // Attach change event listener to all inputs in the questionnaire
    $('.q-accordion-content input, .q-accordion-content select').change(function () {
        const elementId = $(this).attr('id');
        const isChecked = $(this).is(':checked');
        const elementType = $(this).attr('type');

        // Update storage
        updateInputState(elementId, isChecked, elementType);

        // Handle the input change logic
        handleInputChange(elementId, isChecked);

        // Send Analytics data
        alloy("sendEvent", {
            xdm: {
                _atag: {
                    questionnaireInteraction: elementId,
                    interactionType: isChecked ? "Questionnaire check" : "Questionnaire uncheck"
                }
            }
        });
    });


    // Function to update local storage based on input type and value
    function updateInputState(elementId, isChecked, elementType) {
        let inputStates = JSON.parse(localStorage.getItem('inputStates')) || {};

        if (elementType === 'checkbox') {
            // Store true/false for checkbox
            inputStates[elementId] = isChecked;
        } else if (elementType === 'radio') {
            // Clear previous selections in the group and store only selected radio button ID
            const radioGroupName = $('[id="' + elementId + '"]').attr('name');
            $('input[type="radio"][name="' + radioGroupName + '"]').each(function () {
                delete inputStates[$(this).attr('id')];
            });
            if (isChecked) {
                inputStates[elementId] = true;
            }
        }

        // Save back to local storage
        localStorage.setItem('inputStates', JSON.stringify(inputStates));
    }

    // Function to restore input states from local storage
    function restoreInputStates() {
        const savedStates = JSON.parse(localStorage.getItem('inputStates')) || {};

        Object.keys(savedStates).forEach(id => {
            const input = document.getElementById(id);
            const isChecked = savedStates[id];

            if (input) {
                // Set the saved state for each input
                input.checked = isChecked;

                // Trigger the handleInputChange function to apply any related logic
                handleInputChange(input.id, isChecked);
            }
        });

        // Update begin button if they've filled it out before
        if (Object.keys(savedStates).length > 0) {
            document.getElementById("begin-button").querySelector('.spectrum-Button-label').textContent = "Modify questionnaire";
        }
    }

    // Delete an id from local storage
    function removeInputStateById(id) {
        const savedStates = JSON.parse(localStorage.getItem('inputStates')) || {};

        if (savedStates.hasOwnProperty(id)) {
            delete savedStates[id]; // Remove the key from the savedStates object
            localStorage.setItem('inputStates', JSON.stringify(savedStates)); // Update localStorage
        }
    }

    // Determines which checklist items to display depending on questionnaire input
    function handleInputChange(elementId, isChecked) {
        switch (elementId) {
            case 'imp-appmeasurement':
                if ($("#want-turn-off-aa").is(":checked")) {
                    addChecklistItem("remove_appm");
                    removeChecklistItem("remove_tags");
                    removeChecklistItem("remove_api");
                    removeChecklistItem("remove_aa_datastream");
                }
                addChecklistItem("create_datastream");
                if ($("#imp-type-want-tags").is(":checked")) {
                    addChecklistItem("create_tag")
                }
                thirdPartyImplementation(false);
                break;
            case 'imp-analytics-extension':
                if ($("#want-turn-off-aa").is(":checked")) {
                    addChecklistItem("remove_tags");
                    removeChecklistItem("remove_appm");
                    removeChecklistItem("remove_api");
                    removeChecklistItem("remove_aa_datastream");
                }
                addChecklistItem("create_datastream");
                if ($("#imp-type-want-tags").is(":checked")) {
                    // They are on the Analytics extension so they don't need to recreate the tag
                    removeChecklistItem("create_tag");
                    removeChecklistItem("implement_tag");
                }
                thirdPartyImplementation(false);
                break;
            case 'imp-web-sdk-extension':
                if ($("#imp-type-want-tags").is(":checked")) {
                    // They are already on tags so they don't need to recreate the tag
                    removeChecklistItem("create_tag");
                    removeChecklistItem("implement_tag");
                    removeChecklistItem("add_extension");
                }
            case 'imp-mobile-sdk':
            case 'imp-web-sdk-alloy':
                if ($("#want-turn-off-aa").is(":checked")) {
                    addChecklistItem("remove_aa_datastream");
                    removeChecklistItem("remove_appm");
                    removeChecklistItem("remove_tags");
                    removeChecklistItem("remove_api");
                }
                removeChecklistItem("create_datastream");
                thirdPartyImplementation(false);
                break;
            case 'imp-api':
                if ($("#want-turn-off-aa").is(":checked")) {
                    addChecklistItem("remove_api");
                    removeChecklistItem("remove_appm");
                    removeChecklistItem("remove_tags");
                    removeChecklistItem("remove_aa_datastream");
                }
                thirdPartyImplementation(false);
                break;
            case 'imp-legacy-mobile':
                if ($("#want-turn-off-aa").is(":checked")) {
                    removeChecklistItem("remove_appm");
                    removeChecklistItem("remove_tags");
                    removeChecklistItem("remove_api");
                    removeChecklistItem("remove_aa_datastream");
                }
                thirdPartyImplementation(false);
                break;
            case 'imp-third-party':
                thirdPartyImplementation(true);
                break;
            case 'already-have-adc':
                if ($("#want-cja-schema").is(":checked")) {
                    (isChecked ? addChecklistItem : removeChecklistItem)("remove_old_adc");
                }
                if (isChecked) {
                    $("#want-historical-data").prop("checked", true);
                }
                break;
            case 'want-historical-data':
                if ($("#want-cja-schema").is(":checked")) {
                    if ($("#already-have-adc").is(":checked")) {
                        (isChecked ? addChecklistItem : removeChecklistItem)("remove_old_adc");
                    }
                    (isChecked ? addChecklistItem : removeChecklistItem)("create_schema_for_adc");
                    (isChecked ? addChecklistItem : removeChecklistItem)("create_adc_using_custom_schema");
                    (isChecked ? addChecklistItem : removeChecklistItem)("add_adc_midvalues_dataset");
                    (isChecked ? addChecklistItem : removeChecklistItem)("disable_adc");
                }
                if ($("#want-aa-schema").is(":checked")) {
                    (isChecked ? addChecklistItem : removeChecklistItem)("create_adc_using_aa_schema");
                    (isChecked ? addChecklistItem : removeChecklistItem)("add_adc_midvalues_dataset");
                    (isChecked ? addChecklistItem : removeChecklistItem)("disable_adc");
                }
                if (!isChecked) {
                    removeChecklistItem("remove_old_adc");
                }
                break;
            case 'want-component-migration':
                (isChecked ? addChecklistItem : removeChecklistItem)("component_migration");
                break;
            case 'want-activity-map-overlay':
                (isChecked ? addChecklistItem : removeChecklistItem)("link_tracking");
                break;
            case 'want-classifications':
                (isChecked ? addChecklistItem : removeChecklistItem)("create_lookup_dataset");
                break;
            case 'want-marketing-channels':
                (isChecked ? addChecklistItem : removeChecklistItem)("create_mc_derived_fields");
                break;
            case 'want-data-feeds':
                (isChecked ? addChecklistItem : removeChecklistItem)("data_feeds");
                break;
            case 'want-data-warehouse':
                (isChecked ? addChecklistItem : removeChecklistItem)("create_full_table_export");
                break;
            case 'want-streaming-media':
                break;
            case 'want-omnichannel':
                (isChecked ? addChecklistItem : removeChecklistItem)("add_datasets_to_connection");
                break;
            case 'want-rtcdp':
                (isChecked ? addChecklistItem : removeChecklistItem)("enable_profile");
                break;
            case 'want-ajo':
                (isChecked ? addChecklistItem : removeChecklistItem)("implement_personalization");
                break;
            case 'want-turn-off-aa':
                if ($("#imp-appmeasurement").is(":checked")) {
                    addChecklistItem("remove_appm");
                    removeChecklistItem("remove_tags");
                    removeChecklistItem("remove_api");
                    removeChecklistItem("remove_aa_datastream");
                }
                if ($("#imp-analytics-extension").is(":checked")) {
                    addChecklistItem("remove_tags");
                    removeChecklistItem("remove_appm");
                    removeChecklistItem("remove_api");
                    removeChecklistItem("remove_aa_datastream");
                }
                if ($("#imp-web-sdk-alloy").is(":checked") || $("#imp-web-sdk-extension").is(":checked") || $("#imp-mobile-sdk").is(":checked")) {
                    addChecklistItem("remove_aa_datastream");
                    removeChecklistItem("remove_appm");
                    removeChecklistItem("remove_tags");
                    removeChecklistItem("remove_api");
                }
                break;
            case 'want-keep-aa':
                removeChecklistItem("remove_appm");
                removeChecklistItem("remove_tags");
                removeChecklistItem("remove_api");
                removeChecklistItem("remove_aa_datastream");
                break;
            case 'want-cja-schema':
                addChecklistItem("architect_schema");
                addChecklistItem("create_custom_schema");
                removeChecklistItem("create_aa_schema");
                if ($("#want-historical-data").is(":checked")) {
                    if ($("#already-have-adc").is(":checked")) {
                        addChecklistItem("remove_old_adc");
                    }
                    addChecklistItem("create_schema_for_adc");
                    addChecklistItem("create_adc_using_custom_schema");
                    addChecklistItem("add_adc_midvalues_dataset");
                    addChecklistItem("disable_adc");
                    removeChecklistItem("create_adc_using_aa_schema");
                }
                break;
            case 'want-aa-schema':
                addChecklistItem("create_aa_schema");
                removeChecklistItem("architect_schema");
                removeChecklistItem("create_custom_schema");
                if ($("#want-historical-data").is(":checked")) {
                    if (!$("#already-have-adc").is(":checked")) {
                        addChecklistItem("create_adc_using_aa_schema");
                    }
                    addChecklistItem("add_adc_midvalues_dataset");
                    addChecklistItem("disable_adc");
                    removeChecklistItem("create_schema_for_adc");
                    removeChecklistItem("create_adc_using_custom_schema");
                }
                break;
            case 'imp-type-want-manual':
                addChecklistItem("implement_alloy");
                removeChecklistItem("create_tag");
                removeChecklistItem("add_extension");
                removeChecklistItem("implement_tag");
                removeChecklistItem("add_tag_xdm_logic");
                removeChecklistItem("implement_api");
                removeChecklistItem("waiting_on_imp_select");
                if ($("#shortcut-use-data-layer").is(":checked")) {
                    addChecklistItem("populate_data_object");
                    addChecklistItem("map_variables_to_xdm");
                    removeChecklistItem("populate_xdm");
                } else {
                    addChecklistItem("populate_xdm");
                    removeChecklistItem("populate_data_object");
                    removeChecklistItem("map_variables_to_xdm");
                }
                break;
            case 'imp-type-want-tags':
                addChecklistItem("create_tag");
                addChecklistItem("add_extension");
                addChecklistItem("implement_tag");
                removeChecklistItem("implement_alloy");
                removeChecklistItem("populate_xdm");
                removeChecklistItem("implement_api");
                removeChecklistItem("waiting_on_imp_select");
                if ($("#shortcut-use-data-layer").is(":checked")) {
                    addChecklistItem("populate_data_object");
                    addChecklistItem("map_variables_to_xdm");
                    removeChecklistItem("add_tag_xdm_logic");
                } else {
                    addChecklistItem("add_tag_xdm_logic");
                    removeChecklistItem("populate_data_object");
                    removeChecklistItem("map_variables_to_xdm");
                }
                if ($("#imp-web-sdk-extension").is(":checked")) {
                    // They are already on tags so they don't need to recreate the tag
                    removeChecklistItem("create_tag");
                    removeChecklistItem("implement_tag");
                    removeChecklistItem("add_extension");
                }
                if ($("#imp-analytics-extension").is(":checked")) {
                    // They are already on tags so they don't need to recreate the tag
                    removeChecklistItem("create_tag");
                    removeChecklistItem("implement_tag");
                }
                break;
            case 'imp-type-want-api':
                addChecklistItem("implement_api");
                removeChecklistItem("implement_alloy");
                removeChecklistItem("populate_xdm");
                removeChecklistItem("create_tag");
                removeChecklistItem("add_extension");
                removeChecklistItem("implement_tag");
                removeChecklistItem("add_tag_xdm_logic");
                removeChecklistItem("waiting_on_imp_select");
                if ($("#shortcut-use-data-layer").is(":checked")) {
                    addChecklistItem("populate_data_object");
                    addChecklistItem("map_variables_to_xdm");
                    removeChecklistItem("implement_api");
                } else {
                    addChecklistItem("implement_api");
                    removeChecklistItem("populate_data_object");
                    removeChecklistItem("map_variables_to_xdm");
                }
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
                (isChecked ? addChecklistItem : removeChecklistItem)("alter_appmeasurement_logic");
                if (isChecked) {
                    $("#shortcut-use-data-layer").prop("checked", false);
                    removeChecklistItem("populate_data_object");
                }
            // Yes I am intentionally falling through here
            case 'shortcut-use-data-layer':
                if ($("#shortcut-use-data-layer").is(":checked")) {
                    addChecklistItem("populate_data_object");
                    removeChecklistItem("alter_appmeasurement_logic");
                    $("#shortcut-keep-appmeasurement").prop("checked", false);
                } else {
                    removeChecklistItem("populate_data_object");
                }
                (isChecked ? addChecklistItem : removeChecklistItem)("map_variables_to_xdm");
                if ($("#imp-type-want-manual").is(":checked")) {
                    (!isChecked ? addChecklistItem : removeChecklistItem)("populate_xdm");
                }
                if ($("#imp-type-want-tags").is(":checked")) {
                    (!isChecked ? addChecklistItem : removeChecklistItem)("add_tag_xdm_logic");
                }
                if ($("#imp-type-want-api").is(":checked")) {
                    (!isChecked ? addChecklistItem : removeChecklistItem)("implement_api");
                }
                break;
            case 'want-a4t':
                break;
            case 'want-aam':
                break;
            case 'just-use-adc':
                if (isChecked) {
                    $("#want-rtcdp").prop("disabled", true);
                    $("#want-ajo").prop("disabled", true);
                    $("#want-turn-off-aa").prop("disabled", true);
                    $("#want-keep-aa").prop("disabled", true);
                    $("#want-aa-schema").prop("disabled", true);
                    $("#want-cja-schema").prop("disabled", true);
                    $("#want-a4t").prop("disabled", true);
                    $("#want-aam").prop("disabled", true);
                    $("#imp-type-want-manual").prop("disabled", true);
                    $("#imp-type-want-tags").prop("disabled", true);
                    $("#imp-type-want-api").prop("disabled", true);
                    $("#shortcut-keep-appmeasurement").prop("disabled", true);
                    $("#shortcut-use-data-layer").prop("disabled", true);
                    checklistContainer.innerHTML = '';
                    addChecklistItem("just_use_adc");
                    addChecklistItem("just_use_adc_connection");
                    addChecklistItem("just_use_adc_data_view");
                    if ($("#want-component-migration").is(":checked")) {
                        addChecklistItem("component_migration");
                    }
                    if ($("#want-data-warehouse").is(":checked")) {
                        addChecklistItem("create_full_table_export");
                    }
                    if ($("#want-omnichannel").is(":checked")) {
                        addChecklistItem("add_datasets_to_connection");
                    }


                } else {
                    removeInputStateById(elementId);
                    $("#want-rtcdp").prop("disabled", false);
                    $("#want-ajo").prop("disabled", false);
                    $("#want-turn-off-aa").prop("disabled", false);
                    $("#want-keep-aa").prop("disabled", false);
                    $("#want-aa-schema").prop("disabled", false);
                    $("#want-cja-schema").prop("disabled", false);
                    $("#want-a4t").prop("disabled", false);
                    $("#want-aam").prop("disabled", false);
                    $("#imp-type-want-manual").prop("disabled", false);
                    $("#imp-type-want-tags").prop("disabled", false);
                    $("#imp-type-want-api").prop("disabled", false);
                    $("#shortcut-keep-appmeasurement").prop("disabled", false);
                    $("#shortcut-use-data-layer").prop("disabled", false);
                    restoreInputStates();
                }
                break;
            default:
                console.warn("Form element ID does not have an action:", elementId);
                break;
        }
        // Check if the source connector checkbox should be enabled or not
        if (!$("#want-keep-aa").is(":checked") || $("#want-rtcdp").is(":checked") || $("#want-ajo").is(":checked")) {
            $("#just-use-adc").prop("disabled", true);
        } else {
            $("#just-use-adc").prop("disabled", false);

        }
    }

    // Handles enabling or disabling fields when third-party implementation is selected
    function thirdPartyImplementation(isChecked) {
        if (isChecked) {
            $("#aa-feature-accordion").find('input').each(function () {
                uncheckAndDisable(this);
            });
            $("#shortcut-accordion").find('input').each(function () {
                if (this.id != "just-use-adc") {
                    uncheckAndDisable(this);
                }
            });
            uncheckAndDisable(document.getElementById("already-have-adc"));
            uncheckAndDisable(document.getElementById("want-keep-aa"));
            uncheckAndDisable(document.getElementById("want-aa-schema"));
            uncheckAndDisable(document.getElementById("pressed-on-time"));
        } else {
            $("#aa-feature-accordion").find('input').each(function () {
                $(this).prop("disabled", false);
            });
            $("#shortcut-accordion").find('input').each(function () {
                if (this.id != "just-use-adc") {
                    $(this).prop("disabled", false);
                }
            });
            $("#already-have-adc").prop("disabled", false);
            $("#want-keep-aa").prop("disabled", false);
            $("#want-aa-schema").prop("disabled", false);
            $("#pressed-on-time").prop("disabled", false);
        }
    }

    function uncheckAndDisable(input) {
        $(input).prop("checked", false);
        $(input).prop("disabled", true);
        handleInputChange(input.id, false);
    }

    // Function to show the popover on hover
    function showPopover(event, description, link) {

        hideAllPopovers();

        // Create a new popover element
        const popover = document.createElement('div');
        popover.classList.add('popover');
        popover.innerHTML = description;

        if (link) {
            const br1 = document.createElement('br');
            const br2 = document.createElement('br');
            popover.appendChild(br1);
            popover.appendChild(br2);

            const docIcon = document.createElement('img');
            docIcon.href = link;
            docIcon.target = "_blank";
            docIcon.src = "exl-icon.png";
            docIcon.alt = "Documentation icon";
            popover.appendChild(docIcon);

            const linkElement = document.createElement('a');
            linkElement.href = link;
            linkElement.target = '_blank';
            linkElement.textContent = "Learn more on Experience League";
            popover.appendChild(linkElement);
        }

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
    function hideAllPopovers() {
        let existingPopovers = document.querySelectorAll('.popover');
        existingPopovers.forEach((x) => {
            x.remove();
        });
    }

    // Popover functionality for non-checklist icons
    document.querySelectorAll('.popover-icon').forEach(icon => {
        icon.addEventListener('click', (event) => showPopover(event, icon.dataset.description, icon.dataset.link));
    });

    // Toggle the display of the accordion content
    document.querySelectorAll('.q-accordion-header').forEach(header => {
        const content = header.nextElementSibling;

        if (content.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + "px";
            header.classList.add('active');
        }

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

    $(".checklist-item .c-accordion-header").on("click", function (event) {
        // Check if the target is the checkbox or label text
        if ($(event.target).closest(".spectrum-Checkbox input, .spectrum-Checkbox span:last-child").length) {
            return; // Skip accordion toggle
        }

        // Toggle the accordion content with slideToggle
        const $accordionItem = $(this).closest(".checklist-item");
        $accordionItem.find(".c-accordion-content").stop(true, true).slideToggle(300);

        // Toggle rotation of icon
        $accordionItem.toggleClass("active");
    });


});

function goToNextAccordion(currentButton) {
    // Collapse all accordions
    document.querySelectorAll('.q-accordion-content').forEach((accordion) => {
        if (accordion.id == 'shortcut-accordion-content') {
            return;
        }
        accordion.style.maxHeight = null;
        accordion.previousElementSibling.classList.remove('active');
    });

    // Find the current accordion content and header
    const currentAccordion = currentButton.closest('.q-accordion-content');

    // Find the next accordion content and header
    const nextHeader = currentAccordion.parentElement.nextElementSibling?.querySelector('.q-accordion-header');
    const nextAccordion = nextHeader?.nextElementSibling;

    // If there’s a next accordion, expand it
    if (nextAccordion && nextHeader) {
        nextAccordion.style.maxHeight = nextAccordion.scrollHeight + "px";
        nextHeader.classList.add('active');
    }
}
