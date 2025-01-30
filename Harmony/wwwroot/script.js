const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCall');
const remoteAudio = document.getElementById('remoteAudio');

let localStream;
let peerConnection;
const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Create a connection to the SignalR hub
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chat")
    .build();

// Handle receiving an offer
connection.on("ReceiveOffer", async (connectionId, offer) => {
    // Create a new peer connection
    peerConnection = new RTCPeerConnection(configuration);

    // Set the received offer as the remote description
    await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)));

    // Create an answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send the answer back to the signaling server
    await connection.invoke("SendAnswer", connectionId, JSON.stringify(answer));

    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            // Send the ICE candidate to the signaling server
            connection.invoke("SendIceCandidate", connectionId, JSON.stringify(event.candidate));
        }
    };

    // Handle remote stream
    peerConnection.ontrack = event => {
        remoteAudio.srcObject = event.streams[0];
    };
});

// Handle receiving an answer
connection.on("ReceiveAnswer", async (connectionId, answer) => {
    // Set the received answer as the remote description
    await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
});

// Handle receiving an ICE candidate
connection.on("ReceiveIceCandidate", async (connectionId, candidate) => {
    // Add the received ICE candidate to the peer connection
    await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
});

// Start call button logic
startCallButton.onclick = async () => {
    // Get user media (audio)
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(configuration);

    // Add local tracks to the peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Create an offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Send the offer to the signaling server
    await connection.invoke("SendOffer", "userId", JSON.stringify(offer));

    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            // Send the ICE candidate to the signaling server
            connection.invoke("SendIceCandidate", "userId", JSON.stringify(event.candidate));
        }
    };

    // Handle remote stream
    peerConnection.ontrack = event => {
        remoteAudio.srcObject = event.streams[0];
    };
};

// End call button logic
endCallButton.onclick = () => {
    if (peerConnection) {
        peerConnection.close();
        localStream.getTracks().forEach(track => track.stop());
        remoteAudio.srcObject = null;
    }
};

// Start the connection to the SignalR hub
connection.start().catch(err => console.error(err.toString()));