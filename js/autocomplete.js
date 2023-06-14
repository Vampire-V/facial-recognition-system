'use strict';

// =============== Autocomplete for input fields =====================

/**
 * Description : Add an autocomplete list to an input field with bootstrap style.
 * @param {[string]} id_formfield [ID from form element where an autocomplete list should added]
 * @param {[string]} id_autocomplete_div []
 * @param {[string]} id_targetfield [ID from target to set value]
 * @param {[number]} start_at_letters [inputted string length at which autocomplete list should shown]
 * @param {[number]} count_results [number of max results]
 * @return {[Undefined]} Nothing returned, only make autocomplete visible or invisble
 */

async function set_autocomplete(id_formfield, id_autocomplete_div, id_targetfield = null, start_at_letters = 3, count_results = 5) {
    let input = document.getElementById(id_formfield);
    let autocomplete_div = document.getElementById(id_autocomplete_div);
    input.onkeyup = async () => {
        let characters = input.value;
        let button = document.getElementById('btnSubmit')
        let formFile = document.getElementById('formFileSm')
        if (characters.length >= start_at_letters) {
            try {
                let response = await autocomplete(characters)
                if (!response.ok) {
                    const message = 'Error with Status Code: ' + response.status;
                    throw new Error(message);
                }
                const data = await response.json();
                renderResults(data, characters, autocomplete_div, input, id_targetfield, count_results);
                autocomplete_div.classList.remove('invisible');
            } catch (error) {
                console.log('Error: ' + error);
            }
        }
        else {
            autocomplete_div.classList.add("invisible");
            // delete all childs from result list
            while (autocomplete_div.firstChild) {
                autocomplete_div.removeChild(autocomplete_div.firstChild);
            }
            if (id_targetfield) {
                document.getElementById(id_targetfield).value = '';
            }
            if (button) {
                button.disabled = true
            }
            if (formFile) {
                formFile.disabled = true
            }
            renderImages()
        }
    }
    let eleEmployee = document.getElementById(id_targetfield)
    if (eleEmployee.value) {
        try {
            let response = await autocomplete(null, eleEmployee.value)
            if (!response.ok) {
                const message = 'Error with Status Code: ' + response.status;
                throw new Error(message);
            }
            const data = await response.json();
            renderImages(data.shift()?.employeeImage)
        } catch (error) {
            console.log('Error: ' + error);
        }

    }
}


async function autocomplete(name = null, id = null) {
    // let results = [];
    let url = new URL(`${BASE_URL}Employee/Filter`)
    if (name) {
        url.searchParams.append("name", name)
    }
    if (id) {
        url.searchParams.append("IdStaff", id)
    }

    try {
        return await getApi(url)
    } catch (error) {
        console.error(error);
    }
    // item_list.filter(function (item) {
    //     if (item.toLowerCase().includes(search_string.toLowerCase())) {
    //         results.push(item);
    //     };
    // });
    // return results
}

function renderResults(results, search, container, form_id, form_target, max_results) {
    // delete unordered list from previous search result
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    // get properties from input field
    let form_font = window.getComputedStyle(form_id, null).getPropertyValue('font-size');
    let form_width = form_id.offsetWidth;

    //set result list to same width less borders
    container.style.width = form_width.toString() + 'px';

    if (results.length > 0) {
        // create ul and set classes
        let ul = document.createElement('UL');
        ul.classList.add('list-group', 'mt-1');

        // create list of results and append to ul
        if (results.length > max_results) {
            results = results.slice(0, max_results);
        }
        results.map((item) => {
            let a = document.createElement('A');
            a.classList.add('autocomplete-result', 'list-group-item', 'p-1'); // autocomplete used for init click event, other classes are from bootstrap
            a.setAttribute("reference", form_id.id); // used for click-Event to fill the form
            a.style.fontSize = form_font;
            a.href = '#';

            // see function below - marked search string in results
            a.innerHTML = colored_result(item.name, search);

            // add Eventlistener for search renderResults
            a.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                // get text from list item and set it into reffered form field
                let content = a.innerText;
                let form_id = a.getAttribute('reference');
                let button = document.getElementById('btnSubmit')
                let formFile = document.getElementById('formFileSm')
                document.getElementById(form_id).value = content
                if (form_target) {
                    document.getElementById(form_target).value = item.id
                }

                // after choosen a result make div with results invisible -> after changing input content again,
                // all of childs of current div will be deleted [line 48,49]
                container.classList.add('invisible');
                if (button) {
                    button.disabled = false
                }
                if (formFile) {
                    formFile.disabled = false
                }
                renderImages(item.employeeImage)
            });
            ul.append(a);
        });

        // append ul to container and make container visible
        container.append(ul);
        container.classList.remove('invisible');
        //choose_result(); // add Eventlistener to every result in ul
    }
    else {
        container.classList.add('invisible');

    }
}

// create span's with colored marked search strings
function colored_result(string, search) {
    let splitted = string.toLowerCase().split(search.toLowerCase());

    let sp = []; // array of all spans, created in folling loop
    let start = 0; //start for slicing

    splitted.map(function (element, index) {
        // empty string at the beginning
        if (element == false) {
            sp.push("<span class='text-info'>" + string.slice(start, start + search.length) + "</span>");
            start = start + search.length;
        }
        else if (index + 1 == splitted.length) {
            sp.push("<span>" + string.slice(start, start + element.length) + "</span>");
        }
        else {
            sp.push("<span>" + string.slice(start, start + element.length) + "</span>");
            start = start + element.length;
            sp.push("<span class='text-info'>" + string.slice(start, start + search.length) + "</span>");
            start = start + search.length;
        }
    });
    return sp.join('')
}

// create image preview of employe
function renderImages(images = []) {
    let cardSmall = document.getElementById("old_image")
    let child = cardSmall.lastElementChild;
    while (child) {
        cardSmall.removeChild(child);
        child = cardSmall.lastElementChild;
    }

    for (const iterator of images) {
        // let div = document.createElement("div")
        // div.classList.add("card")
        let image = new Image(150, 150);
        image.classList.add("img-thumbnail", "rounded", "float-start")
        image.src = iterator.url
        image.setAttribute("data-id", iterator.id)
        let scope_image = document.createElement("div")
        let header = document.createElement("div")
        header.classList.add("card-header")
        header.innerHTML = `<button type="button" onclick=removeFile(this) data-id="${iterator.id}" class="btn-close" aria-label="Close"></button>`
        scope_image.appendChild(header)
        scope_image.classList.add("card-image", "waves-effect", "waves-block", "waves-light")

        scope_image.appendChild(image)
        cardSmall.appendChild(scope_image)

    }

}