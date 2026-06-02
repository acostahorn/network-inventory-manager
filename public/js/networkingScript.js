var orders = [];
window.orders = orders;

const closeChat = document.getElementById('close-chat');
const box = document.querySelector('.chat-box');

const clearChatBtn = document.getElementById('clear-chat');

const categories = ['router', 'switch', 'access point', 'workstation', 'server','printer','accessory'];

const designArea = document.querySelector('.design-area');

const btn = document.querySelectorAll('.designButton');

const sel = document.querySelectorAll('select');

const designForm = document.getElementById('designForm');

const canvasJSONInput = document.getElementById('canvasJSONInput');

const adminSaveBtn = document.getElementById('adminSaveBtn');

for (let i = 0; i < btn.length; i++) {
    btn[i].addEventListener('click', function () {
        return addPiece(i)

    });
}


let activeConnections = []; // Stores pairs of { from: spriteElement, to: spriteElement, line: svgLineElement }

let selectedSprite = null; // Stores the first sprite clicked

//SAVER
function saveAll() {
    const state = {
        sprites: Array.from(document.querySelectorAll('.sprite')).map(el => ({
            id: el.dataset.id,
            left: el.style.left,
            top: el.style.top,
            label: el.querySelector('span').innerText,
            iconSrc: el.querySelector('img').getAttribute('src')
        })),
        connections: activeConnections.map(conn => ({
            fromId: conn.from.dataset.id,
            toId: conn.to.dataset.id,
            cableType: conn.cableType
        })),
        orders: window.orders
    };

    // POINT TO THE BACKGROUND SAVE ROUTE
    fetch(`/users/${window.CURRENT_USER_ID}/design/save-background`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasJSON: JSON.stringify(state) })
    })
        .then(response => {
            if (response.ok) {
                console.log("Canvas saved in background.");
            }
        })
        .catch(error => console.error("Save failed:", error));

    // CRITICAL: Always refresh summary when saving

    updateAdminStockSummary();
    updateSubmitButtonState();
}

//LOADER
function loadAll() {
    // 1. Get the string from the "Bridge" we created in the EJS file
    const rawData = window.SERVER_SAVED_DESIGN;
    // 2. Safety Check: If it's empty, undefined, or just a pair of braces, stop here
    if (!rawData || rawData === "{}" || rawData === "undefined" || rawData === "null") {
        console.log("No saved design found in database.");
        return;
    }

    try {
        // 3. Turn the string back into a JavaScript Object
        const data = JSON.parse(rawData);

        // 4. Restore the Orders Array (if it exists)
        if (data.orders) {
            window.orders = data.orders;
        }

        // 5. REBUILD SPRITES FIRST
        // We must have sprites in the DOM before we can draw cables between them
        if (data.sprites && Array.isArray(data.sprites)) {
            data.sprites.forEach(s => {
                // This calls your existing function that handles drag/click/drop logic
                const newSprite = createRestoredSprite(s);
                designArea.appendChild(newSprite);
            });
        }

        // 6. REBUILD CABLES SECOND
        if (data.connections && Array.isArray(data.connections)) {
            data.connections.forEach(c => {
                // Find the elements we just created in step 5 using their data-id
                const fromEl = document.querySelector(`[data-id="${c.fromId}"]`);
                const toEl = document.querySelector(`[data-id="${c.toId}"]`);

                // If both ends of the cable exist, draw the line
                if (fromEl && toEl) {
                    connectSprites(fromEl, toEl, c.cableType);
                }
            });
        }

        // 7. Update the UI summary
        // if (typeof showOrders === 'function') {
        //     showOrders();
        // }

        console.log("Network design successfully restored from MongoDB.");

    } catch (e) {
        console.error("Critical error during design restoration:", e);
    }
}

// IMPORTANT: Trigger the loader immediately when the file is loaded

