function ipToHex(ip) {
    let hex = "";
    let octets = ip.split(".");
    for (let i = 0; i < octets.length; i++) {
        let octet = parseInt(octets[i]).toString(16);
        if (octet.length === 1) {
            octet = "0" + octet;
        }
        hex += octet;
        if (i < octets.length - 1) {
            hex += ".";
        }
    }

    return hex;
}

function ipToNetwork(ip) {
    return binaryToIp(ipToBinary(ip).slice(0, -8) + "00000000")
}

function ipToBinary(ip) {
    let binary = "";
    let octets = ip.split(".");
    for (let i = 0; i < octets.length; i++) {
        let octet = parseInt(octets[i]).toString(2);
        while (octet.length < 8) {
            octet = "0" + octet;
        }
        binary += octet;
    }
    return binary;
}

function binaryToIp(binary) {
    let ip = "";
    for (let i = 0; i < binary.length; i += 8) {
        let octet = binary.slice(i, i + 8);
        ip += parseInt(octet, 2);
        if (i < binary.length - 8) {
            ip += ".";
        }
    }
    return ip;
}

function ipRange(maskBits, ip) {
    let lower = "";
    let upper = "";

    for (let i = 0; i < (32 - maskBits); i++) {
        lower += "0";
        upper += "1";
    }

    let broadcast = binaryToIp(ipToBinary(ip).slice(0, -(32 - parseInt(maskBits))) + upper);
    lower = lower.slice(0,-1) + "1"
    upper = upper.slice(0, -1) + "0"

    return [
        binaryToIp(ipToBinary(ip).slice(0, -(32 - parseInt(maskBits))) + lower),
        binaryToIp(ipToBinary(ip).slice(0, -(32 - parseInt(maskBits))) + upper),
        broadcast
    ];
}

function isValidIP(ip) {
    if (ip.split(".").length !== 4) {
        return false;
    }

    for (let i = 0; i < ip.split(".").length; i++) {
        if (Number.isInteger(parseInt(ip.split(".")[i])) === false) {
            return false;
        }
        
        if (parseInt(ip.split(".")[i]) > 255 || parseInt(ip.split(".")[i]) < 0) {
            return false;
        }

    }
    return true;
}

function maskBitsFunction(maskBits) {
    let hosts = Math.pow(2, (32 - parseInt(maskBits))) - 2;
    let binary = "";
    let subnetMask = "";

    for (let i = 0; i < parseInt(maskBits); i++) {
        binary += "1";
    }
    
    for (let i = 0; i < (32 - parseInt(maskBits)); i++) {
        binary += "0";
    }

    for (let i = 0; i < binary.length; i += 8) {
        let octet = binary.slice(i, i + 8);
        subnetMask += parseInt(octet, 2);
        if (i < binary.length - 8) {
            subnetMask += ".";
        }
    }

    return [maskBits, subnetMask, hosts];
}

function subnetMaskFunction(subnetMask) {
    let maskBits = 0;
    let binary = "";

    for (let i = 0; i < subnetMask.split(".").length; i++) {
        binary += parseInt(subnetMask.split(".")[i]).toString(2);
    }

    for (let i = 0; i < binary.length; i++) {
        if (binary[i] === "1") {
            maskBits++;
        }
    }

    return [maskBits, subnetMask, Math.pow(2, (32 - maskBits)) - 2];
}

function hostsFunction(hosts) {
    let maskBits = 32 - Math.log2(parseInt(hosts) + 2);
    let binary = "";
    let subnetMask = "";

    for (let i = 0; i < maskBits; i++) {
        binary += "1";
    }

    for (let i = 0; i < (32 - maskBits); i++) {
        binary += "0";
    }

    for (let i = 0; i < binary.length; i += 8) {
        let octet = binary.slice(i, i + 8);
        subnetMask += parseInt(octet, 2);
        if (i < binary.length - 8) {
            subnetMask += ".";
        }
    }

    return [maskBits, subnetMask, hosts];
}

function  resultsDataTable(selectionType) {
    const ipInput = document.getElementById("ipInput").value;
    const maskBitsDropdown = document.getElementById("maskBitsSelection");
    const subnetMaskDropdown = document.getElementById("subnetMaskSelection");
    const hostsDropdown = document.getElementById("hostsSelection");
    const notationSelection = document.querySelector("input[name='notationSelection']:checked");
    const resultsText = document.getElementById("resultsText")
    
    let maskBitsSelection, subnetMaskSelection, hostsSelection;

    if (selectionType === 'maskBitsSelection') {
        [maskBitsSelection, subnetMaskSelection, hostsSelection] = maskBitsFunction(maskBitsDropdown.value);
        subnetMaskDropdown.value = subnetMaskSelection;
        hostsDropdown.value = hostsSelection;
    } else if (selectionType === 'subnetMaskSelection') {
        [maskBitsSelection, subnetMaskSelection, hostsSelection] = subnetMaskFunction(subnetMaskDropdown.value);
        maskBitsDropdown.value = maskBitsSelection;
        hostsDropdown.value = hostsSelection;
    } else if (selectionType === 'hostsSelection') {
        [maskBitsSelection, subnetMaskSelection, hostsSelection] = hostsFunction(hostsDropdown.value);
        maskBitsDropdown.value = maskBitsSelection;
        subnetMaskDropdown.value = subnetMaskSelection;
    }

    [maskBitsSelection, subnetMaskSelection, hostsSelection] = maskBitsFunction(maskBitsDropdown.value);

    let [lowerRange, upperRange, broadcast] = ipRange(maskBitsSelection, ipInput);

    if (isValidIP(ipInput) === true) {
        if (notationSelection.value === "Dec") {
            resultsText.value =
                `Network: ${ipToNetwork(ipInput)}/${maskBitsSelection}\n` +
                `Netmask: ${subnetMaskSelection}\n` +
                `IP Range: ${lowerRange}\n` +
                `          ${upperRange}\n` +
                `Hosts: ${hostsSelection}\n` +
                `Broadcast: ${broadcast}`;
        } else if (notationSelection.value === "Hex") {
            resultsText.value =
                `Network: ${ipToHex(ipToNetwork(ipInput))}/${parseInt(maskBitsSelection).toString(16)}\n` +
                `Netmask: ${ipToHex(subnetMaskSelection)}\n` +
                `IP Range: ${ipToHex(lowerRange)}\n` +
                `          ${ipToHex(upperRange)}\n` +
                `Hosts: ${parseInt(hostsSelection).toString(16)}\n` +
                `Broadcast: ${ipToHex(broadcast)}`;
        } else if (notationSelection.value === "Bin") {
            resultsText.value =
                `Network: ${ipToBinary(ipToNetwork(ipInput))}\n` +
                `Netmask: ${ipToBinary(subnetMaskSelection)}\n` +
                `IP Range: ${ipToBinary(lowerRange)}\n` +
                `          ${ipToBinary(upperRange)}\n` +
                `Broadcast: ${ipToBinary(broadcast)}`;
        }
    } else {
        resultsText.value = "Invalid IP Address";
    }
}

// Call  resultsDataTable on initial load to display the results
resultsDataTable();