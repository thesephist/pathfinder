// Instance-Specific Algorithm Composition encryption, or ISAC
// Copyright Linus Lee 2015

var processing; // bit string in processing

String.prototype.repeat = function(num) {
    return new Array(num + 1).join(this)
}

var nbit = 32; // allows for 8, 16, 32-bit ISAC encryption
var zerofiller = "0".repeat(nbit + 1);
var onefiller  = "1".repeat(nbit + 1);

function rset(n) {
    rxe = new RegExp(".{1," + n.toString() + "}","g");
    return rxe;
}

function encode(words) {
    // encodes string to binary ASCII string
    words = words.replace(/[^\x20-\x7E]+/g, ''); // take out non-ASCII characters. They cause trouble.
    wordsList = words.split("");
    bits = "";
    wordsList.forEach(function(letter) {
        mlk = "0"+parseInt(letter.charCodeAt()).toString(2);
        bits += zerofiller.substr(0, 8 - mlk.length) + mlk;
    });
    
    return bits;
}

function decode(bits) {
    // decodes binary ASCII to string
    words = "";
    bitsList = bits.match(rset(8));
    bitsList.forEach(function(code) {
        words += String.fromCharCode(parseInt(code,2));
    });
    return words;
}

// G elements
function adder(n) { // formerly "inverse", when applied only to 1-bit string objects
    stringBits = processing.match(rset(n));
    totalBits = "";
    
    stringBits.forEach(function(bitstring) {
        e = (parseInt(bitstring, 2) + 1).toString(2);
        if (e.length<n) {
            e=zerofiller.substr(0, n - e.length) + e
        }
        if (e.length == n + 1) {
            e = zerofiller.substr(0, n)
        }
        totalBits += e;
    });
    
    processing = totalBits;
}
function rAdder(n) { // inverse function of adder()
    stringBits = processing.match(rset(n));
    totalBits = "";
    
    stringBits.forEach(function(bitstring) {
        e = "";
        if (bitstring == zerofiller.substr(0, n)) {
            e = onefiller.substr(0, n)}
        else {
            e = (parseInt(bitstring, 2) - 1).toString(2);
        }
        if (e.length<n) {
            e = zerofiller.substr(0, n - e.length) + e
        }
        if (e.length == n + 1) {
            e = zerofiller.substr(0, n);
        }
        totalBits += e;
    });

    processing = totalBits;
}
function cycle(n) {
    stringBits = processing.match(rset(n));
    totalBits = "";
    
    stringBits.forEach(function(bitstring) {
        e = bitstring.substring(1, n) + bitstring[0];
        totalBits += e;
    });

    processing = totalBits;
}
function rCycle(n) {   
    stringBits = processing.match(rset(n));
    totalBits = "";
    
    stringBits.forEach(function(bitstring) {
        e = bitstring[n-1] + bitstring.substring(0,n-1)
        totalBits += e;
    });
    
    processing = totalBits;
}

function reverse(n) {    
    stringBits = processing.match(rset(n));
    processing = stringBits.reverse().join("");
}
function rReverse(n) {
    reverse(n);
}

function split(n) {    
    bitsarray = new Array(n);
    for (i = 0; i < n; i++) {
        bitsarray[i] = ""
    }
    for (i = 0; i < processing.length; i++) {
        bitsarray[i % n] += processing[i]
    }
    
    processing=bitsarray.join("");
}
function rSplit(n) {
    bitsarray = processing.match(rset(processing.length / n));
    processing = "";
    for(i = 0; i < bitsarray.join("").length; i++) {
        processing += bitsarray[i % n][Math.floor(i / n)];
    }
}

// Other Modules:
var random_seed;

function rs_w(keyword) {
    // random key generator
    encodedK = encode(keyword);
    if (keyword.length * 8 != encodedK.length) {
        console.warn("Invalid encryption key!");
        return rs_g(30, 50);
    }
    encodedK = encodedK.match(rset(8));
    random_seed = "";

    encodedK.forEach(function(letter) {
        random_seed += parseInt(letter.substr(3,2), 2).toString() + Math.pow(2, Math.floor(parseInt(letter.substr(5), 2) / 8 * 5)).toString() + " ";
    });

    return random_seed.replace(/0 /g, "1 ").toString().trim();
}

function rs_g(lower, upper) {
    // random key generator
    if (lower == undefined) {lower = 76}
    if (upper == undefined) {upper = 150}
    random_seed = "";
    digits = Math.floor((Math.random() * parseInt(upper / 2)) + parseInt(lower / 2)) * 2; // digit # from 100 to 200
    for(i=0; i < digits; i++) {
        if(i % 2 == 0) {
            random_seed += Math.floor((Math.random() * 4)).toString();
        }else{
            random_seed += Math.pow(2, Math.floor(Math.random() * (Math.log(nbit) / Math.log(2) + 1))).toString();
            random_seed += " ";
        }
    }

    return random_seed.toString().trim();
}