function createRestoredSprite(data) {
    // This is essentially our addPiece logic but using 'data' instead of 'sel[i]'
    var sprite = document.createElement('div');
    sprite.classList.add('sprite');
    sprite.dataset.id = data.id;
    sprite.dataset.productName = data.label;
    sprite.style.left = data.left;
    sprite.style.top = data.top;

    var label = document.createElement('span');
    label.innerText = data.label;
    var image = document.createElement('img');
    image.src = data.iconSrc;
    image.classList.add('icon');

    sprite.appendChild(image);
    sprite.appendChild(label);
    sprite.addEventListener('click', handleSpriteClick);
    sprite.addEventListener('dblclick', (e) => { e.stopPropagation(); deleteSprite(sprite); });

    // Simplified version of our existing mouseDown)
    sprite.addEventListener('mousedown', (e) => {
        let startX = e.clientX, startY = e.clientY;
        const move = (e) => {
            let newX = startX - e.clientX, newY = startY - e.clientY;
            startX = e.clientX; startY = e.clientY;
            sprite.style.top = (sprite.offsetTop - newY) + 'px';
            sprite.style.left = (sprite.offsetLeft - newX) + 'px';
            drawCables();
        };
        const up = () => {
            document.removeEventListener('mousemove', move);
            saveAll(); // Save position when drag ends
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    });

    // Update global counter so new items don't double-up IDs
    return sprite;
}


function handleSpriteClick(e) {
    const clickedSprite = e.currentTarget;

    if (!selectedSprite) {
        selectedSprite = clickedSprite;
        selectedSprite.style.outline = "3px solid #2ecc71";
    } else {
        if (selectedSprite !== clickedSprite) {
            const existingConnection = activeConnections.find(conn =>
                (conn.from === selectedSprite && conn.to === clickedSprite) ||
                (conn.from === clickedSprite && conn.to === selectedSprite)
            );

            if (existingConnection) {
                // deleteCable now handles the orders array removal internally
                deleteCable(existingConnection);
                console.log("Connection removed!");
            } else {
                const type = sel[6].value; // Or whichever index is your cable dropdown
                window.orders.push(type);
                connectSprites(selectedSprite, clickedSprite, type);
                console.log("Connection created!");
            }
        }
        selectedSprite.style.outline = "none";
        selectedSprite = null;

        // Save point
        saveAll();
    }
}



function drawCables() {
    activeConnections.forEach(conn => {
        // Get current positions of both sprites
        const rect1 = conn.from.getBoundingClientRect();
        const rect2 = conn.to.getBoundingClientRect();
        const area = designArea.getBoundingClientRect();

        // Calculate center points relative to the design area
        const x1 = rect1.left + rect1.width / 2 - area.left - 10;
        const y1 = rect1.top + rect1.height / 2 - area.top - 10;
        const x2 = rect2.left + rect2.width / 2 - area.left - 10;
        const y2 = rect2.top + rect2.height / 2 - area.top - 10;

        // Update the SVG line attributes
        conn.line.setAttribute('x1', x1);
        conn.line.setAttribute('y1', y1);
        conn.line.setAttribute('x2', x2);
        conn.line.setAttribute('y2', y2);
    });
}

function deleteCable(connection) {
    // 1. Remove the specific cable type from the orders array
    const cableIndex = window.orders.indexOf(connection.cableType);
    if (cableIndex > -1) {
        window.orders.splice(cableIndex, 1);
        console.log(`Removed ${connection.cableType} from orders. Remaining:`, orders);
    }

    // 2. Remove the line from the SVG canvas
    if (connection.line) {
        connection.line.remove();
    }

    // 3. Remove from tracking array
    const connIndex = activeConnections.indexOf(connection);
    if (connIndex > -1) {
        activeConnections.splice(connIndex, 1);
    }


}



function connectSprites(spriteA, spriteB, cableType) {
    const svg = document.getElementById('cable-layer');
    if (!svg) return console.error("SVG layer missing!");

    const newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newLine.setAttribute('stroke', 'black');
    newLine.setAttribute('stroke-width', '2');
    svg.appendChild(newLine);

    const connection = {
        from: spriteA,
        to: spriteB,
        line: newLine,
        cableType: cableType // Use the passed argument
    };

    // 1. Add to visual tracking array
    activeConnections.push(connection);

    // 2. Add the delete listener to the line itself
    newLine.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCable(connection);
        saveAll(); // Save after manual line deletion
    });

    drawCables();
}



