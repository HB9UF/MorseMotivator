// TODO: Load settings from cookie if they exist, reset otherwise
reset_settings();
// TODO: Only display modal when cookie is missing
var help_modal = new bootstrap.Modal(document.getElementById('help_modal'), {});
help_modal.show();

// Copy range values to numeric output
function apply_range_values() {
    document.getElementById("output_wpm").innerHTML = document.getElementById("input_wpm").value;
    document.getElementById("output_effective_wpm").innerHTML = document.getElementById("input_effective_wpm").value;
    document.getElementById("output_maxlength").innerHTML = document.getElementById("input_maxlength").value;
    document.getElementById("output_freq").innerHTML = document.getElementById("input_freq").value;
    document.getElementById("output_n_chars").innerHTML = document.getElementById("input_n_chars").value;
    document.getElementById("output_n_words").innerHTML = document.getElementById("input_n_words").value;
    update_koch_chars();
}

// Store current settings in cookie
function store_settings() {
    // TODO: implement
}

// Remove cookie and reset default settings
function reset_settings() {
    // TODO: remove cookie
    document.getElementById("input_wpm").value = 20;
    document.getElementById("input_effective_wpm").value = 18;
    document.getElementById("input_maxlength").value = 7;
    document.getElementById("input_freq").value = 600;
    document.getElementById("input_n_chars").value = 5;
    document.getElementById("input_n_words").value = 5;
    apply_range_values();
    update_koch_chars();
}

// Highlight characters that are used for training
function update_koch_chars() {
    let counter = 0;
    for(c of document.getElementById("koch_chars").children) {
        if(counter++ < document.getElementById("input_n_chars").value) {
            c.classList.add("text-danger");
            c.classList.remove("text-muted");
        } else {
            c.classList.add("text-muted");
            c.classList.remove("text-danger");
        }
    }
}

// Inform jscwlib about frequency change. Also works while player is running
function jscwlib_update_frequency() {
    m.setFreq(document.getElementById("input_freq").value);
}

// Set {input,output}_n_chrs according to character that was just clicked
function koch_char_clicked(element) {
    let counter = 0;
    for(c of document.getElementById("koch_chars").children) {
        counter++;
        if(c == element) break;
    }
    document.getElementById("input_n_chars").value = counter;
    apply_range_values();
    update_koch_chars();
}

function activate_spinner() {
    document.getElementById("spinner").classList.remove("invisible");
}

function disable_spinner() {
    document.getElementById("spinner").classList.add("invisible");
}

/* Insert a <script> tag with the appropriate word list as WORDLIST array.
 * The WORDLIST must be sorted with incrementing word length for the wordlength-
 * constrained shuffle to work properly. The <script>-approach seems like a bit
 * of a hack, but we can also load the wordlist from the local filesystem this way.
 * There is an untested and probably buggy function fetch_wordlist() below that uses
 * fetch() to load the file. In that case, the WORDLIST should be plain text and the
 * return value must be stored into WORDLIST. We may come back later and revisit this
 * approach.
 */
function load_wordlist() {
    let input_n_chars = document.getElementById("input_n_chars").value;
    test = /^\d+$/.test(input_n_chars) && input_n_chars >= 4 && input_n_chars <= 26;
    if(!test) {
        console.log("Error: input_n_chars is not an integer or out of bounds.");
        return;
    }

    let script = document.createElement("script");
    // TODO: Allow for English word list also
    script.setAttribute("src", "wordlists/swiss." + input_n_chars);
    script.setAttribute("type", "text/javascript");
    script.setAttribute("onload", "jscwlib_generate_morse_cont()");
    document.getElementsByTagName("head")[0].appendChild(script);
}

/*
const BASE_URL = 'https://www.hb9uf.ch/MorseMotivator/';
function fetch_wordlist() {
    let input_n_chars = document.getElementById("input_n_chars").value;
    test = /^\d+$/.test(input_n_chars) && input_n_chars >= 4 && input_n_chars <= 26;
    if(!test) {
        console.log("Error: input_n_chars is not an integer or out of bounds.");
        return;
    }

    let url = BASE_URL + "/wordlists/swiss." + input_n_chars;
    fetch(url)
        .then(response => {
            return response.text();
        })
        .then(content => {
            let = content;
        })
        .catch(error => {
            console.error(error);
        });
    return content;
}
*/

