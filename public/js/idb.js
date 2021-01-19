// holds db connection
let db;

// establishes a connection to IndexDB database and sets version
const request = indexedDB.open('budget_app', 1);

// emits if the db version changes
request.onupgradeneeded = function(event) {
    // saves reference to db
    const db = event.target.result;
    // creates object store called 'new_data' set to have auto-increment primary key
    db.createObjectStore('new_data', { autoIncrement: true });
}

// event handler finalizes connection to db with Object Store
request.onsuccess = function(event) {
    // saves reference to db in global variable
    db = event.target.result;

    // checks whether app is online and if so, runs function to send local db data to api
    if (navigator.onLine) {
        uploadData();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// executes if attempt is made to submit db data when internet connection is unavailable
function saveRecord(record) {
    // opens new db transaction with read and write permissions
    const transaction = db.transaction(['new_data'], 'readwrite');

    // accesses object store for 'new_data'
    const dataObjectStore = transaction.objectStore('new_data');
    
    // adds record to store with add method
    dataObjectStore.add(record);
}

function uploadData() {
    // open a transaction on db
    const transaction = db.transaction(['new_data'], 'readwrite');
    
    // accesses object store for 'new_data'
    const dataObjectStore = transaction.objectStore('new_data');

    // gets all records from object store and sets to variable
    const getAll = dataObjectStore.getAll();

    // runs after successful execution of getAll()
    getAll.onsuccess = function() {
        // if indexDB holds data, sends to api server
        if (getAll.result.length > 0) {
            fetch('route', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // opens another transaction
                const transaction = db.transaction(['new_data'], 'readwrite');
                // accesses new data object store
                const dataObjectStore = transaction.objectStore('new_data');
                // clears items in store
                dataObjectStore.clear();

                alert('All saved data has been submitted.');
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}

// listens for app coming back online
window.addEventListener('online', uploadData);