function key_norm(size, key) {
    key = parseInt(key.split(" ").join("")).toString(2);

    key_size = key.length;
    diff = size % key_size;
    return key.repeat(parseInt((size - diff) / key_size)) + key.substr(0, diff);
}

function bit_norm() {
    adder(nbit);
    rAdder(nbit);
}

function G(binary, random_seed) {
    split_seed = random_seed.split(" ");
    
    processing = binary;
    bit_norm();
    split_seed.forEach(function(pair) {
        if      (pair[0] == "0") {adder(parseInt(pair.substr(1)))}
        else if (pair[0] == "1") {cycle(parseInt(pair.substr(1)))}
        else if (pair[0] == "2") {reverse(parseInt(pair.substr(1)))}
        else if (pair[0] == "3") {split(parseInt(pair.substr(1)))}
    });
    
    return processing;
}

function r_G(binary, random_seed) {
    split_seed = random_seed.split("").reverse().join("").split(" ");
    for (i=0; i<split_seed.length; i++) {
        split_seed[i] = split_seed[i].split("").reverse().join("");
    }

    processing = binary;
    bit_norm();
    split_seed.forEach(function(pair) {
        if      (pair[0] == "0") {rAdder(parseInt(pair.substr(1)))}
        else if (pair[0] == "1") {rCycle(parseInt(pair.substr(1)))}
        else if (pair[0] == "2") {rReverse(parseInt(pair.substr(1)))}
        else if (pair[0] == "3") {rSplit(parseInt(pair.substr(1)))}
    });
    
    return processing;
}

function H(bits, key) {
    key = key_norm(bits.length, key);
    
    result = "";
    vsum = 0;
    
    for (i=0; i<bits.length; i++) {
        if (bits[i] == key[i]) {result += "1"}
        else {result += "0"}
    }

    bit2 = result.match(rset(2));
    for (i=0; i<bit2.length; i++) {
        vsum += parseInt(bit2[i], 2);
    }

    vsum = (vsum * 72) % result.length;
    out = result.substr(vsum, result.length - vsum) + result.substr(0, vsum);

    return out;
}

function r_H(bits, key) {
    key = key_norm(bits.length, key);
 
    vsum = 0;
    bit2 = bits.match(rset(2));

    for (i=0; i<bit2.length; i++) {
        vsum += parseInt(bit2[i], 2);
    }
    
    vsum = (vsum * 72) % bits.length;
    bits = bits.substr(bits.length - vsum, vsum) + bits.substr(0, bits.length - vsum);
   
    result = "";
    for (i=0; i<bits.length; i++) {
        if (bits[i] == key[i]) {result += "1"}
        else {result += "0"}
    }
 
    return result;
}

function encryptor(text, key, option) {
    if (key == undefined) {
        console.warn("Please specify an encryption key");
        return false;
    }
    reply = H(G(encode(text), key), key).toString();
    if (option == 'hex') {
        hexply = '';
        reply = reply.match(rset(8));
        reply.forEach(function(octa) {
            addin = parseInt(octa, 2).toString(16);
            if (addin.length == 1) {
                hexply += '0';
            }
            hexply += addin;
        });
        return hexply
    } else {
        return reply;
    }
}

function decryptor(binary, key, option) {
    if (option == 'hex') {
        hexinary = binary.match(rset(2));
        binary = '';
        hexinary.forEach(function(octa) {
          addin = parseInt(octa, 16).toString(2);
          binary += '0'.repeat(8 - addin.length) + addin;
        });
    }
    return decode(r_G(r_H(binary, key), key).toString()).split('\u0000').join("");
}

function encryptorx(words, key) {
    // returns binary buffer
    datastream = encryptor(words, key).match(rset(8));
    var buf = new ArrayBuffer(datastream.length);
    var data = new DataView(buf, 0);

    for (i=0; i<datastream.length; i++) {
        data.setInt8(i, parseInt(datastream[i], 2));
    }
    return buf;
}

function decryptorx(data, key) {
    // takes binary data
    var buf = data;
    var view = new DataView(buf, 0);
    var str = "";

    for (i=0; i<buf.byteLength; i++) {
        bits = view[i].toString(2);
        str += zerofiller.substr(0, 8 - bits.length) + bits;
    }
    return decryptor(str, key);
}