function deleteSprite(spriteElement) {
    // 1. Remove the sprite's own identity from orders (e.g., "Router")
    const productName = spriteElement.dataset.productName;
    const spriteIndex = window.orders.indexOf(productName);
    if (spriteIndex > -1) {
        window.orders.splice(spriteIndex, 1);
        console.log(`Successfully removed ${productName} from orders.`);
    } else {
        console.warn(`Could not find "${productName}" in orders array!`);
    }

    // 2. Find all cables connected to this sprite
    const connectionsToRemove = activeConnections.filter(conn =>
        conn.from === spriteElement || conn.to === spriteElement
    );

    // 3. This now correctly removes cable strings from 'orders' 
    // because we updated deleteCable above!
    connectionsToRemove.forEach(conn => deleteCable(conn));

    // 4. Final UI cleanup
    spriteElement.remove();
    if (selectedSprite === spriteElement) {
        selectedSprite = null;
    }
    updateAdminStockSummary();
    updateSubmitButtonState();

    saveAll();
}


//enable or disable submit button

function updateSubmitButtonState() {
    const btn = document.getElementById('submitApprovalBtn');
    if (!btn) return;

    // Use your global 'orders' array
    // If it has length, enable the button; if length is 0, disable it
    btn.disabled = (window.orders.length === 0);
}



// adds sprites 

function addPiece(i) {
    const currentSprites = document.querySelectorAll('.sprite');
    const index = currentSprites.length; // This is your new "Counter"


    // 1. Create the Sprite Element
    const sprite = document.createElement('div');
    sprite.classList.add('sprite');
    sprite.dataset.productName = sel[i].value;
    // 1. Calculate position BEFORE incrementing
    // This creates a grid: 6 columns wide, 50px spacing
    let column = index % 6;           // 0, 1, 2, 3, 4, 5
    let row = Math.trunc(index / 6);  // 0, 0, 0... then 1, 1, 1...

    let xShift = column * 60; // Increased to 60 for a little breathing room
    let yShift = row * 60;

    // 2. Set position
    sprite.style.left = `${20 + xShift}px`;
    sprite.style.top = `${20 + yShift}px`;

    // 3. NOW assign the ID and increment
    sprite.dataset.id = Date.now();


    // 2. Add Label and Icon
    const label = document.createElement('span');
    label.innerText = sel[i].value;

    const image = document.createElement('img');
    image.src = `/icons/${categories[i]}.svg`;
    image.classList.add('icon');

    sprite.appendChild(image);
    sprite.appendChild(label);
    designArea.appendChild(sprite);

    // 3. Attach Event Listeners (ONLY to this specific sprite)
    sprite.addEventListener('click', handleSpriteClick);
    sprite.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        deleteSprite(sprite);
    });

    // 4. Attach Drag Logic (Using the refactored helper)
    makeDraggable(sprite);

    // 5. Update the "Source of Truth" (Orders Array)
    window.orders.push(sel[i].value);

    updateSubmitButtonState();
    updateAdminStockSummary(); // Update UI immediately

    // 6. Persist to MongoDB
    saveAll();
}

/**
 * Helper function to handle drag logic for a single element
 */
function makeDraggable(element) {
    let startX = 0, startY = 0;

    const mouseDown = (e) => {
        startX = e.clientX;
        startY = e.clientY;
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
    };
    const mouseMove = (e) => {
        // 1. Calculate the "Delta" (New - Old)
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // 2. Update the "Old" markers to the current position for the next frame
        startX = e.clientX;
        startY = e.clientY;

        // 3. Add the movement to the current position
        element.style.left = (element.offsetLeft + deltaX) + 'px';
        element.style.top = (element.offsetTop + deltaY) + 'px';

        // 4. Update the cables
        drawCables();
    };
    const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
        saveAll(); // Save final position after drop
    };

    element.addEventListener('mousedown', mouseDown);
}