https://stackoverflow.com/a/11935263/23545181
function get_random_subarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

// Returns an array of words drawn randomly from wordlist
function compile_text() {
    let word_length_limit = document.getElementById("input_maxlength").value;
    let local_wordlist = [];
    for(word of WORDLIST) {
        if(word.length > word_length_limit) {
            // WORDLIST is sorted by increasing word length, thus we can sefely abort
            break;
        }
        local_wordlist.push(word);
    }

    let words_to_go = document.getElementById("input_n_words").value;
    let ret = [];
    // TODO: Perhaps use other randomization technique here
    while(words_to_go > 0) {
        let sample_size = Math.min(words_to_go, local_wordlist.length);
        ret = ret.concat(get_random_subarray(local_wordlist, sample_size));
        words_to_go -= sample_size;
    }
    return ret;
}

// this will process the array passed as parameter and populate the cw_text <div>
function populate_cw_text(text_array) {
    let div = document.getElementById('cw_text');
    div.innerHTML = ''; // Clear content
    for (word of text_array) {
        for(c of word) {
            // Dedicated span for every character
            let span = document.createElement("span");
            span.innerHTML = c;
            div.appendChild(span);
        }
        // Extra span for space
        let span = document.createElement("span");
        span.innerHTML = ' ';
        div.appendChild(span);
    }
}

function show_cw_text() {
    document.getElementById('cw_text').classList.remove('invisible');
    document.getElementById('show_cw_text').classList.add('d-none');
    document.getElementById('hide_cw_text').classList.remove('d-none');
}

function hide_cw_text() {
    document.getElementById('cw_text').classList.add('invisible');
    document.getElementById('show_cw_text').classList.remove('d-none');
    document.getElementById('hide_cw_text').classList.add('d-none');
}

// jscwlib callback, called on every character. Used to move the highlight
// Parameter o is object with attribute 'n' (position) and 'c' (character)
function highlight_cw_text(o) {
    let chars = document.getElementById("cw_text").children;
    chars[o.n].classList.add("text-primary");
    if(o.n > 0) chars[o.n-1].classList.remove("text-primary");
}

function clear_cw_text_highlights() {
    let chars = document.getElementById("cw_text").children;
    for(c of chars) {
        c.classList.remove("text-primary");
    }
}

m = new jscw();
function jscwlib_generate_morse() {
    activate_spinner();
    load_wordlist(); // onload will call jscwlib_generate_morse_cont
}

// ... here, we wait for the wordlist to load ...

function jscwlib_generate_morse_cont() {
    // Compile and set text
    let text_array = compile_text();
    populate_cw_text(text_array);
    disable_spinner();

    // Now that cw_text is populated, enable the display button
    document.getElementById('show_cw_text').classList.remove('disabled');

    // Setup jscw
    if(!m.paused) m.pause(); // In case player is already running
    m = new jscw();
    jscwlib_update_frequency();
    m.setWpm(document.getElementById("input_wpm").value);
    m.setEff(document.getElementById("input_effective_wpm").value);
    m.setStartDelay(3);
    m.setText(text_array.join(" "));
    m.onCharacterPlay = highlight_cw_text; // Callback to update cw_text highlight
    m.onFinished = clear_cw_text_highlights; // Callback to remove all highlights
    // This is needed since the stop button does not appear to trigger the onFinished callback
    m.onPlay = clear_cw_text_highlights;
    m.renderPlayer("player", m);
    let player = document.getElementById("player");
    // Override  few default styles
    player.style.width = "220px";
    player.style.borderStyle = "none";
    // Add border now since border around empty player div is ugly
    player.parentElement.classList.add("border", "border-primary");
    // We want to hide the Settings button by setting the invisible class property on
    // the respective element. This is not great as the authors of jcswlib may rename
    // something, breaking the following querySelector in consequence.
    player.querySelector("a[title='Settings']").classList.add("invisible");
}
