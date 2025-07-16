const socket = io();
let userId = null;

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const markers = {};
const userList = document.getElementById("user-list");
const redIcon = L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
});
const blueIcon = L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [32, 32],
});
socket.on("your-id", (id) => {
    userId = id;
});
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}
socket.on("recieve-location", (data) => {
    const { id, latitude, longitude } = data;
    const isSelf = id === userId;

    if (!markers[id]) {
        markers[id] = L.marker([latitude, longitude], {
            icon: isSelf ? redIcon : blueIcon,
        }).addTo(map);
    } else {
        markers[id].setLatLng([latitude, longitude]);
    }
    if (isSelf) {
        map.setView([latitude, longitude]);
    }
    updateUserList();
});
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
    updateUserList();
});
function updateUserList() {
    userList.innerHTML = "";
    Object.keys(markers).forEach((id) => {
        const li = document.createElement("li");
        li.textContent = id === userId ? "You" : `User ${id.slice(0, 5)}`;
        userList.appendChild(li);
    });
}
