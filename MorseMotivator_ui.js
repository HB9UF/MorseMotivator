// TODO: Load settings from cookie if they exist, reset otherwise
reset_settings();

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
        if(counter++ < document.getElementById("input_n_chars").value ) {
            c.classList.add('text-danger');
            c.classList.remove('text-muted');
        } else {
            c.classList.add('text-muted');
            c.classList.remove('text-danger');
        }
    }
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
