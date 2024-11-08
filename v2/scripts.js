$(document).ready(function () {
    let checklistItems = [];
    let currentPopover = '';
    const checklistContainer = document.getElementById('checklist-container');

    // Auto-add CSS classes to elements
    $("button").addClass("spectrum-Button spectrum-Button--fill spectrum-Button--accent spectrum-Button--sizeM");
    $("button span").addClass("spectrum-Button-label");
    $(".spectrum-Radio input").addClass("spectrum-Radio-input");
    $(".spectrum-Radio span").addClass("spectrum-Radio-button");
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

    // Assign an ID to all predefined popovers (just an int to make it unique)
    const allExistingPopovers = document.querySelectorAll(".popover-icon")
    for(let i = 0; i < allExistingPopovers.length; i++) {
        allExistingPopovers[i].id = i;
    }

    // Any click that's not in a popover, hide all popovers
    document.body.addEventListener('click', (event) => {
        if (event.target.closest('.popover-icon') && event.target.closest('[id]').id == currentPopover) {
            hideAllPopovers();
            currentPopover = null;
            return;
        }
        if(event.target.closest('.popover-icon')) {
            currentPopover = event.target.closest('[id]').id;
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

        // Checklist label
        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = itemData.text;

        // Create the icon container div for right alignment
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('icon-container');

        // Help icon with popover
        if (itemData.description) {
            const helpIconSpan = document.createElement('span');
            helpIconSpan.classList.add('popover-icon');
            const helpImg = document.createElement('img');
            helpImg.src = 'Help.svg';
            helpImg.alt = 'Help icon';


            helpIconSpan.appendChild(helpImg);
            iconContainer.appendChild(helpIconSpan);
        }



        // UI icon
        if (itemData.ui_link) {
            const platformIcon = document.createElement('a');
            platformIcon.href = itemData.ui_link;
            platformIcon.target = '_blank';
            platformIcon.title = "Open the Adobe Experience Cloud interface to perform this step"
            const platformImg = document.createElement('img');
            platformImg.src = 'platform-icon.png';
            platformImg.alt = 'UI icon';
            platformIcon.appendChild(platformImg);
            iconContainer.appendChild(platformIcon);
        }


        // Append checkbox, number, label, and icon container to the checklist item
        checklistItem.appendChild(checkbox);
        checklistItem.appendChild(numberSpan);
        checklistItem.appendChild(label);
        checklistItem.appendChild(iconContainer);

        // Add the checklist item to the container
        checklistContainer.appendChild(checklistItem);

        if (itemData.description) {
            const helpIconSpan = iconContainer.querySelector('.popover-icon');
            helpIconSpan.id = checklistItem.getAttribute("data-id") + "-popover";
            helpIconSpan.addEventListener('click', (event) => showPopover(event, itemData.description, helpIconSpan.id, itemData.link));
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
    $('.q-accordion-content input, .q-accordion-content select').change(function () {
        const elementId = $(this).attr('id');
        const isChecked = $(this).is(':checked');

        switch (elementId) {
            case 'imp-appmeasurement':
                addChecklistItem("remove_appm");
                removeChecklistItem("remove_tags");
                removeChecklistItem("remove_mobile");
                removeChecklistItem("remove_api");
                removeChecklistItem("remove_aa_datastream");
                break;
            case 'imp-analytics-extension':
                addChecklistItem("remove_tags");
                removeChecklistItem("remove_appm");
                removeChecklistItem("remove_api");
                removeChecklistItem("remove_aa_datastream");
                removeChecklistItem("remove_mobile");
            case 'imp-web-sdk-alloy':
            case 'imp-web-sdk-extension':
            case 'imp-mobile-sdk':
                addChecklistItem("remove_aa_datastream");
                removeChecklistItem("remove_appm");
                removeChecklistItem("remove_tags");
                removeChecklistItem("remove_api");
                removeChecklistItem("remove_mobile");
                break;
            case 'imp-api':
                addChecklistItem("remove_api");
                removeChecklistItem("remove_appm");
                removeChecklistItem("remove_tags");
                removeChecklistItem("remove_mobile");
                removeChecklistItem("remove_aa_datastream");
                break;
            case 'imp-legacy-mobile':
                addChecklistItem("remove_mobile");
                removeChecklistItem("remove_appm");
                removeChecklistItem("remove_tags");
                removeChecklistItem("remove_api");
                removeChecklistItem("remove_aa_datastream");
                break;
            case 'imp-none':
                removeChecklistItem("remove_mobile");
                removeChecklistItem("remove_appm");
                removeChecklistItem("remove_tags");
                removeChecklistItem("remove_api");
                removeChecklistItem("remove_aa_datastream");
                break;
            case 'want-historical-data':
                (isChecked ? addChecklistItem : removeChecklistItem)("enable_adc");
                (isChecked ? addChecklistItem : removeChecklistItem)("disable_adc");
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
                break;
            case 'want-keep-aa':
                break;
            case 'want-cja-schema':
                break;
            case 'want-aa-schema':
                break;
            case 'imp-type-want-manual':
                addChecklistItem("implement_alloy");
                addChecklistItem("populate_xdm");
                removeChecklistItem("create_tag");
                removeChecklistItem("add_extension");
                removeChecklistItem("implement_tag");
                removeChecklistItem("add_tag_xdm_logic");
                removeChecklistItem("implement_api");
                removeChecklistItem("waiting_on_imp_select");
                break;
            case 'imp-type-want-tags':
                addChecklistItem("create_tag");
                addChecklistItem("add_extension");
                addChecklistItem("implement_tag");
                addChecklistItem("add_tag_xdm_logic");
                removeChecklistItem("implement_alloy");
                removeChecklistItem("populate_xdm");
                removeChecklistItem("implement_api");
                removeChecklistItem("waiting_on_imp_select");
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
    function showPopover(event, description, id, link) {

        hideAllPopovers();

        // Create a new popover element
        const popover = document.createElement('div');
        popover.classList.add('popover');
        popover.textContent = description;

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

    // Add hover event listeners to elements that should trigger popovers
    document.querySelectorAll('.popover-icon').forEach(icon => {
        const description = icon.dataset.description; // Get the description from the data attribute
        icon.addEventListener('click', (event) => showPopover(event, description));
        //icon.addEventListener('mouseout', hidePopover);
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
    // Find the current accordion content and header
    const currentAccordion = currentButton.closest('.q-accordion-content');
    const currentHeader = currentAccordion.previousElementSibling;

    // Collapse the current accordion
    currentAccordion.style.maxHeight = null;
    currentHeader.classList.remove('active');

    // Find the next accordion content and header
    const nextHeader = currentAccordion.parentElement.nextElementSibling?.querySelector('.q-accordion-header');
    const nextAccordion = nextHeader?.nextElementSibling;

    // If there’s a next accordion, expand it
    if (nextAccordion && nextHeader) {
        nextAccordion.style.maxHeight = nextAccordion.scrollHeight + "px";
        nextHeader.classList.add('active');
    }
}