if (adminSaveBtn) {
    adminSaveBtn.addEventListener('click', async () => {
        // 1. Prepare the state object exactly like your 'saveAll' function does
        const state = {
            sprites: Array.from(document.querySelectorAll('.sprite')).map(el => ({
                id: el.dataset.id,
                left: el.style.left,
                top: el.style.top,
                label: el.querySelector('span').innerText,
                iconSrc: el.querySelector('img').getAttribute('src')
            })),
            connections: activeConnections.map(conn => ({
                fromId: conn.from.dataset.id,
                toId: conn.to.dataset.id,
                cableType: conn.cableType
            })),
            orders: window.orders
        };

        const canvasJSON = JSON.stringify(state);

        try {
            // Use window.TARGET_USER_ID (the customer) instead of userId
            const response = await fetch(`/users/${window.TARGET_USER_ID}/design/save-background`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ canvasJSON: canvasJSON })
            });

            if (response.ok) {
                alert("Admin changes saved successfully!");
            } else {
                alert("Error saving changes to the server.");
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Connection error while saving.");
        }
    });
}

designForm.addEventListener('submit', (e) => {
    // 1. Prepare the state object exactly like in your saveAll function
    const state = {
        sprites: Array.from(document.querySelectorAll('.sprite')).map(el => ({
            id: el.dataset.id,
            left: el.style.left,
            top: el.style.top,
            label: el.querySelector('span').innerText,
            iconSrc: el.querySelector('img').getAttribute('src')
        })),
        connections: activeConnections.map(conn => ({
            fromId: conn.from.dataset.id,
            toId: conn.to.dataset.id,
            cableType: conn.cableType
        })),
        orders: orders
    };

    // 2. Stringify and inject into the hidden input
    const finalJSON = JSON.stringify(state);
    canvasJSONInput.value = finalJSON;

    console.log("Injected JSON into form:", finalJSON);
    // The form will now submit naturally WITH the data
});



function updateAdminStockSummary() {
    const listContainer = document.getElementById('stock-check-list');
    if (!listContainer) return;

    listContainer.innerHTML = ''; // Clear loading message

    // 1. Count items in the current 'orders' array
    const counts = {};
    window.orders.forEach(item => counts[item] = (counts[item] || 0) + 1);

    // 2. We need to grab product stock info from the <select> elements in the DOM
    // (Since the EJS already rendered the stock levels there)
    const stockMap = {};
    document.querySelectorAll('select[name="product"] option').forEach(opt => {
        // This regex extracts the stock number from your option text: "Brand Name Stock:10"
        const stockMatch = opt.text.match(/Stock:(\d+)/);
        if (stockMatch) {
            stockMap[opt.value] = parseInt(stockMatch[1]);
        }
    });

    // 3. Generate the UI rows
    for (const [name, required] of Object.entries(counts)) {
        const available = stockMap[name] || 0;
        const isLow = available < required;

        const li = document.createElement('li');
        li.className = `list-group-item d-flex justify-content-between align-items-center ${isLow ? 'list-group-item-danger' : ''}`;
        li.innerHTML = `
            <div>
                <strong>${name}</strong><br>
                <small>Needed: ${required} | Warehouse: ${available}</small>
            </div>
            ${isLow ? '⚠️' : '✅'}
        `;
        listContainer.appendChild(li);
    }

    if (Object.keys(counts).length === 0) {
        listContainer.innerHTML = '<li class="list-group-item">Design is empty</li>';
    }
}

document.getElementById('send-chat').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value;
    if (!text) return;

    // 1. Show user message immediately
    //    appendMessage(window.CURRENT_USER_USERNAME, text);
    lastTimestamp = Date.now();
    input.value = '';

    // 2. Send to your new Route
    const response = await fetch(`/conversations/${window.CURRENT_USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    // DEBUG: Log the raw response before parsing
    const rawText = await response.text();
    const data = JSON.parse(rawText);

    console.log("Raw Server Response:", rawText);


});

function appendMessage(sender, text) {
    const msgDiv = document.createElement('p');
    const b = document.createElement('b')
    msgDiv.className = `message ${sender}-msg`;
    b.innerText = sender

    msgDiv.append(b);
    msgDiv.append(" says: " + text);
    // msgDiv.innerHTML = '<b>' + sender + '</b> says: ' + text;
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
};


// close chat button

closeChat.addEventListener('click', () => {
    if (box.style.height === '500px') {
        box.style.height = '0';
        closeChat.textContent = '▲';
    }
    else {
        box.style.height = '500px';
        closeChat.textContent = '▼';
    }
});



clearChatBtn.addEventListener('click', async () => {
    if (!confirm("Clear chat history? You will not be able to recover it!")) return;

    // 1. Tell the server to delete the history
    const response = await fetch(`/conversations/${window.CURRENT_USER_ID}/clear`, {
        method: 'POST'
    });

    if (response.ok) {
        // 2. ONLY clear the UI if the server succeeded
        box.replaceChildren();
        lastTimestamp = null; // Reset this so it doesn't try to sync old stuff
        console.log("Chat history wiped.");
    }
});

//clear design button

document.getElementById('clearDesignBtn').addEventListener('click', async () => {
    // Safety check: Don't let users clear if they didn't mean to
    if (!confirm("Are you sure you want to clear your design?")) return;

    try {
        // This 'fetch' sends the POST request to your specific route
        const clearCart = confirm("Design cleared! Do you also want to empty your shopping cart?");
        const response = await fetch(`/users/${window.CURRENT_USER_ID}/design/clear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clearCart: clearCart }) // Send the choice to the server
        });

        if (response.ok) {
            // Success: Now wipe the visual elements so the user sees the result immediately
            document.querySelectorAll('.sprite').forEach(el => el.remove());
            document.querySelectorAll('line').forEach(el => el.remove());

            // Reset local variables
            window.orders = [];
            activeConnections = [];

            // Re-run summary (to show "Design is empty")
            updateAdminStockSummary();
            document.getElementById('submitApprovalBtn').disabled = true;
            updateSubmitButtonState();
            alert("Design cleared successfully.");
        } else {
            alert("Something went wrong on the server.");
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }

});

//help request
document.getElementById('request-admin').addEventListener('click', async () => {
    console.log('help button clicked');
    const response = await fetch(`/conversations/${window.CURRENT_USER_ID}/request-help`, {
        method: 'POST'
    });
    if (response.ok) {
        console.log("Help request sent. Waiting for sync loop to display bot message.");
    }
});

// --- SYNC LOOP FOR USER PAGE ---
let lastTimestamp = null;

async function syncChatWithServer() {
    try {
        // This route must return the conversation object as JSON
        const response = await fetch(`/conversations/my-status`);
        if (!response.ok) return;

        const data = await response.json();
        const messages = data.messages;

        messages.forEach(msg => {
            const msgTime = new Date(msg.timestamp).getTime();

            // Only append if it's a NEW message
            if (!lastTimestamp || msgTime > lastTimestamp) {
                // Ignore messages the user just typed (they are already in the UI)
                if (msg.sender !== window.CURRENT_USER_USERNAME && msg.sender !== 'user') {
                    // This calls your existing function!
                    appendMessage(msg.sender, msg.text);
                }
                else if (msg.sender === 'user' && window.CURRENT_USER_USERNAME !== 'user') {
                    // This handles the case where the server calls you "user" but the UI knows your name
                    appendMessage(window.CURRENT_USER_USERNAME, msg.text);
                }

                lastTimestamp = msgTime;
            }
        });

        // Visual cue: Change header color if admin is connected
        const header = document.getElementById('chat-header');
        if (data.status === 'in_progress') {
            header.classList.remove('bg-primary');
            header.classList.add('bg-success');
            header.querySelector('span').innerText = "Connected to Admin";
        }

    } catch (e) {
        console.error("Chat sync failed:", e);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Data & Build DOM
    loadAll();


    // 2. Set Button State (Now that data is definitely in window.orders)
    updateSubmitButtonState();

    // 3. Update UI Summary (Now that data is definitely in window.orders)
    updateAdminStockSummary();

    syncChatWithServer();
    setInterval(syncChatWithServer, 3000); // Then run every 3s


    console.log("Initialization complete. Current order count:", window.orders.length);
});
